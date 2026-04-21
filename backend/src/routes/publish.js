import { Router } from 'express';
import { createExportFiles } from '../services/exporter.js';
import { sanitizeBlocks } from '../services/sanitize.js';
import { zipToBuffer } from '../services/zipFiles.js';
import { publishZipToNetlify } from '../services/netlify.js';
import { projectStore } from '../store/projectStore.js';

export const publishRouter = Router();

function requireAnonUserId(req) {
  const header = req.header('x-anon-user-id');
  return header ? String(header) : null;
}

async function buildZipFromRequest({ projectId, anonUserId, blocks }) {
  let safeBlocks = sanitizeBlocks(blocks ?? []);
  if (projectId) {
    const project = await projectStore.getProject({ anonUserId, projectId });
    if (!project) throw new Error('Project not found');
    safeBlocks = sanitizeBlocks(project.blocks);
  }
  const files = createExportFiles({ blocks: safeBlocks });
  return zipToBuffer(files);
}

publishRouter.post('/netlify', async (req, res, next) => {
  try {
    const anonUserId = requireAnonUserId(req);
    if (!anonUserId) return res.status(400).json({ error: 'Missing anonUserId' });

    const { projectId, blocks, siteId, branch } = req.body ?? {};

    const netlifySiteId = siteId || process.env.NETLIFY_SITE_ID;
    const netlifyToken = process.env.NETLIFY_TOKEN;

    if (!netlifySiteId || !netlifyToken) {
      return res.status(400).json({
        error: 'Netlify is not configured. Set NETLIFY_SITE_ID and NETLIFY_TOKEN in backend/.env.',
      });
    }

    const zipBuffer = await buildZipFromRequest({ projectId, anonUserId, blocks });

    const deploy = await publishZipToNetlify({
      zipBuffer,
      siteId: netlifySiteId,
      token: netlifyToken,
      branch,
    });

    res.json({ ok: true, deploy });
  } catch (err) {
    next(err);
  }
});

publishRouter.post('/firebase', (req, res) => {
  res.status(501).json({
    error:
      'Firebase Hosting publish requires additional REST steps (create version, upload assets, release). Implemented later.',
  });
});

