var Fiber = require('fibers');
var CRedis = require('../framework/db/redis')
var configRedis = require("../configRedis");
var redis = new CRedis(configRedis, Fiber);

function func() {
    // var ret = redis.exec("select", 2);
    // var ret = redis.exec("hgetall", '286001');
    // var userinfo = ret.result;
    // for (var key in userinfo) {
    //     console.log(key, userinfo[key]);
    // }

    redis.addPipelineCommand("select", 0);
    redis.addPipelineCommand("hset", '286001', 'id', '286001');
    redis.addPipelineCommand("hset", '286001', 'name', 'xiaohua');
    redis.addPipelineCommand("hset", '286001', 'sex', '1');
    redis.addPipelineCommand("hgetall", '286001');
    redis.addPipelineCommand("get", 'abc');
    redis.addPipelineCommand("incr", 'a1');
    redis.addPipelineCommand("incr", 'a2');
    redis.addPipelineCommand("get", 'abc');
    var ret = redis.execPipelineCommand();
    // console.log(ret);
    // console.log("\n\n");
    // console.log(ret.result[1]);

    // console.log("end of func!!!!!!!!!!!!!!!!!!!!!!");
}

function funb() {
    redis.addPipelineCommand("select", 0);
    redis.addPipelineCommand("hset", '286001', 'id', '286001');
    redis.addPipelineCommand("hset", '286001', 'name', 'xiaohua');
    redis.addPipelineCommand("hset", '286001', 'sex', '1');
    redis.addPipelineCommand("hgetall", '286001');
    redis.addPipelineCommand("get", 'abc');
    redis.addPipelineCommand("incr", 'b1');
    redis.addPipelineCommand("incr", 'b2');
    redis.addPipelineCommand("get", 'abc');
    var ret = redis.execPipelineCommand();
    // console.log(ret);
}

Fiber(function () {
    func();
    funb();
}).run();






////////////////////////////////////////////////////////////////////////////////////////////////
// var Redis = require('ioredis');
// var redis = new Redis({
//     port: 6363,
//     host: '127.0.0.1',
//     family: 4,
//     password: '123123',
//     db: 0,
// });

// redis.set('foo', 'bar');
// redis.get('foo', function (err, result) {
//     console.log(result);
// });

// // Or using a promise if the last argument isn't a function
// redis.get('foo').then(function (result) {
//     console.log(result);
// });

// // Arguments to commands are flattened, so the following are the same:
// redis.sadd('set', 1, 3, 5, 7);
// redis.sadd('set', [1, 3, 5, 7]);

// // All arguments are passed directly to the redis server:
// redis.set('key', 100, 'EX', 10);