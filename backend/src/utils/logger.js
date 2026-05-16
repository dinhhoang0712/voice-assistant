import pino from 'pino';
import { LokiTransport } from 'pino-loki';
import { env } from './env.js';

// Create Loki transport if Loki URL is configured
let transport;

if (env.lokiUrl) {
  transport = new LokiTransport({
    host: env.lokiUrl,
    labels: {
      service: 'voice-assistant-backend',
      environment: env.nodeEnv || 'development',
    },
    batching: true,
    interval: 5,
  });
}

// Create logger
export const logger = pino(
  {
    level: env.logLevel || 'info',
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);

// Export a child logger with additional context
export const createChildLogger = (context) => {
  return logger.child(context);
};

// Export a wrapper for logging HTTP requests
export const httpRequestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    }, 'HTTP Request');
  });
  
  next();
};
