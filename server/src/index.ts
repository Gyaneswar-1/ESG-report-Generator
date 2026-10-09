import 'dotenv/config';
import app from './server.js';
import { logger } from './utils/logger.js';
import { ENV } from './helpers/envConfig.js';

const PORT = ENV.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});