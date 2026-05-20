import { Request, Response, NextFunction } from "express";
import { Pool } from "pg"; // Exemplo com pg driver para PostgreSQL

// ─── Configurações e Conexão com o Banco ──────────────────────────────────────
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const UAZAPI_BASE_URL = process.env.UAZAPI_BASE_URL ?? "https://nexus-360.uazapi.com";
const UAZAPI_ADMIN_TOKEN = process.env.UAZAPI_ADMIN_TOKEN ?? "";

// Interface da Instância no Banco de Dados
interface DbWhatsappInstance {
  id: string; // ID gerado pela UAZAPI ou gerado localmente
  name: string;
  token: string;
  delivery_id: string; // Chave estrangeira que identifica o Tenant (Dono da conta)
  created_at: Date;
}

// ─── MIDDLEWARE DE AUTENTICAÇÃO E ISOLAMENTO ──────────────────────────────────

/**
 * Interface estendida do Express Request para carregar dados do usuário autenticado.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    deliveryId: string; // Tenant ID associado a este usuário
  };
}

/**
 * Middleware para validar se a instância solicitada pertence ao delivery_id do usuário logado.
 * Evita ataques de manipulação de parâmetros (IDOR).
 */
export async function validateInstanceOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const deliveryId = req.user?.deliveryId;
  const { instanceId } = req.params;

  if (!deliveryId) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  if (!instanceId) {
    res.status(400).json({ error: "O ID da instância é obrigatório." });
    return;
  }

  try {
    // Busca a instância no banco local para verificar a propriedade
    const result = await db.query<DbWhatsappInstance>(
      "SELECT * FROM whatsapp_instances WHERE id = $1 AND delivery_id = $2",
      [instanceId, deliveryId]
    );

    if (result.rowCount === 0) {
      // Retorna 403 (ou 404 para ocultar existência de outros recursos de terceiros)
      res.status(403).json({ error: "Acesso negado. Esta instância não pertence à sua conta." });
      return;
    }

    // Armazena a instância encontrada no request para ser usada pelo controller
    (req as any).whatsappInstance = result.rows[0];
    next();
  } catch (error) {
    console.error("Erro no middleware de validação de posse:", error);
    res.status(500).json({ error: "Erro interno ao validar permissão." });
  }
}

