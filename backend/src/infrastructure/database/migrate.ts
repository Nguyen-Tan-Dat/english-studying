import fs from 'node:fs/promises'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import pg from 'pg'; import { env } from '../../config/env.js';
const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
try { const files = (await fs.readdir(directory)).filter((f)=>f.endsWith('.sql')).sort(); for (const file of files) { console.log(`Applying ${file}`); await pool.query(await fs.readFile(path.join(directory,file),'utf8')); } } finally { await pool.end(); }
