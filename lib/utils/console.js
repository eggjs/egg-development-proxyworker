'use strict';

// const path = require('path');
const Logger = require('egg-logger').Logger;
// const FileTransport = require('egg-logger').FileTransport;
const ConsoleTransport = require('egg-logger').ConsoleTransport;

const logger = new Logger();
// logger.set('file', new FileTransport({
//   file: path.join(__dirname, '/log'),
//   level: 'INFO',
// }));
logger.set('console', new ConsoleTransport({
  level: 'DEBUG',
}));

module.exports = logger;

