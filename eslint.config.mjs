import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
export default defineConfig([...next, globalIgnores(['.vercel/**', 'out/**', '.next/**', 'next-env.d.ts', 'public/sw.js', 'public/geo-worker.js', 'public/maplibre-worker.mjs', 'test-results/**', 'playwright-report/**'])]);
