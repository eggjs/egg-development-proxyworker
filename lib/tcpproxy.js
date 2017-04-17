'use strict';

const tls = require('tls');
const net = require('net');
const EventEmitter = require('events');
const logger = require('./utils/console');

class TCPProxy extends EventEmitter {
  constructor(options) {
    super();
    this.port = options.port;
    this.target = options.target;
    this.ssl = options.ssl;
    this.buffers = [];

    this.clientSockets = new Set();
    this.serverSockets = new Set();
    this.clientSocketConnected = false;
    this.serverSocketConnected = false;

    this.createServer();
  }

  createServer() {
    if (this._server) {
      return;
    }
    this._server = this.ssl
      ? tls.createServer(this.ssl, this._socketHandler.bind(this))
      : net.createServer(this._socketHandler.bind(this));

    this._server.listen(this.port, () => {
      logger.info('[egg-development-proxyworker] debugger listen at %s', this.port);
    });
    this.on('error', this._onError);
  }

  closeServer(cb) {
    if (this._server) {
      this.closeClientSockets();
      this.closeServerSockets();

      this._server.close(() => {
        logger.info(`[egg-development-proxyworker] debugger port ${this.port} had closed.`);
        this._server = null;
        cb();
      });
    }
    cb();
  }

  createServerSockets(serverSocket) {
    this.serverSocket = serverSocket;
    this.serverSocketConnected = true;

    this.serverSocket.setKeepAlive(true);
    this.serverSockets.add(this.serverSocket);

    this.serverSocket.on('end', () => { this.serverSocketConnected = false; });
    this.serverSocket.on('error', error => {
      this.serverSocketConnected = false;
      !this.clientSocket.destroyed && this.clientSocket.destroy(error);
      logger.error('[egg-development-proxyworker] debugger socket error', error);
      this.emit('error', error);
    });
    this.serverSocket.on('data', data => {
      if (this.clientSocketConnected) {
        try {
          this.clientSocket.write(data);
        } catch (error) {
          this.emit('error', error);
        }
      } else {
        this.buffers.push(data);
      }
    });
    this.serverSocket.on('close', error => {
      logger.info('[egg-development-proxyworker] debugger socket closed.');
      this.serverSockets.has(this.serverSocket) && this.serverSockets.delete(this.serverSocket);
      this.emit('close', error);
    });
  }

  createClientSockets(target) {
    logger.info('[egg-development-proxyworker] create client connection socket ing...');
    this.clientSocketConnected = false;

    const clientSocket = this.clientSocket = new net.createConnection({
      port: target.port,
      host: target.host,
    }, () => {
      logger.info('[egg-development-proxyworker] client socket started.');
      this.clientSocketConnected = true;
      this.clientSockets.add(clientSocket);
      try {
        this.buffers.forEach(buffer => {
          clientSocket.write(buffer);
        });
      } catch (error) {
        clientSocket.destroy(error);
      }
    });

    clientSocket.on('end', () => { this.clientSocketConnected = false; });
    clientSocket.on('error', () => {
      this.clientSocketConnected = false;
      logger.error(`[egg-development-proxyworker] could not connect to client at host ${this.target.host}:${this.target.port}`);
    });
    clientSocket.on('data', data => {
      if (this.serverSocketConnected) {
        try {
          this.serverSocket.write(data);
        } catch (error) {
          this.emit('error', error);
        }
      }
    });
    clientSocket.on('close', error => {
      logger.info('[egg-development-proxyworker] client socket closed.');
      this.clientSockets.has(clientSocket) && this.clientSockets.delete(clientSocket);
      this.emit('close', error);
    });
  }

  closeServerSockets() {
    for (const socket of this.serverSockets) {
      !socket.destroyed && socket.destroy();
    }
  }

  closeClientSockets() {
    for (const socket of this.clientSockets) {
      !socket.destroyed && socket.destroy();
    }
  }

  _socketHandler(serverSocket) {
    logger.info(`[egg-development-proxyworker] receive new socket connection from ${serverSocket.remoteAddress}:${serverSocket.remotePort}`);

    this.createServerSockets(serverSocket);
    this.createClientSockets(this.target);
  }

  _onError(err) {
    logger.error(err);
    this._server.emit('error', err);
  }
}

module.exports = TCPProxy;
