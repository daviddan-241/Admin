const API = "/api";

function getAdminKey(): string {
  return localStorage.getItem("persona_admin_key") || "hannah2024!";
}

export function setAdminKey(key: string) {
  localStorage.setItem("persona_admin_key", key);
}

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getAdminKey(),
      ...(opts.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export type Stats = {
  totalMessages: number;
  totalCalls: number;
  totalRequests: number;
  totalTips: number;
  totalRevenue: number;
};

export type ChatSession = {
  id: number;
  fanName: string;
  fanEmail: string;
  fanAvatarUrl?: string | null;
  freeUsed: number;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: number;
  sessionId: number;
  senderType: "fan" | "hannah";
  message: string;
  amountPaid: number;
  isRead: boolean;
  createdAt: string;
};

export type Post = {
  id: number;
  imageUrl: string | null;
  videoUrl: string | null;
  caption: string | null;
  content: string | null;
  platform: string;
  isVip: boolean;
  isPrivate: boolean;
  externalId: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export type SocialConfig = {
  enabled: boolean;
  intervalHours: number;
  xHandle: string;
  tiktokHandle: string;
  hasXToken: boolean;
  hasRapidApiKey: boolean;
};

export type PlatformSettings = {
  flutterwavePublicKey: string;
  currency: string;
  msgPrice: number;
  msgFreeLimit: number;
  subMonthly: number;
  subQuarterly: number;
  subLifetime: number;
  requestPrice: number;
  tipMin: number;
  callWa5: number;
  callZoom15: number;
  callZoom30: number;
  callPrivate60: number;
  whatsappNumber: string;
  instagramUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
  onlyfansUrl: string;
  creatorBio: string;
  creatorTagline: string;
  xHandle: string;
  tiktokHandle: string;
  xBearerToken: string;
  rapidApiKey: string;
  githubRemote: string;
  adminPassword: string;
  _raw?: {
    xBearerToken: string;
    rapidApiKey: string;
    githubRemote: string;
    adminPassword: string;
    flutterwaveSecretKey: string;
  };
};

export const api = {
  stats: () => apiFetch<Stats>("/stats"),
  chatSessions: () => apiFetch<(ChatSession & { unreadCount: number; lastMessage: ChatMessage | null })[]>("/chat/admin/sessions"),
  chatMessages: (sessionId: number) =>
    apiFetch<{ session: ChatSession; messages: ChatMessage[] }>(`/chat/admin/${sessionId}/messages`),
  sendReply: (sessionId: number, message: string) =>
    apiFetch<ChatMessage>(`/chat/admin/${sessionId}/reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  aiSuggestReply: (sessionId: number) =>
    apiFetch<{ suggestion: string }>(`/chat/admin/${sessionId}/ai-suggest`, {
      method: "POST",
    }),
  posts: () => apiFetch<Post[]>("/posts"),
  syncConfig: () => apiFetch<SocialConfig>("/social/sync/config"),
  updateSyncConfig: (data: Partial<SocialConfig>) =>
    apiFetch<SocialConfig>("/social/sync/config", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  syncX: (handle: string) =>
    apiFetch<{ synced: number; errors: string[] }>("/social/sync/x", {
      method: "POST",
      body: JSON.stringify({ handle }),
    }),
  syncTikTok: (handle: string) =>
    apiFetch<{ synced: number; errors: string[] }>("/social/sync/tiktok", {
      method: "POST",
      body: JSON.stringify({ handle }),
    }),
  syncAll: () =>
    apiFetch<Record<string, { synced: number; errors: string[] }>>("/social/sync/all", {
      method: "POST",
    }),
  settings: () => apiFetch<PlatformSettings>("/settings"),
  updateSettings: (data: Partial<PlatformSettings>) =>
    apiFetch<PlatformSettings>("/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
