'use strict';

const TcpProxy = require('./tcpproxy');
const options = JSON.parse(process.argv[2]);

const server = new TcpProxy({
  port: options.proxyPort,
  ssl: options.ssl,
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
