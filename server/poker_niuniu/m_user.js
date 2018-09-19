'use strict'
var g_redis_db = require("../framework/g_redis_db");
var utils = require("../framework/utils");

class m_user {
    constructor(_redis, _mysql) {
        this.reset();

        this.redis = _redis;
        this.mysql = _mysql;
    }


    reset() {
    }


}

module.exports = m_user;