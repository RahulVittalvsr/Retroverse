import { Router } from 'express';
import { getSuggestions } from '../services/aiTemplates.js';
import { sanitizeBlocks } from '../services/sanitize.js';

export const suggestionsRouter = Router();

suggestionsRouter.get('/', async (req, res, next) => {
  try {
    const genre = req.query.genre ?? 'arcade';
    const promptText = req.query.prompt ?? '';
    const blocks = await getSuggestions({ genre, promptText });
    const safeBlocks = sanitizeBlocks(blocks);
    res.json({ blocks: safeBlocks });
  } catch (err) {
    next(err);
  }
});