// ─── SERVIÇO DE INTEGRAÇÃO (WHATSAPP SERVICE) ──────────────────────────────────
export class WhatsappBackendService {
  /**
   * Lista apenas as instâncias de um delivery (tenant) específico
   * e consulta em lote/sequência o status na UAZAPI de forma segura.
   */
  static async listInstances(deliveryId: string) {
    // 1. Busca apenas as instâncias cadastradas para o delivery no banco local
    const queryResult = await db.query<DbWhatsappInstance>(
      "SELECT id, name, token, delivery_id FROM whatsapp_instances WHERE delivery_id = $1 ORDER BY created_at DESC",
      [deliveryId]
    );

    const dbInstances = queryResult.rows;
    const instancesWithStatus = [];

    // 2. Para cada instância do usuário, busca o status real de conexão na UAZAPI de forma isolada
    for (const inst of dbInstances) {
      try {
        const response = await fetch(`${UAZAPI_BASE_URL}/instance/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: inst.token, // Token restrito da instância, sem usar o Admin Token
          },
        });

        if (response.ok) {
          const uazStatus = await response.json();
          instancesWithStatus.push({
            id: inst.id,
            name: inst.name,
            status: uazStatus.instance?.status ?? "disconnected",
            profileName: uazStatus.instance?.profileName ?? null,
            profilePicUrl: uazStatus.instance?.profilePicUrl ?? null,
            isBusiness: uazStatus.instance?.isBusiness ?? false,
            platform: uazStatus.instance?.plataform ?? null,
            connected: uazStatus.status?.connected ?? false,
            loggedIn: uazStatus.status?.loggedIn ?? false,
          });
        } else {
          // Se falhar na UAZAPI, retorna o estado cadastrado no banco local
          instancesWithStatus.push({
            id: inst.id,
            name: inst.name,
            status: "disconnected",
            connected: false,
            loggedIn: false,
          });
        }
      } catch (err) {
        console.error(`Erro ao consultar status da instância ${inst.id} na UAZAPI:`, err);
        instancesWithStatus.push({
          id: inst.id,
          name: inst.name,
          status: "disconnected",
          connected: false,
          loggedIn: false,
        });
      }
    }

    return instancesWithStatus;
  }

  /**
   * Cria a instância na UAZAPI e salva o registro associado ao deliveryId
   */
  static async createInstance(deliveryId: string, name: string) {
    // 1. Cria a instância na UAZAPI usando o Token de Administrador
    const response = await fetch(`${UAZAPI_BASE_URL}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        admintoken: UAZAPI_ADMIN_TOKEN,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errPayload = await response.json().catch(() => ({}));
      throw new Error(errPayload.error ?? "Falha ao criar instância na UAZAPI.");
    }

    const uazResult = await response.json();
    const { token, instance } = uazResult; // token da instância e objeto de retorno

    // 2. Salva no banco de dados local associando ao delivery_id
    const insertResult = await db.query<DbWhatsappInstance>(
      `INSERT INTO whatsapp_instances (id, name, token, delivery_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, token, delivery_id`,
      [instance.id, name, token, deliveryId]
    );

    return insertResult.rows[0];
  }

  /**
   * Deleta uma instância na UAZAPI e no banco de dados local
   */
  static async deleteInstance(instanceId: string, instanceToken: string) {
    // 1. Deleta na UAZAPI usando o token da instância específica
    const response = await fetch(`${UAZAPI_BASE_URL}/instance`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        token: instanceToken,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errPayload = await response.json().catch(() => ({}));
      throw new Error(errPayload.error ?? "Falha ao remover instância na UAZAPI.");
    }

    // 2. Remove do banco de dados local
    await db.query("DELETE FROM whatsapp_instances WHERE id = $1", [instanceId]);
  }
}

// ─── BACKEND CONTROLLER ──────────────────────────────────────────────────────
export class WhatsappBackendController {
  /**
   * Endpoint: GET /api/whatsapp/instances
   */
  static async getInstances(req: AuthenticatedRequest, res: Response) {
    const deliveryId = req.user?.deliveryId;

    if (!deliveryId) {
      return res.status(401).json({ error: "Sessão inválida ou não autenticado." });
    }

    try {
      const instances = await WhatsappBackendService.listInstances(deliveryId);
      return res.status(200).json(instances);
    } catch (error) {
      console.error("Erro no controller getInstances:", error);
      return res.status(500).json({ error: "Erro ao listar instâncias do WhatsApp." });
    }
  }

  /**
   * Endpoint: POST /api/whatsapp/instances
   */
  static async createInstance(req: AuthenticatedRequest, res: Response) {
    const deliveryId = req.user?.deliveryId;
    const { name } = req.body;

    if (!deliveryId) {
      return res.status(401).json({ error: "Sessão inválida ou não autenticado." });
    }

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "O nome da instância é obrigatório." });
    }

    try {
      const newInstance = await WhatsappBackendService.createInstance(deliveryId, name);
      return res.status(201).json(newInstance);
    } catch (error) {
      console.error("Erro no controller createInstance:", error);
      return res.status(500).json({ error: "Erro ao criar instância do WhatsApp." });
    }
  }

  /**
   * Endpoint: DELETE /api/whatsapp/instances/:instanceId
   * (Esta rota utiliza o middleware validateInstanceOwnership para proteção)
   */
  static async deleteInstance(req: AuthenticatedRequest, res: Response) {
    // Recupera a instância autenticada e validada pelo middleware
    const inst = (req as any).whatsappInstance as DbWhatsappInstance;

    try {
      await WhatsappBackendService.deleteInstance(inst.id, inst.token);
      return res.status(200).json({ message: "Instância deletada com sucesso local e remotamente." });
    } catch (error) {
      console.error("Erro no controller deleteInstance:", error);
      return res.status(500).json({ error: "Erro ao deletar instância." });
    }
  }
}
