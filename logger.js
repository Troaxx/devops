const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ timestamp, level, message, ...metadata }) => {
  let logMessage = `${timestamp} [${level}] : ${message}`;
  if (metadata && Object.keys(metadata).length) {
    logMessage += ` ${JSON.stringify(metadata)}`;
  }
  return logMessage;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
    new winston.transports.File({ filename: 'pipeline.log' }),
  ],
});

module.exports = logger;
