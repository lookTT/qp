// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    statics: {

        sio: null,
        queueMsg: [],


        initHallNet(cbOK, cbFailed) {
            if (!cbOK) cbOK = function () { }
            if (!cbFailed) cbFailed = function () { }

            if (this.sio) {
                cc.log("sioHall is not null");
                return;
            }

            if (typeof io === 'undefined') {
                cc.error('You should import the socket.io.js as a plugin!');
                return;
            }

            this.queueMsg = [];
            this.sio = io.connect(`ws://${netMgr.hallHost}:${netMgr.hallPort}`, {
                'reconnection': false,
                'force new connection': true,
                'transports': ['websocket', 'polling']
            });

            this.sio.isConnect = false;

            this.sio.on("connect", function () {
                cc.log('connect');
                this.sio.isConnect = true;

                //补发没发出去的消息
                for (var key in this.queueMsg) {
                    var data = this.queueMsg[key];
                    cc.log('socketio reissue ', data.p);
                    this.sio.emit(data.p, data.m);
                }
                this.queueMsg = [];

                cbOK();
            });

            this.sio.on('disconnect', function () {
                this.sio.isConnect = false;
            });

            this.sio.on('connect_error', function () {
                this.sio.isConnect = false;

                cbFailed();
            });

        },

        closeHallNet() {
            this.sio.close(); //发起断连请求
            this.sio = null;
        },

        send2HallBySIO(protocol, msg) {
            if (!this.sio) return;
            if (this.sio.isConnect) {
                if (typeof (msg) != typeof ("")) {
                    msg = JSON.stringify(msg);
                }
                this.sio.emit(protocol, msg);
            }
            else {
                cc.log("send binary socketio instance wasn't ready...");
                this.queueMsg.push({ p: protocol, m: msg });
            }
        },

    },



});
