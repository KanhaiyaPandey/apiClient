import { createApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const app = createApp();

app.listen(PORT, () => {
  console.warn(`🚀 API server running on http://localhost:${PORT}`);
  console.warn(`   Environment: ${process.env.NODE_ENV ?? 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.warn('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
