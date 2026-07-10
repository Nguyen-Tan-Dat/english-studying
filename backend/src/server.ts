import app from './app';
import { env } from './config/env';
import {
  checkDatabaseConnection,
  closeDatabaseConnection,
} from './database/db';

async function bootstrap(): Promise<void> {
  await checkDatabaseConnection();
  console.log('✅ PostgreSQL connected');

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });

  let isShuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(async (serverError) => {
      try {
        await closeDatabaseConnection();

        if (serverError) {
          console.error('HTTP server shutdown error:', serverError);
          process.exitCode = 1;
          return;
        }

        console.log('✅ PostgreSQL pool closed');
        process.exitCode = 0;
      } catch (databaseError) {
        console.error('Database shutdown error:', databaseError);
        process.exitCode = 1;
      }
    });
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

bootstrap().catch(async (error: unknown) => {
  console.error('❌ Unable to start server:', error);

  try {
    await closeDatabaseConnection();
  } finally {
    process.exitCode = 1;
  }
});
