'use strict';

const Logger = require('egg-logger').Logger;
const ConsoleTransport = require('egg-logger').ConsoleTransport;

const logger = new Logger();

logger.set('console', new ConsoleTransport({
  level: 'DEBUG',
}));

module.exports = logger;

