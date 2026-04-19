import { Router, type Request, type Response } from 'express';
import { z, ZodError } from 'zod';
import { generateId } from '@apiclient/utils';
import type { Collection } from '@apiclient/utils';

export const collectionsRouter = Router();

// In-memory store (swap for a DB in production)
const store = new Map<string, Collection>();

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const upsertRequestSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  url: z.string(),
  headers: z.array(z.any()).default([]),
  params: z.array(z.any()).default([]),
  body: z.any().default({ type: 'none', content: '' }),
  auth: z.any().default({ type: 'none' }),
});

// GET /api/collections
collectionsRouter.get('/', (_req: Request, res: Response) => {
  return res.json({ data: Array.from(store.values()) });
});

// POST /api/collections
collectionsRouter.post('/', (req: Request, res: Response) => {
  try {
    const parsed = createCollectionSchema.parse(req.body);
    const now = new Date().toISOString();
    const collection: Collection = {
      id: generateId(),
      name: parsed.name,
      description: parsed.description,
      requests: [],
      createdAt: now,
      updatedAt: now,
    };
    store.set(collection.id, collection);
    return res.status(201).json({ data: collection });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({ error: 'Validation failed', details: err.errors });
    }
    return res.status(400).json({ error: 'Bad request' });
  }
});

// GET /api/collections/:id
collectionsRouter.get('/:id', (req: Request, res: Response) => {
  const col = store.get(req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection not found' });
  return res.json({ data: col });
});

// PATCH /api/collections/:id
collectionsRouter.patch('/:id', (req: Request, res: Response) => {
  const col = store.get(req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection not found' });

  const updated: Collection = {
    ...col,
    name: req.body.name ?? col.name,
    description: req.body.description ?? col.description,
    updatedAt: new Date().toISOString(),
  };
  store.set(col.id, updated);
  return res.json({ data: updated });
});

// DELETE /api/collections/:id
collectionsRouter.delete('/:id', (req: Request, res: Response) => {
  if (!store.has(req.params.id)) return res.status(404).json({ error: 'Collection not found' });
  store.delete(req.params.id);
  return res.status(204).send();
});

// POST /api/collections/:id/requests  — add a request to a collection
collectionsRouter.post('/:id/requests', (req: Request, res: Response) => {
  const col = store.get(req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection not found' });

  try {
    const parsed = upsertRequestSchema.parse(req.body);
    const now = new Date().toISOString();
    const request = {
      ...parsed,
      id: parsed.id ?? generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updated: Collection = {
      ...col,
      requests: [...col.requests.filter((r) => r.id !== request.id), request as any],
      updatedAt: now,
    };
    store.set(col.id, updated);
    return res.status(201).json({ data: request });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({ error: 'Validation failed', details: err.errors });
    }
    return res.status(400).json({ error: 'Bad request' });
  }
});

// DELETE /api/collections/:id/requests/:requestId
collectionsRouter.delete('/:id/requests/:requestId', (req: Request, res: Response) => {
  const col = store.get(req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection not found' });

  const updated: Collection = {
    ...col,
    requests: col.requests.filter((r) => r.id !== req.params.requestId),
    updatedAt: new Date().toISOString(),
  };
  store.set(col.id, updated);
  return res.status(204).send();
});
