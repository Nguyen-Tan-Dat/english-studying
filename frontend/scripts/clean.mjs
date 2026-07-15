import { readdir, rm } from 'node:fs/promises';

await Promise.all([
  rm('dist', { recursive: true, force: true }),
  rm('coverage', { recursive: true, force: true })
]);

for (const entry of await readdir('.')) {
  if (entry.endsWith('.tsbuildinfo')) {
    await rm(entry, { force: true });
  }
}
