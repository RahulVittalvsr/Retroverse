import { Router } from 'express';
import { createExportFiles } from '../services/exporter.js';
import { sanitizeBlocks } from '../services/sanitize.js';
import { zipToBuffer } from '../services/zipFiles.js';
import { projectStore } from '../store/projectStore.js';

export const exportRouter = Router();

function requireAnonUserId(req) {
  const header = req.header('x-anon-user-id');
  return header ? String(header) : null;
}

exportRouter.post('/', async (req, res, next) => {
  try {
    const anonUserId = requireAnonUserId(req);
    const projectId = req.body?.projectId;
    const rawBlocks = req.body?.blocks;

    let blocks = sanitizeBlocks(rawBlocks ?? []);
    if (projectId) {
      if (!anonUserId) return res.status(400).json({ error: 'Missing anonUserId' });
      const project = await projectStore.getProject({ anonUserId, projectId });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      blocks = sanitizeBlocks(project.blocks);
    }

    const files = createExportFiles({ blocks });
    res.json({ files });
  } catch (err) {
    next(err);
  }
});

exportRouter.post('/download', async (req, res, next) => {
  try {
    const anonUserId = requireAnonUserId(req);
    const projectId = req.body?.projectId;
    const rawBlocks = req.body?.blocks;
    if (projectId && !anonUserId) return res.status(400).json({ error: 'Missing anonUserId' });

    let blocks = sanitizeBlocks(rawBlocks ?? []);
    if (projectId) {
      const project = await projectStore.getProject({ anonUserId, projectId });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      blocks = sanitizeBlocks(project.blocks);
    }

    const files = createExportFiles({ blocks });
    const zipBuffer = await zipToBuffer(files);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="retroverse-export.zip"`);
    res.send(zipBuffer);
  } catch (err) {
    next(err);
  }
});

