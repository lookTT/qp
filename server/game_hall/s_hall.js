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
    }

    onLoad() {
        //注册
        this.app.get("/signup", function (req, res, next) {
            this.signup(req, res, next);
        }.bind(this));

        //登录
        this.app.get("/signin", function (req, res, next) {
            this.signin(req, res, next);
        }.bind(this));

        //登出
        this.app.get("/signout", function (req, res, next) {
            this.signout(req, res, next);
        }.bind(this));

        //心跳
        this.protocolLogicFunc["cs_pingpong"] = this.heartbeat.bind(this);

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

    signup(req, res) {
        var data = req.query;
        var ip = req.ip;
        if (ip.indexOf("::ffff:") != -1) {
            ip = ip.substr(7);
        }

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
        var data = req.query;
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
        this.refreshToken(utils.md5(account + password + timestamp));
        user.ip = ip;
        user.signin_time = timestamp;

        msg.info = user.getAttriObj();
        this.send(res, 0, "ok", msg);
    }

    signout(req, res) {
        var data = req.query;
        var ip = req.ip;
        if (ip.indexOf("::ffff:") != -1) {
            ip = ip.substr(7);
        }

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
        this.send(res, 0, "ok", msg);
    }


    heartbeat(socket, data) {
        var timestamp = Date.parse(new Date());
        this.emit(socket, { msg: "cs_pingpong", ts: timestamp })
    }
}

module.exports = s_hall;