import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[ErrorHandler]', err);

  const status = (err as { status?: number }).status ?? 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message ?? 'Something went wrong';

  res.status(status).json({ success: false, error: message });
};
