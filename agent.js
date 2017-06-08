'use strict';

const path = require('path');
const { forkNode } = require('./lib/utils/helper');
const proxyWorkerFile = path.join(__dirname, './', 'lib', 'proxy_worker.js');

let proxyWorker;

module.exports = app => {
  const logger = app.logger;
  const config = app.config.proxyworker;
  const env = process.env;
  const proxyPort = config.port || env.EGG_WORKER_PROXY || '10086';
  const wsProxyPort = config.wsPort || env.EGG_WORKER_WS_PROXY || '10087';

  function forkProxyWorker({ debugPort, isInpectProtocol }) {
    const args = { proxyPort, wsProxyPort, debugPort, isInpectProtocol };
    if (config.ssl) {
      args.ssl = config.ssl;
    }
    logger.info('[egg-development-proxyworker] debugger attached');
    logger.info(`[egg-development-proxyworker] debugger debugPort is ${debugPort} and proxyPort is ${proxyPort}`);
    proxyWorker = forkNode(proxyWorkerFile, [ JSON.stringify(args) ], {
      execArgv: [],
    });
  }

  app.messenger.on('conn-proxy-worker', data => {
    if (proxyWorker) {
      proxyWorker.kill('SIGTERM');
    }

    forkProxyWorker(data);
  });
};
