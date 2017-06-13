'use strict';

const logger = require('./utils/console');
const TcpProxy = require('./tcp_proxy');
const WSProxy = require('./ws_proxy');
const options = JSON.parse(process.argv[2]);

const tcpServer = new TcpProxy({
  port: options.proxyPort,
  ssl: options.ssl,
  target: {
    host: '127.0.0.1',
    port: options.debugPort,
  },
});

let wsServer;
if (options.isInpectProtocol) {
  wsServer = new WSProxy({
    port: options.wsProxyPort,
    ssl: options.ssl,
    target: {
      host: '127.0.0.1',
      port: options.debugPort,
    },
  });
}

// https://nodejs.org/api/process.html#process_signal_events
// https://en.wikipedia.org/wiki/Unix_signal
// kill(2) Ctrl-C
process.once('SIGINT', receiveSig.bind(null, 'SIGINT'));
// kill(3) Ctrl-\
process.once('SIGQUIT', receiveSig.bind(null, 'SIGQUIT'));
// kill(15) default
process.once('SIGTERM', receiveSig.bind(null, 'SIGTERM'));

function receiveSig(sig) {
  logger.info('[egg-development-proxyworker] proxyworker receive signal %s, exit with code 0, pid %s', sig, process.pid);
  tcpServer.closeServer(() => {
    if (wsServer) {
      wsServer.closeServer(() => {
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
}
