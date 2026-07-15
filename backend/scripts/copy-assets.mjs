import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const assetDirectories = [
  'infrastructure/database/migrations',
  'infrastructure/database/seeds'
];

for (const relativeDirectory of assetDirectories) {
  const source = path.resolve('src', relativeDirectory);
  const destination = path.resolve('dist', relativeDirectory);

  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}

console.log('Copied backend SQL assets to dist/.');
