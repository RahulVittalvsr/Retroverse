import { Router } from 'express';
import { randomUUID } from 'crypto';
import { sanitizeBlocks } from '../services/sanitize.js';
import { projectStore } from '../store/projectStore.js';

export const projectsRouter = Router();

function requireAnonUserId(req) {
  const header = req.header('x-anon-user-id');
  const q = req.query.anonUserId;
  const anon = header || q;
  return anon ? String(anon) : null;
}

projectsRouter.post('/', async (req, res, next) => {
  try {
    const anonUserId = requireAnonUserId(req) ?? randomUUID();
    const title = String(req.body?.title ?? 'Untitled Project').trim().slice(0, 80);
    const blocks = sanitizeBlocks(req.body?.blocks ?? []);

    const project = await projectStore.createProject({
      anonUserId,
      title,
      blocks,
    });

    res.status(201).json({
      projectId: project._id?.toString?.() ?? project._id,
      anonUserId,
      title: project.title,
      blocks: project.blocks,
      versions: project.versions,
    });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get('/', async (req, res, next) => {
  try {
    const anonUserId = requireAnonUserId(req);
    if (!anonUserId) {
      res.json({ projects: [] });
      return;
    }
    const projects = await projectStore.listProjects({ anonUserId });

    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const anonUserId = requireAnonUserId(req);
    if (!anonUserId) return res.status(400).json({ error: 'Missing anonUserId' });

    const project = await projectStore.getProject({ anonUserId, projectId });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json({
      projectId: project._id?.toString?.() ?? project._id,
      title: project.title,
      blocks: project.blocks,
      versions: project.versions,
      updatedAt: project.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// Save current blocks (latest state).
projectsRouter.put('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const anonUserId = requireAnonUserId(req);
    if (!anonUserId) return res.status(400).json({ error: 'Missing anonUserId' });

    const blocks = sanitizeBlocks(req.body?.blocks ?? []);
    const title = req.body?.title ? String(req.body.title).trim().slice(0, 80) : undefined;

    const updated = await projectStore.saveProject({
      anonUserId,
      projectId,
      title,
      blocks,
    });

    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Save a snapshot into a slot (like save-game).
projectsRouter.post('/:projectId/versions', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const anonUserId = requireAnonUserId(req);
    if (!anonUserId) return res.status(400).json({ error: 'Missing anonUserId' });

    const slotNumber = Number(req.body?.slotNumber);
    if (!Number.isFinite(slotNumber) || slotNumber < 1 || slotNumber > 5) {
      return res.status(400).json({ error: 'slotNumber must be 1..5' });
    }

    const rawBlocks = req.body?.blocks;
    const blocks = rawBlocks ? sanitizeBlocks(rawBlocks) : undefined;
    const label = String(req.body?.label ?? '').trim().slice(0, 80);

    const snapshot = await projectStore.saveVersionSlot({
      anonUserId,
      projectId,
      slotNumber,
      label,
      blocks,
    });

    if (!snapshot) return res.status(404).json({ error: 'Project not found' });
    res.json({ ok: true, slotNumber });
  } catch (err) {
    next(err);
  }
});

// Restore blocks from a slot snapshot.
projectsRouter.post('/:projectId/restore', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const anonUserId = requireAnonUserId(req);
    if (!anonUserId) return res.status(400).json({ error: 'Missing anonUserId' });

    const slotNumber = Number(req.body?.slotNumber);
    if (!Number.isFinite(slotNumber) || slotNumber < 1 || slotNumber > 5) {
      return res.status(400).json({ error: 'slotNumber must be 1..5' });
    }

    const restored = await projectStore.restoreVersionSlot({ anonUserId, projectId, slotNumber });
    if (!restored) return res.status(404).json({ error: 'Version slot is empty' });
    const blocks = sanitizeBlocks(restored.blocks ?? []);
    // Keep the store consistent by re-saving sanitized blocks.
    await projectStore.saveProject({ anonUserId, projectId, blocks });
    res.json({ ok: true, blocks });
  } catch (err) {
    next(err);
  }
});

