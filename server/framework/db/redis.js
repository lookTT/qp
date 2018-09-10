'use strict'
class db_redis {
    constructor(config = {}, _Fiber) {
        this.Fiber = _Fiber;

        var Redis = require('ioredis');
        // console.log(config);
        this.redis = new Redis({
            port: config.port ? config.port : 6379,
            host: config.host ? config.host : '127.0.0.1',
            family: config.family ? config.family : 4,
            password: config.password ? config.password : '',
            db: config.db ? config.db : 0,
        });

        this.pipeline = null;
    }

    /**
     * addPipelineCommand需要与execPipelineCommand方法配合使用
     * addPipelineCommand仅仅是对redis管道进行增加命令
     * 而execPipelineCommand则是实际向redis服务器发起命令，并获取回调结果
     */
    addPipelineCommand() {
        if (!this.pipeline) this.pipeline = this.redis.pipeline();

        if (!this.pipeline[arguments[0]]) {
            return;
        }

        switch (arguments.length) {
            case 1:
                this.pipeline[arguments[0]]();
                break;
            case 2:
                this.pipeline[arguments[0]](arguments[1]);
                break;
            case 3:
                this.pipeline[arguments[0]](arguments[1], arguments[2]);
                break;
            case 4:
                this.pipeline[arguments[0]](arguments[1], arguments[2], arguments[3]);
                break;
            case 5:
                this.pipeline[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4]);
                break;
            case 6:
                this.pipeline[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                break;
            default:
                break;
        }
    }

    /**
     * 执行管道中的命令
     */
    execPipelineCommand() {
        if (!this.pipeline) return;

        var fiber = this.Fiber.current;
        var ret = { err: null, result: null };
        this.pipeline.exec(function (err, result) {
            ret.err = err;
            ret.result = result;
            fiber.run();
        });

        this.Fiber.yield();
        this.pipeline = null;
        return ret;
    }

    /**
     * PS: 如果使用redis多db的话不要使用该方法(该逻辑不是原子操作)
     *     执行逻辑挂起后，轮询到其他逻辑后可能会导致数据存储异常(如将数据存储到其他db)
     * 
     * 直接执行redis命令
     * 例如: 
     * 1.
     * var ret = r.exec('set', 'name', 'xiaoming');
     * ret.err //为错误返回信息  一般返回null
     * ret.result //为返回结果  设置信息一般返回 'OK'
     * 
     * 2.
     * var ret = r.exec('get', 'name');
     * ret.err //为错误返回信息  一般返回null
     * ret.result //为返回结果  'xiaoming'
     */
    // exec() {
    //     var fiber = this.Fiber.current;
    //     var ret = { err: null, result: null };

    //     var callback = function (err, result) {
    //         ret.err = err;
    //         ret.result = result;
    //         fiber.run();
    //     };

    //     switch (arguments.length) {
    //         case 1:
    //             this.redis[arguments[0]](callback);
    //             break;
    //         case 2:
    //             this.redis[arguments[0]](arguments[1], callback);
    //             break;
    //         case 3:
    //             this.redis[arguments[0]](arguments[1], arguments[2], callback);
    //             break;
    //         case 4:
    //             this.redis[arguments[0]](arguments[1], arguments[2], arguments[3], callback);
    //             break;
    //         case 5:
    //             this.redis[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4], callback);
    //             break;
    //         case 6:
    //             this.redis[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], callback);
    //             break;
    //         default:
    //             isYield = false;
    //             break;
    //     }

    //     this.Fiber.yield();
    //     return ret;
    // }

}

module.exports = db_redis;