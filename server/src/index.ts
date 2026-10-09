import 'dotenv/config';
import app from './server.js';
import { logger } from './utils/logger.js';
import { ENV } from './helpers/envConfig.js';
import { initDatabase } from './db/schema.js';

const PORT = ENV.PORT || 5000;

async function bootstrap() {
  try {
    await initDatabase();
    logger.info('Database schema and bootstrap seeds verified.');
  } catch (err) {
    logger.error(`Database initialization warning: ${(err as Error).message}`);
  }

  app.listen(PORT, () => {
    logger.info(`EcoTrace ESG Server running on port ${PORT}`);
  });
}

bootstrap();