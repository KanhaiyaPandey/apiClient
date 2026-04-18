import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const color =
      res.statusCode >= 500
        ? '\x1b[31m'
        : res.statusCode >= 400
          ? '\x1b[33m'
          : res.statusCode >= 200
            ? '\x1b[32m'
            : '\x1b[37m';

    console.warn(
      `${color}${req.method}\x1b[0m ${req.path} → ${color}${res.statusCode}\x1b[0m (${duration}ms)`
    );
  });

  next();
};
