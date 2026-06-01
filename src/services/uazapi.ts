// ─── UAZAPI Service ─────────────────────────────────────────────────────────
// Cliente proxy para a API do UAZAPI via Vercel Serverless Functions.
import { supabase } from "@/lib/supabase";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface UazapiInstance {
  id: string;
  name: string;
  token: string;
  status: "disconnected" | "connecting" | "connected";
  qrcode?: string;       // base64 da imagem do QR Code (quando em processo de conexão)
  paircode?: string;     // código de pareamento alternativo
  profileName?: string;
  profilePicUrl?: string;
  isBusiness?: boolean;
  plataform?: string;
  owner?: string;
  lastDisconnect?: string;
  lastDisconnectReason?: string;
  created?: string;
  updated?: string;
}

export interface UazapiStatus {
  connected: boolean;
  loggedIn: boolean;
  jid?: { user: string; agent: number; device: number; server: string } | null;
}

export interface CreateInstanceResponse {
  response: string;
  instance: UazapiInstance;
  connected: boolean;
  loggedIn: boolean;
  name: string;
  token: string;
  info?: string;
}

export interface ConnectInstanceResponse {
  connected: boolean;
  loggedIn: boolean;
  jid: unknown;
  instance: UazapiInstance;
}

export interface StatusResponse {
  instance: UazapiInstance;
  status: UazapiStatus;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token || ""}`,
  };
}

// ─── Proxy API Calls ─────────────────────────────────────────────────────────

/**
 * Cria uma nova instância no servidor UAZAPI via Serverless Function.
 */
export async function createInstance(name: string, companyId: string): Promise<CreateInstanceResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/uazapi/create-instance", {
    method: "POST",
    headers,
    body: JSON.stringify({ name, companyId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ao criar instância (${res.status})`);
  }

  return res.json() as Promise<CreateInstanceResponse>;
}

/**
 * Dispara o processo de conexão de uma instância ao WhatsApp via Serverless Function.
 */
export async function connectInstance(
  instanceToken: string,
  options?: { phone?: string; browser?: string }
): Promise<ConnectInstanceResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/uazapi/connect", {
    method: "POST",
    headers,
    body: JSON.stringify({ instanceToken, options }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ao conectar instância (${res.status})`);
  }

  return res.json() as Promise<ConnectInstanceResponse>;
}

/**
 * Busca o status atual de uma instância via Serverless Function.
 */
export async function getInstanceStatus(instanceToken: string): Promise<StatusResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/uazapi/status", {
    method: "POST",
    headers,
    body: JSON.stringify({ instanceToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ao buscar status (${res.status})`);
  }

  return res.json() as Promise<StatusResponse>;
}

/**
 * Deleta permanentemente uma instância via Serverless Function.
 */
export async function deleteInstance(instanceToken: string): Promise<{ response: string; info?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/uazapi/delete-instance", {
    method: "POST",
    headers,
    body: JSON.stringify({ instanceToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ao deletar instância (${res.status})`);
  }

  return res.json() as Promise<{ response: string; info?: string }>;
}
