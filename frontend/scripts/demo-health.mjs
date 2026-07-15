const healthUrl = process.env.LEXIGO_BACKEND_HEALTH_URL || 'http://localhost:4010/api/v1/health';
try {
  const response = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  console.log(`[LexiGo] Backend ready: ${healthUrl}`, payload);
} catch (error) {
  console.error(`[LexiGo] Backend unavailable: ${healthUrl}`);
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
