'use strict'
var service = require("../framework/service");
var m_user = require("./m_user");
var utils = require("../framework/utils");

class s_hall extends service {
    constructor(port, redisConfig, mysqlConfig) {
        super(port, redisConfig, mysqlConfig);

        this.mapUserByUserid = {}; //[userid]:user
        this.mapUseridByAccount = {}; //[account]:userid
        this.mapUseridByToken = {}; //[token]:userid

        this.serviceMap = {}; // [serviceType]:[host+port:{host,port},host+port:{host,port}];
    }

    onLoad() {
        //游戏节点注册
        this.app.get("/register", function (req, res, next) {
            this.register(req, res, next);
        }.bind(this));

        //注册
        this.app.post("/signup", function (req, res, next) {
            this.signup(req, res, next);
        }.bind(this));

        //登录
        this.app.post("/signin", function (req, res, next) {
            this.signin(req, res, next);
        }.bind(this));

        //登出
        this.app.post("/signout", function (req, res, next) {
            this.signout(req, res, next);
        }.bind(this));

        //登录
        this.addSocketIOHandler("cs_signin", this.csSingin.bind(this));
        //心跳
        this.addSocketIOHandler("cs_pingpong", this.csPingPong.bind(this));

        //不需要的话可以屏蔽掉update
        this.stopUpdate();

        super.onLoad(); //最后执行父类该方法
    }

    addUser(userid, user) {
        if (!userid || !user) {
            return;
        }
        this.mapUserByUserid[userid] = user;
        this.mapUseridByAccount[user.account] = userid;
    }

    delUser(userid) {
        if (!userid) {
            return;
        }
        delete this.mapUserByUserid[userid];
        this.mapUserByUserid[userid] = null;

        delete this.mapUseridByAccount[userid];
        this.mapUseridByAccount[userid] = null;
    }

    getUserByUserid(userid) {
        if (!userid) {
            return;
        }
        var user = this.mapUserByUserid[userid];
        if (user) {
            return user;
        }
        else {
            //本机没有就去redis里找
            var new_user = new m_user(this.redis, this.mysql);
            if (new_user.loadUserinfoByUserid(userid)) {
                //找到就返回
                this.addUser(new_user);
                return new_user;
            }
            else {
                //找不到返回null
                return null;
            }
        }
    }

    getUserByAccount(account) {
        if (!account) {
            return;
        }
        var userid = this.mapUseridByAccount[account];
        if (userid) {
            return this.getUserByUserid(userid);
        }
        else {
            //本机没有就去redis里找
            var new_user = new m_user(this.redis, this.mysql);
            if (new_user.loadUserinfoByAccount(account)) {
                //找到就返回
                this.addUser(new_user);
                return new_user;
            }
            else {
                //找不到返回null
                return null;
            }
        }
    }

    refreshToken(token, userid) {
        if (!token || !userid) {
            return;
        }
        var user = this.getUserByUserid(userid);
        if (user) {
            var oldToken = user.token;
            delete this.mapUseridByToken[oldToken];
            this.mapUseridByToken[oldToken] = null;

            user.token = token;
            this.mapUseridByToken[token] = userid;
        }
    }

    delToken(userid) {
        if (!userid) {
            return;
        }
        var user = this.getUserByUserid(userid);
        if (user) {
            var oldToken = user.token;
            delete this.mapUseridByToken[oldToken];
            this.mapUseridByToken[oldToken] = null;
            user.token = '';
        }
    }

    getUserByToken(token) {
        if (!token) {
            return null;
        }
        var userid = this.mapUseridByToken[token];
        if (userid) {
            return this.getUserByUserid(userid);
        }

        return null;
    }

    checkToken(token, userid) {
        if (!token || !userid) {
            return false;
        }

        return this.mapUseridByToken[token] == userid;
    }

    register(req, res) {
        var data = req.query; //GET 获取信息

        var serviceType = data.type;
        var servicePort = data.port;
        var serviceIP = req.ip;
        if (serviceIP.indexOf("::ffff:") != -1) {
            serviceIP = serviceIP.substr(7);
        }


        if (!this.serviceMap[serviceType]) {
            this.serviceMap[serviceType] = {};
        }
        if (!this.serviceMap[serviceType][serviceIP + ':' + servicePort]) {
            this.serviceMap[serviceType][serviceIP + ':' + servicePort] = {}
        }

        var info = this.serviceMap[serviceType][serviceIP + ':' + servicePort]
        info.host = serviceIP;
        info.port = servicePort;
        info.type = serviceType;

        var msg = {
            errorid: 0,
        };

        msg.info = { ip: serviceIP };

        this.send(res, msg);
    }

    signup(req, res) {
        // var data = req.query; //GET 获取信息
        var data = JSON.parse(req.body); //POST 获取信息
        var account = data.account;
        var password = data.password;
        var name = data.name;
        // var sex = data.sex;
        // var headimg = data.headimg;

        var msg = {
            errorid: 0,
        };
        var i = 0;
        if (this.checkNullValue([account, password, name])) {
            msg.errorid = 1;
            this.send(res, msg);
            return;
        }

        if (this.getUserByAccount(account)) {
            //存在该账户
            msg.errorid = 2;
            this.send(res, msg);
            return;
        }

        var user = new m_user(this.redis, this.mysql);
        if (!user.createNewUser(account, password, name)) {
            //创建失败
            msg.errorid = 3;
            this.send(res, msg);
            return;
        }

        msg.info = user.getAttriObj();
        this.send(res, msg);
    }

    signin(req, res) {
        // var data = req.query; //GET 获取信息
        var data = JSON.parse(req.body); //POST 获取信息
        var ip = req.ip;
        if (ip.indexOf("::ffff:") != -1) {
            ip = ip.substr(7);
        }

        var account = data.account;
        var password = data.password;

        var msg = {
            errorid: 0,
        };

        if (this.checkNullValue([account, password])) {
            msg.errorid = 1;
            this.send(res, msg);
            return;
        }

        var user = this.getUserByAccount(account);
        if (!user) {
            //不存在该账户
            msg.errorid = 2;
            this.send(res, msg);
            return;
        }

        //判断密码是否正确
        if (user.password != utils.md5(password)) {
            msg.errorid = 3;
            this.send(res, msg);
            return;
        }

        var timestamp = Date.parse(new Date());
        user.token = utils.md5(account + password + timestamp);
        this.refreshToken(user.token, user.userid);
        user.ip = ip;
        user.signin_time = timestamp;

        msg.info = user.getAttriObj();
        this.send(res, msg);
    }

    signout(req, res) {
        // var data = req.query; //GET 获取信息
        var data = JSON.parse(req.body); //POST 获取信息
        var userid = data.userid;
        var token = data.token;

        var msg = {
            errorid: 0,
        };

        if (this.checkNullValue([userid, token])) {
            msg.errorid = 1;
            this.send(res, msg);
            return;
        }

        if (!this.checkToken(token, userid)) {
            msg.errorid = 1;
            this.send(res, msg);
            return;
        }

        this.delToken(userid);
        this.send(res, msg);
    }

    csSingin(socket, data) {
        var userid = data.userid;
        var token = data.token;

        var ret = {
            errorid: 0,
            msg: "cs_signin",
        };

        if (this.checkNullValue([userid, token])) {
            return;
        }

        if (!this.checkToken(token, userid)) {
            return;
        }

        this.emit(socket, ret);
    }

    csPingPong(socket, data) {
        var ret = {
            errorid: 0,
            msg: "cs_pingpong",
            timestamp: Date.parse(new Date())
        };
        this.emit(socket, ret);
    }
}

module.exports = s_hall;