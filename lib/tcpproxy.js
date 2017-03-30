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
    this.clientSockets = new Set();
    this.serverSockets = new Set();
    this.createServer();

    this.buffers = [];

    this.clientSocketConnected = false;
    this.serverSocketConnected = false;
  }

  createServer() {
    if (this._server) {
      return;
    }
    this._server = this.ssl
      ? tls.createServer(this.ssl, this._socketHandler.bind(this))
      : net.createServer(this._socketHandler.bind(this));
    this.on('error', this._onError);
    this._server.listen(this.port, () => {
      logger.info('TCP Server listen at %s', this.port);
    });
  }

  closeServer() {
    if (this._server) {
      this.closeClientSockets();
      this.closeServerSockets();

      this._server.close(() => {
        logger.info(`TCP Server port ${this.port} had closed.`);
        this._server = null;
      });
    }
  }

  createClientSockets(clientSocket) {
    this.clientSocket = clientSocket;
    this.clientSocketConnected = true;

    this.clientSocket.setKeepAlive(true);
    this.clientSockets.add(this.clientSocket);

    this.clientSocket.on('end', () => { this.clientSocketConnected = false; });
    this.clientSocket.on('error', error => {
      this.clientSocketConnected = false;
      !this.serverSocket.destroyed && this.serverSocket.destroy(error);
      logger.error('Client socket error');
      this.emit('error', error);
    });
    this.clientSocket.on('data', data => {
      if (this.serverSocketConnected) {
        try {
          this.serverSocket.write(data);
        } catch (error) {
          this.emit('error', error);
        }
      } else {
        this.buffers.push(data);
      }
    });
    this.clientSocket.on('close', error => {
      logger.info('Client socket closed.');
      this.clientSockets.has(this.clientSocket) && this.clientSockets.delete(this.clientSocket);
      this.emit('close', error);
    });
  }

  createServerSockets(target) {
    logger.info('Create Server socket ing...');
    this.serverSocketConnected = false;

    const serverSocket = this.serverSocket = new net.createConnection({
      port: target.port,
      host: target.host,
    }, () => {
      logger.info('Server socket started.');
      this.serverSocketConnected = true;
      this.serverSockets.add(serverSocket);
      try {
        this.buffers.forEach(buffer => {
          serverSocket.write(buffer);
        });
        this.buffers = [];
      } catch (error) {
        serverSocket.destroy(error);
      }
    });

    serverSocket.on('end', () => { this.serverSocketConnected = false; });
    serverSocket.on('error', () => {
      this.serverSocketConnected = false;
      logger.error(`Could not connect to service at host ${this.target.host}:${this.target.port}`);
      // this.emit('error', error);
    });
    serverSocket.on('data', data => {
      if (this.clientSocketConnected) {
        try {
          this.clientSocket.write(data);
        } catch (error) {
          this.emit('error', error);
        }
      }
    });
    serverSocket.on('close', error => {
      logger.info('Server socket closed.');
      this.serverSockets.has(serverSocket) && this.serverSockets.delete(serverSocket);
      this.emit('close', error);
    });
  }

  closeClientSockets() {
    for (const socket of this.clientSockets) {
      !socket.destroyed && socket.destroy();
    }
  }

  closeServerSockets() {
    for (const socket of this.serverSockets) {
      !socket.destroyed && socket.destroy();
    }
  }

  _socketHandler(clientSocket) {
    logger.info(`Receive new socket connection from ${clientSocket.remoteAddress}:${clientSocket.remotePort}`);

    this.createClientSockets(clientSocket);
    this.createServerSockets(this.target);
  }

  _onError(err) {
    logger.error(err);
    this._server.emit('error', err);
  }
}

module.exports = TCPProxy;
