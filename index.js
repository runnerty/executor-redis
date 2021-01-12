'use strict';

const redis = require('redis');
const fsp = require('fs').promises;
const Executor = require('@runnerty/module-core').Executor;

class redisExecutor extends Executor {
  constructor(process) {
    super(process);
  }

  async exec(res) {
    const self = this;
    const endOptions = { end: 'end' };

    function commandsFormat(command) {
      const res = [];
      const lines = command.split(/\r\n|\n/);
      for (let i = 0; i < lines.length; i++) {
        res.push(lines[i].trim().split(' '));
      }
      return res;
    }

    async function executeCommand(configValues) {
      return new Promise(async (resolve, reject) => {
        const options = {
          useExtraValue: configValues.args || false,
          useProcessValues: true,
          useGlobalValues: true,
          altValueReplace: 'null'
        };
        if (!configValues.options) configValues.options = {};

        if (configValues.command_file) {
          try {
            // Load file:
            await fsp.access(configValues.command_file, fsp.constants.F_OK | fsp.constants.W_OK);
            res.command = await fsp.readFile(configValues.command_file, 'utf8');
          } catch (err) {
            this.logger.log('error', 'Loading redis command file: ' + err);
            reject('Loading redis command file: ' + err);
          }
        }

        const _query = await self.paramsReplace(res.command, options);

        if (configValues.password && configValues.password !== '') {
          configValues.options.password = configValues.password || '';
        }
        configValues.options.db = configValues.db || 0;

        const redisClient = redis.createClient(configValues.port || '6379', configValues.host, configValues.options);

        redisClient.on('error', err => {
          this.logger.log('error', 'Could not connect to Redis: ' + err);
          reject('Could not connect to Redis: ' + err);
        });

        redisClient.on('ready', () => {
          const commands = commandsFormat(_query);
          endOptions.command_executed = commands;
          try {
            redisClient.batch(commands).exec((err, replies) => {
              redisClient.quit();
              if (err) {
                this.logger.log('error', `Error query Redis (${commands}): ` + err);
                reject(`Error query Redis (${commands}): ` + err);
              } else {
                resolve(replies);
              }
            });
          } catch (err) {
            this.logger.log('error', 'Error query Redis, check commands: ' + commands, err);
            reject('Error query Redis, check commands: ' + commands, err);
          }
        });
      });
    }

    if (res.command || res.command_file) {
      try {
        const response = await executeCommand(res);
        // STANDARD OUTPUT
        endOptions.end = 'end';
        if (response.length == 1 && response[0]) {
          endOptions.data_output = response[0];
        } else {
          endOptions.data_output = response;
        }

        // EXTRA DATA OUTPUT
        endOptions.extra_output = {};
        if (response && response[0]) {
          endOptions.extra_output.db_firstRow = JSON.stringify(response[0]);
        }
        this.end(endOptions);
      } catch (err) {
        endOptions.end = 'error';
        endOptions.messageLog = `executeRedis executeCommand: ${err}`;
        endOptions.err_output = `executeRedis executeCommand: ${err}`;
        this.end(endOptions);
      }
    } else {
      endOptions.end = 'error';
      endOptions.messageLog = `executeRedis: command not set and command_file nor supported yet for ${this.processId}(${this.processUId}.`;
      endOptions.err_output = `executeRedis: command not set and command_file nor supported yet for ${this.processId}(${this.processUId}.`;
      this.end(endOptions);
    }
  }
}

module.exports = redisExecutor;
