'use strict';

module.exports = app => {
  const logger = app.logger;
  const debugPort = process.debugPort;

  if (debugPort) {
    logger.info('[egg-development-proxyworker] client worker ready to connect proxyworker.');
    app.messenger.sendToAgent('conn-proxy-worker', {
      debugPort,
    });
  }
};
