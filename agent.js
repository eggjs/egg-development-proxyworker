'use strict';

const path = require('path');
const { forkNode } = require('./lib/utils/helper');
const proxyWorkerFile = path.join(__dirname, './', 'lib', 'proxy_worker.js');

module.exports = app => {
  const logger = app.logger;
  const config = app.config.proxyworker;
  const env = process.env;
  const proxyPort = config.port || env.EGG_WORKER_PROXY;

  let proxyWorker;

  function forkProxyWorker(debugPort) {
    const args = { proxyPort, debugPort };
    if (config.ssl) {
      args.ssl = config.ssl;
    }
    logger.info(`[egg:proxyworker] ProxyPort is ${proxyPort} and debugPort is ${debugPort}`);
    proxyWorker = forkNode(proxyWorkerFile, [ JSON.stringify(args) ], {
      execArgv: [],
    });
  }

  app.messenger.on('conn-proxy-worker', data => {
    if (proxyWorker) {
      logger.info('[egg:proxyworker] Kill proxy worker with signal SIGTERM');
      proxyWorker.kill('SIGTERM');
    }

    forkProxyWorker(data.debugPort);
  });
};
