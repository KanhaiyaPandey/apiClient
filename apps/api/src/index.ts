import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app';

function loadEnvFile(envFilePath: string) {
  if (!fs.existsSync(envFilePath)) return;

  const contents = fs.readFileSync(envFilePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    // Strip simple quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Do not override actual environment variables
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Load workspace-local env file (apps/api/.env) so runtime flags like
// `ALLOW_INTERNAL_REQUESTS=true` are honored in dev and `dist` runs.
loadEnvFile(path.resolve(__dirname, '../.env'));

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
