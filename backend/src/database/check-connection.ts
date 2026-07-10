import {
  checkDatabaseConnection,
  closeDatabaseConnection,
} from './db';

async function main(): Promise<void> {
  try {
    await checkDatabaseConnection();
    console.log('✅ PostgreSQL connection successful');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
}

void main();
