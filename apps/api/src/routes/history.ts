import { Router, type Request, type Response } from 'express';
import type { HistoryEntry } from '@apiclient/utils';
import { generateId } from '@apiclient/utils';

export const historyRouter = Router();

// Circular buffer — keep last 200 entries
const MAX_HISTORY = 200;
const history: HistoryEntry[] = [];

// GET /api/history
historyRouter.get('/', (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, MAX_HISTORY);
  res.json({ data: history.slice(-limit).reverse() });
});

// POST /api/history
historyRouter.post('/', (req: Request, res: Response) => {
  const entry: HistoryEntry = {
    id: generateId(),
    request: req.body.request,
    response: req.body.response,
    timestamp: new Date().toISOString(),
  };
  history.push(entry);
  if (history.length > MAX_HISTORY) history.shift();
  res.status(201).json({ data: entry });
});

// DELETE /api/history  — clear all
historyRouter.delete('/', (_req: Request, res: Response) => {
  history.length = 0;
  res.status(204).send();
});

// DELETE /api/history/:id
historyRouter.delete('/:id', (req: Request, res: Response) => {
  const idx = history.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Entry not found' });
  history.splice(idx, 1);
  res.status(204).send();
});
