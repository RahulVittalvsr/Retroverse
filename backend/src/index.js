import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectMongo } from './db.js';
import { configureProjectStore } from './store/projectStore.js';
import { createMongoProjectStore } from './services/projectStoreMongo.js';
import { createMemoryProjectStore } from './services/projectStoreMemory.js';
import { healthRouter } from './routes/health.js';
import { projectsRouter } from './routes/projects.js';
import { suggestionsRouter } from './routes/suggestions.js';
import { exportRouter } from './routes/export.js';
import { publishRouter } from './routes/publish.js';

const app = express();

app.set('trust proxy', true);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',').map((s) => s.trim()) ?? '*',
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/export', exportRouter);
app.use('/api/publish', publishRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode ?? 500;
  res.status(status).json({ error: err.message ?? 'Internal Server Error' });
});

async function main() {
  const port = Number(process.env.PORT || 8080);
  // Prefer MongoDB, but keep a local dev fallback so the app can run without setup.
  try {
    await connectMongo();
    configureProjectStore(createMongoProjectStore());
  } catch (err) {
    console.warn('MongoDB not available; using in-memory project store.', err?.message || err);
    configureProjectStore(createMemoryProjectStore());
  }
  app.listen(port, () => {
    console.log(`RetroVerse API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

