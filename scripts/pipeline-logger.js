const logger = require('../logger');

// Get arguments from command line
// Usage: node scripts/pipeline-logger.js <level> <message> [metadata_json]
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/pipeline-logger.js <level> <message> [metadata_json]');
  process.exit(1);
}

const level = args[0];
const message = args[1];
// Parse remaining args as key=value pairs
const metadataArgs = args.slice(2);
let metadata = {};

metadataArgs.forEach((arg) => {
  const [key, value] = arg.split('=');
  if (key && value) {
    metadata[key] = value;
  }
});

// Add common pipeline info if available in env vars
if (process.env.BUILD_NUMBER) metadata.build = process.env.BUILD_NUMBER;
if (process.env.GIT_COMMIT) metadata.commit = process.env.GIT_COMMIT;
if (process.env.JOB_NAME) metadata.job = process.env.JOB_NAME;

// Log it
if (logger[level]) {
  logger[level](message, metadata);
} else {
  logger.info(message, metadata);
}
