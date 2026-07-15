import { copyFileSync, existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const healthUrl = process.env.LEXIGO_BACKEND_HEALTH_URL ?? 'http://localhost:4010/api/v1/health';
const proxyTarget = process.env.VITE_DEV_PROXY_TARGET ?? new URL(healthUrl).origin;
const explicitBackend = process.env.LEXIGO_BACKEND_DIR;
const backendCandidates = [
  explicitBackend,
  resolve(frontendDir, '..', 'backend'),
  resolve(frontendDir, '..', 'LexiGo_Backend_Standalone_v0.3.0'),
  resolve(frontendDir, '..', 'LexiGo_Backend_Standalone_v0.2.0')
].filter(Boolean);
const backendDir = backendCandidates.find((candidate) => existsSync(resolve(candidate, 'package.json')));

function spawnProcess(command, args, cwd, extraEnv = {}) {
  return spawn(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    detached: process.platform !== 'win32'
  });
}

function installIfNeeded(directory, label) {
  if (existsSync(resolve(directory, 'node_modules'))) return;
  if (process.env.LEXIGO_DEMO_SKIP_INSTALL === '1') {
    throw new Error(`${label} chưa có node_modules và LEXIGO_DEMO_SKIP_INSTALL=1.`);
  }

  console.log(`[LexiGo] Cài dependency cho ${label}...`);
  const result = spawnSync(npmCommand, ['install'], {
    cwd: directory,
    stdio: 'inherit',
    env: process.env
  });
  if (result.status !== 0) throw new Error(`npm install thất bại trong ${label}.`);
}

async function isBackendReady() {
  try {
    const response = await fetch(healthUrl, { signal: AbortSignal.timeout(1_500) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForBackend(timeoutMs = 60_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isBackendReady()) return;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 700));
  }
  throw new Error(`Backend không sẵn sàng sau ${Math.round(timeoutMs / 1_000)} giây: ${healthUrl}`);
}

function stopProcessTree(child) {
  if (!child || child.killed) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }
}

let backendProcess;
let frontendProcess;
let ownsBackend = false;
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  stopProcessTree(frontendProcess);
  if (ownsBackend) stopProcessTree(backendProcess);
  process.exit(exitCode);
}

try {
  installIfNeeded(frontendDir, 'frontend');

  if (await isBackendReady()) {
    console.log(`[LexiGo] Sử dụng backend đang chạy tại ${healthUrl}`);
  } else {
    if (!backendDir) {
      throw new Error(
        'Không tìm thấy backend. Đặt backend cạnh frontend với tên "backend" hoặc cấu hình LEXIGO_BACKEND_DIR.'
      );
    }

    installIfNeeded(backendDir, 'backend');
    const backendEnv = resolve(backendDir, '.env');
    const backendEnvExample = resolve(backendDir, '.env.example');
    if (!existsSync(backendEnv) && existsSync(backendEnvExample)) {
      copyFileSync(backendEnvExample, backendEnv);
      console.log('[LexiGo] Đã tạo backend/.env từ .env.example.');
    }

    console.log(`[LexiGo] Khởi động backend tại ${backendDir}`);
    backendProcess = spawnProcess(npmCommand, ['run', 'dev'], backendDir, {
      NODE_ENV: process.env.NODE_ENV ?? 'development'
    });
    ownsBackend = true;
  }

  await waitForBackend();
  console.log('[LexiGo] Backend đã sẵn sàng. Khởi động giao diện demo...');
  console.log(`[LexiGo] Vite proxy /api → ${proxyTarget}`);

  frontendProcess = spawnProcess(npmCommand, ['run', 'demo:frontend'], frontendDir, {
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? '/api/v1',
    VITE_DEV_PROXY_TARGET: proxyTarget
  });

  frontendProcess.on('exit', (code) => shutdown(code ?? 0));
  backendProcess?.on('exit', (code) => {
    if (!shuttingDown && ownsBackend) {
      console.error(`[LexiGo] Backend đã dừng với mã ${code ?? 0}.`);
      shutdown(code || 1);
    }
  });
} catch (error) {
  console.error('[LexiGo] Không thể khởi động demo.');
  console.error(error instanceof Error ? error.message : error);
  shutdown(1);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
