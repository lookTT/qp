'use strict'

class service {
    constructor(port, redisConfig, mysqlConfig) {
        var self = this;

        var bodyParser = require('body-parser');
        this.app = require('express')();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.http = require('http').Server(this.app);

        this.io = require('socket.io')(this.http, {
            pingInterval: 10000,
            pingTimeout: 30000,
        });

        this.Fiber = require('fibers');
        this.http.listen(port);

        //设置跨域访问
        this.app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("X-Powered-By", 'zltdhr@gmail.com')
            res.header("Content-Type", "application/json;charset=utf-8");
            self.Fiber(function () {
                next();
            }).run();
        });

        //redis
        var DBRedis = require('./db/redis');
        this.redis = new DBRedis(redisConfig, this.Fiber);

        //MySQL数据库
        var DBMysql = require('./db/mysql');
        this.mysql = new DBMysql(mysqlConfig, this.Fiber);

        //处理协议对应的逻辑代码容器
        this.protocolLogicFunc = {};

        this.onLoad();
    }

    onLoad() {
        var self = this;
        this.io.on('connection', function (socket) {
            socket.on('protocol', function (data) {
                self.Fiber(function () {
                    self.protocolLogicFunc[data.msg](socket, data);
                }).run();
            });
        });
    }

    checkNullValue(parms) {
        for (var index = 0; index < parms.length; index++) {
            var element = parms[index];
            if (element == null || element == undefined || element == "") {
                return true;
            }
        }
        return false;
    }

    send(res, msg) {
        if (msg == null) {
            msg = {};
        }
        var jsonstr = JSON.stringify(msg);
        res.send(jsonstr);
    }

    emit(socket, data) {
        socket
    }
}

module.exports = service;