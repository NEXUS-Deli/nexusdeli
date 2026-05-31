// ─── UAZAPI Service ─────────────────────────────────────────────────────────
// Integração com a API do UAZAPI de forma segura.

const BASE_URL =
  (typeof import.meta !== "undefined" ? import.meta.env?.VITE_UAZAPI_BASE_URL : undefined) ||
  (typeof process !== "undefined" ? process.env.UAZAPI_BASE_URL : undefined) ||
  "https://nexus-360.uazapi.com";

const ADMIN_TOKEN =
  (typeof import.meta !== "undefined" ? import.meta.env?.VITE_UAZAPI_ADMIN_TOKEN : undefined) ||
  (typeof process !== "undefined" ? process.env.UAZAPI_ADMIN_TOKEN : undefined) ||
  "";

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

function adminHeaders() {
  return {
    "Content-Type": "application/json",
    admintoken: ADMIN_TOKEN,
  };
}

function instanceHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    token,
  };
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Cria uma nova instância no servidor UAZAPI.
 */
export async function createInstance(name: string): Promise<CreateInstanceResponse> {
  const res = await fetch(`${BASE_URL}/instance/create`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string })?.error ?? `Erro ao criar instância (${res.status})`);
  }

  return res.json() as Promise<CreateInstanceResponse>;
}

/**
 * Dispara o processo de conexão de uma instância ao WhatsApp.
 */
export async function connectInstance(
  instanceToken: string,
  options?: { phone?: string; browser?: string }
): Promise<ConnectInstanceResponse> {
  const body: Record<string, string> = {};
  if (options?.phone) body.phone = options.phone;
  if (options?.browser) body.browser = options.browser;

  const res = await fetch(`${BASE_URL}/instance/connect`, {
    method: "POST",
    headers: instanceHeaders(instanceToken),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string })?.error ?? `Erro ao conectar instância (${res.status})`);
  }

  return res.json() as Promise<ConnectInstanceResponse>;
}

/**
 * Busca o status atual de uma instância.
 */
export async function getInstanceStatus(instanceToken: string): Promise<StatusResponse> {
  const res = await fetch(`${BASE_URL}/instance/status`, {
    method: "GET",
    headers: instanceHeaders(instanceToken),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string })?.error ?? `Erro ao buscar status (${res.status})`);
  }

  return res.json() as Promise<StatusResponse>;
}

/**
 * Deleta permanentemente uma instância.
 */
export async function deleteInstance(instanceToken: string): Promise<{ response: string; info?: string }> {
  const res = await fetch(`${BASE_URL}/instance`, {
    method: "DELETE",
    headers: instanceHeaders(instanceToken),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string })?.error ?? `Erro ao deletar instância (${res.status})`);
  }

  return res.json() as Promise<{ response: string; info?: string }>;
}

/**
 * Lista todas as instâncias do servidor.
 */
export async function listAllInstances(): Promise<UazapiInstance[]> {
  const res = await fetch(`${BASE_URL}/instance/all`, {
    method: "GET",
    headers: adminHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string })?.error ?? `Erro ao listar instâncias (${res.status})`);
  }

  return res.json() as Promise<UazapiInstance[]>;
}

