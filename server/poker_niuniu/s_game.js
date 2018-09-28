'use strict'
var service = require("../framework/service");
var m_user = require("./m_user");
var utils = require("../framework/utils");

class s_game extends service {
    constructor(port, redisConfig, mysqlConfig, serviceType, hallHost, hallPort) {
        super(port, redisConfig, mysqlConfig);

        this.serviceType = serviceType;
        this.hallHost = hallHost;
        this.hallPort = hallPort;

        this.interval = 0;

        this.setUpdateInterval(33);
    }

    onLoad() {

        super.onLoad(); //最后执行父类该方法
    }


    update() {

        var curTS = Date.parse(new Date());
        if (curTS - this.interval >= 10000) {
            this.interval = curTS;
            //10秒一次向hall服务器通知自己的状态
            var data = {
                type: this.serviceType,
                port: this.port,
            }
            var ret = this.getRequest(this.hallHost, this.hallPort, '/register', data);
            if (ret.errorid != 0) {
                console.log(ret.errorid, ret.data);
            }
        }


        super.update();
    }
}

module.exports = s_game;