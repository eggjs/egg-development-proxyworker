'use strict';

const TcpProxy = require('./tcpproxy');
const options = JSON.parse(process.argv[2]);
const logger = require('./utils/console');

logger.info('get options', JSON.stringify(options));

const server = new TcpProxy({
  port: options.proxyPort,
  target: {
    host: '127.0.0.1',
    port: options.debugPort,
  },
});

process.once('SIGTERM', () => {
  server.closeServer(() => {
    process.exit(0);
  });
});
