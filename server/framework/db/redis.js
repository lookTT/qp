'use strict'

class db_redis {
    constructor(config = {}, _Fiber) {
        var self = this;
        this.Fiber = _Fiber;

        var Redis = require('ioredis');
        this.redis = new Redis({
            port: config.port ? config.port : 6379,
            host: config.host ? config.host : '127.0.0.1',
            family: config.family ? config.family : 4,
            password: config.password ? config.password : '',
            db: config.db ? config.db : 0,
        });

        this._pipeline = null;


        for (const key in this.redis) {
            if (typeof (this.redis[key]) == "function") {
                this[key] = function () {
                    if (!self._pipeline) self._pipeline = self.redis.pipeline();
                    self._pipeline.select(arguments[0]);

                    var arr = [];
                    for (let i = 1; i < arguments.length; i++) {
                        const element = arguments[i];
                        arr.push(element);
                    }
                    self._pipeline[key].apply(self._pipeline, arr);


                    if (!self._pipeline) return null;
                    var fiber = self.Fiber.current;
                    var ret = { err: null, result: null };
                    self._pipeline.exec(function (err, result) {
                        ret.err = err;
                        ret.result = result;
                        fiber.run();
                    });

                    self.Fiber.yield();
                    self._pipeline = null;
                    if (ret.err == null && ret.result[0][0] == null && ret.result[1][0] == null) {
                        return ret.result[1][1];
                    }
                    else {
                        return null;
                    }

                }
            }
        }
    }

}

module.exports = db_redis;