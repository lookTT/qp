'use strict'
class db_mysql {
    constructor(config = {}, _Fiber) {
        this.Fiber = _Fiber;

        this.mysql = require('mysql');
        this.pool = this.mysql.createPool({
            host: config.host ? config.host : "127.0.0.1",
            port: config.port ? config.port : 3306,
            user: config.user ? config.user : "root",
            password: config.password ? config.password : "",
            database: config.db ? config.db : "test",
            datestrings: true,
        });
    }

    query(sql) {
        // console.log(sql);
        var fiber = this.Fiber.current;
        var ret = {
            err: null,
            rows: null,
            fields: null,
        };

        this.pool.getConnection(function (err, conn) {
            if (err) {
                ret.err = err;
                fiber.run();
            } else {
                conn.query(sql, function (qerr, vals, fields) {
                    //释放连接  
                    conn.release();
                    ret.err = qerr;
                    ret.rows = vals;
                    ret.fields = fields;
                    fiber.run();
                });
            }
        });
        this.Fiber.yield();
        return ret;
    };
}

module.exports = db_mysql;