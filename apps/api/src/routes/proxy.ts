import { Router, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { proxyRequestSchema } from '../validators/proxy';
import { executeProxyRequest } from '../services/proxyService';

export const proxyRouter = Router();

/**
 * POST /api/proxy
 *
 * Accepts a structured request description and forwards it to the target URL,
 * returning the full response (status, headers, body, timing).
 */
proxyRouter.post('/', async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // ── Validate incoming payload ───────────────────────────────────────────
  let input;
  try {
    input = proxyRequestSchema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
      });
    }
    return res.status(400).json({ success: false, error: 'Invalid request body' });
  }

  // ── Execute the proxied request ─────────────────────────────────────────
  try {
    const response = await executeProxyRequest(input, requestId);
    return res.status(200).json({ success: true, data: response });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return res.status(502).json({
      success: false,
      error: message,
      requestId,
    });
  }
});
