
var Fiber = require('fibers');
var CMySQL = require('../framework/db/mysql')
var configMysql = require("../configMysql");
var mysql = new CMySQL(configMysql, Fiber);

function func() {
    console.log("start of func!!!!!!!!!!!!!!!!!!!!!!");
    var ret = mysql.query("select * from t_users;");
    if (ret.err) {
        console.log(ret.err);
    }
    else {
        if (ret.rows.length == 0) {
            return null;
        }
        // console.log(ret.rows[0]);
        console.log(ret.rows[0].userid);
        console.log(ret.rows[0].name);
    }

    var ret = mysql.query("select * from t_games;");
    if (ret.err) {
        console.log(ret.err);
    }
    else {
        if (ret.rows.length == 0) {
            return null;
        }
        // console.log(ret.rows[0]);
        console.log(ret.rows[0].room_uuid);
        console.log(ret.rows[0].create_time);
    }

    console.log("end of func!!!!!!!!!!!!!!!!!!!!!!");
}

function fund() {
    console.log("start of func!!!!!!!!!!!!!!!!!!!!!!");
    var ret = mysql.query("select * from t_users;");
    if (ret.err) {
        console.log(ret.err);
    }
    else {
        if (ret.rows.length == 0) {
            return null;
        }
        // console.log(ret.rows[0]);
        console.log(ret.rows[0].userid);
        console.log(ret.rows[0].name);
    }

    var ret = mysql.query("select * from t_games;");
    if (ret.err) {
        console.log(ret.err);
    }
    else {
        if (ret.rows.length == 0) {
            return null;
        }
        // console.log(ret.rows[0]);
        console.log(ret.rows[0].room_uuid);
        console.log(ret.rows[0].create_time);
    }

    console.log("end of func 11111111111111111111111111111");
    console.log("end of func 11111111111111111111111111111");
}

Fiber(function () {
    func();
    fund();
}).run();


