'use strict'

class service {
    constructor(port, redisConfig, mysqlConfig) {
        var self = this;

        this.HTTP = require('http');
        this.HTTPS = require('https');
        this.QS = require('querystring');

        var bodyParser = require('body-parser');
        this.app = require('express')();
        this.app.use(bodyParser.text());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.http = require('http').Server(this.app);

        this.io = require('socket.io')(this.http, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 30000,
        });

        this.Fiber = require('fibers');
        this.http.listen(port);
        this.port = port;

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

        //update间隔秒数
        this._updateInterval = 1000; //默认值

        this.onLoad();
    }

    onLoad() {
        var self = this;
        this.io.on('connection', function (socket) {

            for (var protocol in self.protocolLogicFunc) {
                var handler = self.protocolLogicFunc[protocol];
                socket.on(protocol, function (data) {
                    self.Fiber(function () {
                        handler(socket, data);
                    }).run();
                });
            }

        });

        if (this._updateInterval >= 0) {
            //设置一个简单的定时调用
            setTimeout(this._update.bind(this), this._updateInterval);
        }
    }

    _update() {
        var self = this;
        self.Fiber(function () {
            self.update();
        }).run();
    }

    update() {
        //设置一个简单的定时调用
        setTimeout(this._update.bind(this), this._updateInterval);
    }

    //毙掉update 但是需要在调用service类的onLoad之前调用
    stopUpdate() {
        this._updateInterval = -1;
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

    addSocketIOHandler(protocol, handler) {
        this.protocolLogicFunc[protocol] = handler;
    }

    delSocketIOHandler(protocol) {
        delete this.protocolLogicFunc[protocol];
        this.protocolLogicFunc[protocol] = null;
    }

    clearSocketIOHandler() {
        this.protocolLogicFunc = {};
    }

    send(res, msg) {
        if (!msg) msg = {};
        var jsonstr = JSON.stringify(msg);
        res.send(jsonstr);
    }

    emit(socket, data) {
        if (!data) data = {};
        if (!data.msg) return;
        var jsonstr = JSON.stringify(data);
        socket.emit(data.msg, jsonstr);
    }

    getRequest(host, port, path, data) {
        var fiber = this.Fiber.current;
        var ret = { errorid: 0 };
        var options = {
            hostname: host,
            path: path + '?' + this.QS.stringify(data),
            method: 'GET',
            port: port,
        };

        var req = this.HTTP.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                ret.data = JSON.parse(chunk);
                fiber.run();
            });
        });

        req.on('error', function (e) {
            ret.errorid = -1;
            ret.data = e;
            fiber.run();
        });
        req.end();

        this.Fiber.yield();
        return ret;
    };
}

module.exports = service;