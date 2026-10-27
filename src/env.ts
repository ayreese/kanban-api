// Load variables from .env when present. Imported first in index.ts so they
// are set before anything else reads process.env. In hosted environments
// the variables come from the platform and there is no .env file.
// process.loadEnvFile needs Node 20.12+.
try {
  (process as any).loadEnvFile?.();
} catch {
  // No .env file: rely on the real environment.
}
