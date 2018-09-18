
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.initMgr();
    },

    initMgr() {
        if (!cc.qp) {
            cc.qp = {};
        }

        cc.qp.netMgr = require('netMgr');
        cc.qp.netMgr.connect();

        var userMgr = require('userMgr');
        cc.qp.userMgr = new userMgr();

        var utils = require('utils');
        cc.qp.utils = new utils();

        cc.args = cc.qp.utils.urlParse();
    },

    start() {
        // Math.seed = function (s) {
        //     var m_w = s;
        //     var m_z = 987654321;
        //     var mask = 0xffffffff;

        //     return function () {
        //         m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
        //         m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;

        //         var result = ((m_z << 16) + m_w) & mask;
        //         result /= 4294967296;

        //         return result + 0.5;
        //     }
        // }
        // Math.random = Math.seed(1234);

        // cc.qp.netMgr.sioHall.on("cs_pingpong", function (data) {
        //     cc.log('cs_pingpong111');
        //     cc.log(data);
        // });

        // cc.qp.netMgr.sioHall.on("cs_pingpong", function (data) {
        //     cc.log('cs_pingpong222');
        //     cc.log(data);
        // });

        // var data = {
        //     msg: "cs_pingpong",
        //     name: "abc",
        //     sex: "1",
        // }
        // cc.qp.netMgr.send2HallBySIO('cs_pingpong', data);

        // var msg = {
        //     account: 'z1',
        //     password: '123456',
        // }
        // cc.qp.netMgr.send2HallByGet('signin', msg, function (ret) {
        //     cc.log('send2HallByGet');
        //     cc.log(ret);
        // });

        // var msg = {
        //     account: 'z1',
        //     password: '123456',
        // }
        // cc.qp.netMgr.send2HallByPost('signin', msg, function (ret) {
        //     cc.log('send2HallByPost');
        //     cc.log(ret);
        // });
    },

    // update (dt) {},

    onClickGuestLogin(event) {
        var account = cc.args.account;
        if (account == null) {
            account = cc.sys.localStorage.getItem("account");
        }

        if (account == null) {
            account = Date.now();
            cc.sys.localStorage.setItem("account", account);
        }

        cc.qp.userMgr.login(account, account);
    }
});
