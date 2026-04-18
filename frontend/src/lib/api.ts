const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export const apiClient = {
  auth: {
    register: (email: string, password: string) =>
      api<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      api<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: (token: string) =>
      api<{ user: User }>('/me', { token }),
  },

  bots: {
    list: (token: string) =>
      api<{ bots: Bot[] }>('/bots', { token }),
    create: (token: string, data: CreateBotData) =>
      api<Bot>('/bots', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
    get: (token: string, id: string) =>
      api<{ bot: BotDetail }>(`/bots/${id}`, { token }),
    update: (token: string, id: string, data: Partial<CreateBotData>) =>
      api<{ bot: Bot }>(`/bots/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
    delete: (token: string, id: string) =>
      api<{ message: string }>(`/bots/${id}`, {
        method: 'DELETE',
        token,
      }),
  },

  context: {
    addText: (token: string, botId: string, content: string) =>
      api<{ context: Context }>('/context/text', {
        method: 'POST',
        token,
        body: JSON.stringify({ botId, content }),
      }),
    addFaq: (token: string, botId: string, faqs: FAQ[]) =>
      api<{ context: Context }>('/context/faq', {
        method: 'POST',
        token,
        body: JSON.stringify({ botId, faqs }),
      }),
    list: (token: string, botId: string) =>
      api<{ contexts: Context[] }>(`/context/${botId}`, { token }),
    delete: (token: string, botId: string, contextId: string) =>
      api<{ message: string }>(`/context/${botId}/${contextId}`, {
        method: 'DELETE',
        token,
      }),
  },

  documents: {
    upload: async (token: string, botId: string, file: File) => {
      const formData = new FormData();
      formData.append('botId', botId);
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error);
      }

      return res.json();
    },
    list: (token: string, botId: string) =>
      api<{ documents: Document[] }>(`/documents/${botId}`, { token }),
    delete: (token: string, botId: string, documentId: string) =>
      api<{ message: string }>(`/documents/${botId}/${documentId}`, {
        method: 'DELETE',
        token,
      }),
  },

  chat: {
    send: (botId: string, message: string) =>
      api<{ response: string }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ botId, message }),
      }),
  },
};

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Bot {
  id: string;
  name: string;
  welcomeMessage: string;
  themeColor: string;
  provider: string;
  createdAt: string;
  _count?: { contexts: number; documents: number };
}

export interface BotDetail extends Bot {
  contexts: Context[];
  documents: Document[];
}

export interface Context {
  id: string;
  type: string;
  content: string | FAQ[];
  createdAt: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Document {
  id: string;
  fileUrl: string;
  summary: string;
  createdAt: string;
}

export interface CreateBotData {
  name: string;
  apiKey: string;
  welcomeMessage?: string;
  themeColor?: string;
  provider?: string;
}
