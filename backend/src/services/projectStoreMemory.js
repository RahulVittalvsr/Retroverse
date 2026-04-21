import { randomUUID } from 'crypto';

const projects = new Map();

function nowIso() {
  return new Date();
}

function projectShape({ id, anonUserId, title, blocks }) {
  return {
    _id: id,
    anonUserId,
    title,
    blocks,
    versions: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export function createMemoryProjectStore() {
  return {
    async createProject({ anonUserId, title, blocks }) {
      const id = randomUUID();
      const p = projectShape({ id, anonUserId, title, blocks });
      projects.set(id, p);
      return p;
    },
    async listProjects({ anonUserId }) {
      return Array.from(projects.values())
        .filter((p) => p.anonUserId === anonUserId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 50)
        .map((p) => ({
          _id: p._id,
          title: p.title,
          blocks: p.blocks,
          versions: p.versions,
        }));
    },
    async getProject({ anonUserId, projectId }) {
      const p = projects.get(projectId);
      if (!p || p.anonUserId !== anonUserId) return null;
      return p;
    },
    async saveProject({ anonUserId, projectId, title, blocks }) {
      const p = projects.get(projectId);
      if (!p || p.anonUserId !== anonUserId) return null;
      p.title = title ?? p.title;
      p.blocks = blocks ?? p.blocks;
      p.updatedAt = nowIso();
      return p;
    },
    async saveVersionSlot({ anonUserId, projectId, slotNumber, label, blocks }) {
      const p = projects.get(projectId);
      if (!p || p.anonUserId !== anonUserId) return null;
      const snapshot = {
        slotNumber,
        label: label ?? '',
        blocksSnapshot: blocks ?? p.blocks,
        createdAt: new Date(),
      };
      const idx = p.versions.findIndex((v) => v.slotNumber === slotNumber);
      if (idx >= 0) p.versions[idx] = snapshot;
      else p.versions.push(snapshot);
      p.updatedAt = nowIso();
      return snapshot;
    },
    async restoreVersionSlot({ anonUserId, projectId, slotNumber }) {
      const p = projects.get(projectId);
      if (!p || p.anonUserId !== anonUserId) return null;
      const v = p.versions.find((x) => x.slotNumber === slotNumber);
      if (!v) return null;
      p.blocks = v.blocksSnapshot ?? [];
      p.updatedAt = nowIso();
      return p;
    },
  };
}

