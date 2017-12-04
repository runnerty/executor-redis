"use strict";

var redis = require("redis");
var loadFile = global.libUtils.loadSQLFile;

var Execution = global.ExecutionClass;

class redisExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(res) {
    var _this = this;
    var endOptions = {end: "end"};

    function commandsFormat(command) {
      let res = [];
      let lines = command.split(/\r\n|\n/);
      for (let i = 0; i < lines.length; i++) {
        res.push(lines[i].trim().split(" "));
      }
      return res;
    }

    function executeCommand(configValues) {
      return new Promise(async function (resolve, reject) {

        var options = {
          useExtraValue: configValues.args || false,
          useProcessValues: true,
          useGlobalValues: true,
          altValueReplace: "null"
        };

        if(configValues.command_file){
          await loadFile(configValues.command_file)
            .then((fileContent) => {
              res.command = fileContent;
            })
            .catch(function (err) {
              _this.logger.log("error", "Loading redis command file: " + err);
              reject("Loading redis command file: " + err);
            });
        }

        var _query = await _this.paramsReplace(res.command, options);
        
        if(configValues.password && configValues.password !== ""){
          configValues.options.password = configValues.password || "";
        }
        configValues.options.db = configValues.db || 0;

        var redisClient = redis.createClient(configValues.port || "6379", configValues.host, configValues.options);

        redisClient.on("error", function (err) {
          _this.logger.log("error", "Could not connect to Redis: " + err);
          reject("Could not connect to Redis: " + err);
        });

        redisClient.on("ready", function () {
          var commands = commandsFormat(_query);
          endOptions.command_executed = commands;

          try {
            redisClient
              .batch(commands)
              .exec(function (err, replies) {
                redisClient.quit();
                if (err) {
                  _this.logger.log("error", `Error query Redis (${commands}): ` + err);
                  reject(`Error query Redis (${commands}): ` + err);
                } else {
                  resolve(replies);
                }
              });
          } catch (err) {
            _this.logger.log("error", "Error query Redis, check commands: " + commands, err);
            reject("Error query Redis, check commands: " + commands, err);
          }
        });
      });
    }

    if (res.command || res.command_file) {
      executeCommand(res)
        .then((res) => {
          // STANDARD OUTPUT
          endOptions.end = "end";
          endOptions.data_output = res;
          // EXTRA DATA OUTPUT
          endOptions.extra_output = {};
          endOptions.extra_output.db_firstRow = JSON.stringify(res[0]);

          _this.end(endOptions);
        })
        .catch(function (err) {
          endOptions.end = "error";
          endOptions.messageLog = `executeRedis executeCommand: ${err}`;
          endOptions.err_output = `executeRedis executeCommand: ${err}`;
          _this.end(endOptions);
        });
    } else {
      endOptions.end = "error";
      endOptions.messageLog = `executeRedis: command not set and command_file nor supported yet for ${_this.processId}(${_this.processUId}.`;
      endOptions.err_output = `executeRedis: command not set and command_file nor supported yet for ${_this.processId}(${_this.processUId}.`;
      _this.end(endOptions);
    }
  }
}

module.exports = redisExecutor;