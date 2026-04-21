const defaultApiBase = 'http://localhost:8080';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || defaultApiBase;
}

function headersForJson() {
  return { 'content-type': 'application/json' };
}

async function api(path, { method = 'GET', anonUserId, body, query } = {}) {
  const base = getApiBaseUrl();
  const url = new URL(path, base);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      ...headersForJson(),
      ...(anonUserId ? { 'x-anon-user-id': anonUserId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;
  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const apiClient = {
  async listProjects(anonUserId) {
    return api('/api/projects', { anonUserId });
  },
  async createProject({ anonUserId, title, blocks }) {
    return api('/api/projects', { method: 'POST', anonUserId, body: { title, blocks } });
  },
  async getProject({ anonUserId, projectId }) {
    return api(`/api/projects/${projectId}`, { anonUserId });
  },
  async saveProject({ anonUserId, projectId, title, blocks }) {
    return api(`/api/projects/${projectId}`, { method: 'PUT', anonUserId, body: { title, blocks } });
  },
  async saveVersionSlot({ anonUserId, projectId, slotNumber, label, blocks }) {
    return api(`/api/projects/${projectId}/versions`, {
      method: 'POST',
      anonUserId,
      body: { slotNumber, label, blocks },
    });
  },
  async restoreVersionSlot({ anonUserId, projectId, slotNumber }) {
    return api(`/api/projects/${projectId}/restore`, {
      method: 'POST',
      anonUserId,
      body: { slotNumber },
    });
  },
  async getSuggestions({ genre, prompt, anonUserId }) {
    const path = '/api/suggestions';
    const base = getApiBaseUrl();
    const url = new URL(path, base);
    url.searchParams.set('genre', genre || 'arcade');
    if (prompt) url.searchParams.set('prompt', prompt);

    const res = await fetch(url.toString(), {
      headers: {
        ...(anonUserId ? { 'x-anon-user-id': anonUserId } : {}),
      },
    });
    const text = await res.text();
    const data = text ? safeJsonParse(text) : null;
    if (!res.ok) {
      throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
    }
    return data;
  },
  async exportFiles({ anonUserId, projectId, blocks }) {
    return api('/api/export', { method: 'POST', anonUserId, body: { projectId, blocks } });
  },
  async exportZipDownload({ anonUserId, projectId, blocks }) {
    const base = getApiBaseUrl();
    const url = new URL('/api/export/download', base);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(anonUserId ? { 'x-anon-user-id': anonUserId } : {}),
      },
      body: JSON.stringify({ projectId, blocks }),
    });
    if (!res.ok) {
      const t = await res.text();
      let data = null;
      try {
        data = JSON.parse(t);
      } catch {
        // ignore
      }
      throw new Error(data?.error || data?.message || `Export failed (${res.status})`);
    }
    return res.blob();
  },
  async publishNetlify({ anonUserId, projectId, blocks, siteId, branch }) {
    return api('/api/publish/netlify', {
      method: 'POST',
      anonUserId,
      body: { projectId, blocks, siteId, branch },
    });
  },
};

