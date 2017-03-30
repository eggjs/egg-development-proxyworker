'use strict';

const TcpProxy = require('./tcpproxy');
const options = JSON.parse(process.argv[2]);
const logger = require('./utils/console');
// const options = { proxyPort: 10086, debugPort: 5807 };

logger.info('get options', JSON.stringify(options));

const server = new TcpProxy({
  port: options.proxyPort,
  target: {
    host: '127.0.0.1',
    port: options.debugPort,
  },
});

process.on('message', message => {
  logger.info('reconn', JSON.stringify(message));

  setTimeout(() => {
    server.createServerSockets({
      host: '127.0.0.1',
      port: message.data.debugPort,
    });
  }, 200);
});

process.once('SIGTERM', () => {
  server.closeServer();
  setTimeout(() => {
    process.exit(0);
  }, 5000);
});
