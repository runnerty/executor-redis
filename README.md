<p align="center">
  <a href="http://runnerty.io">
    <img height="257" src="https://runnerty.io/assets/header/logo-stroked.png">
  </a>
  <p align="center">Smart Processes Management</p>
</p>

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Dependency Status][david-badge]][david-badge-url]
<a href="#badge">
  <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg">
</a>

# Redis executor for [Runnerty]:

### Installation:
Through NPM

```bash
npm i @runnerty/executor-redis
```

You can also add modules to your project with [runnerty]

```bash
npx runnerty add @runnerty/executor-redis
```

This command installs the module in your project, adds example configuration in your [config.json] and creates an example plan of use.

If you have installed [runnerty] globally you can include the module with this command:

```bash
runnerty add @runnerty/executor-redis
```

### Configuration sample:
```json
{
  "id": "redis_default",
  "type": "@runnerty-executor-redis",
  "password": "redis_password",
  "host": "redishost.com",
  "port": "6379",
  "db": 0,
  "options": {}
}
```
More info about options [here.](https://github.com/NodeRedis/node-redis/blob/master/README.md#options-object-properties)
### Plan sample:
```json
{
  "id":"redis_default",
  "command_file": "/etc/runnerty/redis_files/test.txt"
}
```

```json
{
  "id":"redis_default",
  "command": "KEYS *"
}
```

### Output (Process values):
* `PROCESS_EXEC_DATA_OUTPUT`: Redis output message. 
* `PROCESS_EXEC_ERR_OUTPUT`: Error output message.

[Runnerty]: https://www.runnerty.io
[downloads-image]: https://img.shields.io/npm/dm/@runnerty/executor-redis.svg
[npm-url]: https://www.npmjs.com/package/@runnerty/executor-redis
[npm-image]: https://img.shields.io/npm/v/@runnerty/executor-redis.svg
[david-badge]: https://david-dm.org/runnerty/executor-redis.svg
[david-badge-url]: https://david-dm.org/runnerty/executor-redis
[config.json]: http://docs.runnerty.io/config/
[plan.json]: http://docs.runnerty.io/plan/