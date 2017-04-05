'use strict';

const debug = require('debug')('egg-development-proxyworker');
const cp = require('child_process');

// only hook once and only when ever start any child.
const childs = new Set();
let hadHook = false;

/**
 * gracefull exit childs proc.
 * @method helper#gracefull
 * @param {Object} proc - child proc object.
 */
exports.gracefull = proc => {
  // save child ref
  childs.add(proc);

  // only hook once
  /* istanbul ignore else */
  if (!hadHook) {
    hadHook = true;
    let signal;
    [ 'SIGINT', 'SIGQUIT', 'SIGTERM' ].forEach(event => {
      process.once(event, () => {
        signal = event;
        process.exit(0);
      });
    });

    process.once('exit', () => {
      // had test at my-helper.test.js, but coffee can't collect coverage info.
      for (const child of childs) {
        debug('kill child %s with %s', child.pid, signal);
        child.kill(signal);
      }
    });
  }
};

/**
 * fork child process gracefull exit
 * @method helper#forkNode
 * @param {String} modulePath - bin path
 * @param {Array} [args] - arguments
 * @param {Object} [options] - options
 * @return {Object} proc
 * @see https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
 */
exports.forkNode = (modulePath, args = [], options = {}) => {
  options.stdio = options.stdio || 'inherit';
  debug('Run fork `%s %s %s`', process.execPath, modulePath, args.join(' '));
  const proc = cp.fork(modulePath, args, options);
  exports.gracefull(proc);

  proc.once('error', err => {
    console.error(err);
  });

  return proc;
};
