import morgan from 'morgan';
import { morganStream } from '../utils/logger.js';

export const morganMiddleware = morgan(':method :url :status - :response-time ms', {
  stream: morganStream,
});

export default morganMiddleware;
