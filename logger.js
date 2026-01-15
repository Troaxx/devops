const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

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
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'pipeline.log' }),
  ],
});

module.exports = logger;
