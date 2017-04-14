# egg-development-proxyworker

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-development-proxyworker.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-development-proxyworker
[download-image]: https://img.shields.io/npm/dm/egg-development-proxyworker.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-development-proxyworker

## Info
A proxy worker for debugging worker on egg

## Install

```bash
npm i egg-development-proxyworker --save
```

```js
// config/plugin.js
exports.proxyworker = {
  enable: true,
  package: 'egg-development-proxyworker',
};
```

```js
// you can use a specify proxy port.
// config/config.default.js
exports.proxyworker = {
  port: 10086,
};
```

```javascript
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach Worker",
      "type": "node",
      "request": "attach",
      "restart": true, // Important
      "port": 10086 // Your debug port
    }
  ],
}
```

## Start debugging

```bash
$ npm run dev -- --debug
```

## Questions & Suggestions

Please open an issue [here](https://github.com/okoala/egg-development-proxyworker/issues).

## License

[MIT](LICENSE)
