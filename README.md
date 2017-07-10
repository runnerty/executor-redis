# Redis executor for [Runnerty]:

### Configuration sample:
```json
{
  "id": "redis_default",
  "type": "@runnerty-executor-redis",
  "password": "redis_password",
  "host": "redishost.com",
  "port": "6379",
  "db": "0",
  "options": {}
}
```

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

[Runnerty]: http://www.runnerty.io