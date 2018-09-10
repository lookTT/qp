'use strict'
var g_redis_db = require("../framework/g_redis_db");
var utils = require("../framework/utils");

class m_user {
    constructor(_redis, _mysql) {
        this.reset();

        this.redis = _redis;
        this.mysql = _mysql;
    }

    //创建新用户
    createNewUser(account, password, name, sex, headimg) {
        this.reset();
        this.redis.addPipelineCommand('select', g_redis_db.server_info);
        this.redis.addPipelineCommand('incr', 'auto_incr_userid');
        var ret = this.redis.execPipelineCommand();

        if (ret.err == null && ret.result[1][1]) {
            var userid = ret.result[1][1];
            if (this.loadUserinfoByUserid(userid)) {
                this.reset();
                return false;
            }
            this.userid = userid;
        } else {
            this.reset();
            return false;
        }

        //当前时间戳
        var timestamp = Date.parse(new Date());
        this.account = account;
        this.password = utils.md5(password);
        this.name = name;
        this.sex = sex;
        this.headimg = headimg;
        this.signup_time = timestamp;
        this.signin_time = timestamp;

        this.coins = 100;
        this.gems = 999;

        this.saveAll();

        return true;
    }

    reset() {
        this.userid = ''; //玩家id
        this.account = ''; //玩家账号
        this.password = ''; //玩家密码
        this.mask = ''; //掩码
        this.name = ''; //昵称
        this.sex = '1'; //性别 1男 2女
        this.headimg = ''; //头像地址
        this.level = 1; //等级
        this.exp = 0; //经验
        this.coins = 0; //金币
        this.gems = 0; //钻石
        this.lucky = 0; //幸运值
        this.roomid = ''; //曾经在的房间
        this.history = ''; //历史记录
        this.signup_time = -1; //该账号创建时间
        this.signin_time = -1; //最近一次登录时间
        this.bind_userid = ''; //绑定的玩家ID

        this.ip = '';
        this.token = '';
    }
    /**
     * 获取纯属性对象
     */
    getAttriObj() {
        var attri = {};
        for (const key in this) {
            var v = this[key];
            if (this.hasOwnProperty(key) && key != "redis" && key != "mysql") {
                attri[key] = v;
            }
        }

        return attri;
    }

    /**
     * 通过userid加载玩家信息
     * @param {*} userid 
     */
    loadUserinfoByUserid(userid) {
        this.redis.addPipelineCommand('select', g_redis_db.user_info);
        this.redis.addPipelineCommand('get', userid);
        var ret = this.redis.execPipelineCommand();
        var result = ret.result[1][1];
        if (ret.err == null && result[1][1]) {
            var userinfo = JSON.parse(result[1][1]);
            for (var key in userinfo) {
                if (this[key]) {
                    this[key] = userinfo[key];
                }
            }
        } else {
            this.reset();
            return false;
        }

        this.redis.addPipelineCommand('select', g_redis_db.account_map);
        this.redis.addPipelineCommand('get', this.account);
        var ret = this.redis.execPipelineCommand();
        var result = ret.result[1][1];
        if (ret.err == null && result[1][1]) {
            var accountinfo = JSON.parse(result[1][1]);
            this.password = accountinfo.password;
        } else {
            this.reset();
            return false;
        }

        return true;
    }


    /**
     * 通过账号名加载玩家信息
     * @param {*} account 
     */
    loadUserinfoByAccount(account) {
        var i = 0;
        this.redis.addPipelineCommand('select', g_redis_db.account_map);
        this.redis.addPipelineCommand('get', account);
        var ret = this.redis.execPipelineCommand();
        if (ret.err == null && ret.result[1][1]) {
            var accountinfo = JSON.parse(ret.result[1][1]);
            this.userid = accountinfo.userid;
            this.account = accountinfo.account;
            this.password = accountinfo.password;
        } else {
            this.reset();
            return false;
        }

        return this.loadUserinfoByUserid(this.userid);
    }

    /**
     * 保存所有信息
     */
    saveAll() {
        this.saveMysqlUserInfo();
        this.saveRedisUserInfo();
    }

    /**
     * 将redis的玩家信息更新
     */
    saveRedisUserInfo() {
        var account = this.account;
        var userid = this.userid;

        if (account == '' || userid == '') {
            return false;
        }

        //写入账号表信息
        this.redis.addPipelineCommand('select', g_redis_db.account_map);
        //构建账号信息
        var accountinfo = {
            userid: this.userid,
            account: this.account,
            password: this.password,
        }
        this.redis.addPipelineCommand('set', account, JSON.stringify(accountinfo));

        //写入玩家表
        this.redis.addPipelineCommand('select', g_redis_db.user_info);
        this.redis.addPipelineCommand('set', userid, JSON.stringify(this.getAttriObj()));

        //执行命令
        this.redis.execPipelineCommand();

        return true;
    }

    /**
     * 更新MySQL的玩家信息
     */
    saveMysqlUserInfo() {

    }

}

module.exports = m_user;