'use strict'

var HALL_HOST = '192.168.238.128';
var HALL_PORT = '3000';

var netMgr = cc.Class({
    extends: cc.Component,

    statics: {
        hallHost: HALL_HOST,
        hallPort: HALL_PORT,
        sioHall: null,
        queueHall: null,

        gameHost: '',
        gamePort: '',
        wsGame: null,


        connect(cbOK, cbFailed) {
            if (!cbOK) cbOK = function () { }
            if (!cbFailed) cbFailed = function () { }

            if (netMgr.sioHall) {
                cc.log("sioHall is not null");
                return;
            }

            if (typeof io === 'undefined') {
                cc.error('You should import the socket.io.js as a plugin!');
                return;
            }

            netMgr.queueHall = [];
            netMgr.sioHall = io.connect(`ws://${netMgr.hallHost}:${netMgr.hallPort}`, {
                'reconnection': false,
                'force new connection': true,
                'transports': ['websocket', 'polling']
            });

            netMgr.sioHall.isConnect = false;

            netMgr.sioHall.on("connect", function () {
                cc.log('connect');
                netMgr.sioHall.isConnect = true;

                //补发没发出去的消息
                for (var key in netMgr.queueHall) {
                    var data = netMgr.queueHall[key];
                    cc.log('socketio reissue ', data.p);
                    netMgr.sioHall.emit(data.p, data.m);
                }
                netMgr.queueHall = [];

                cbOK();
            });

            netMgr.sioHall.on('disconnect', function () {
                netMgr.sioHall.isConnect = false;
            });

            netMgr.sioHall.on('connect_error', function () {
                netMgr.sioHall.isConnect = false;

                cbFailed();
            });

        },

        closeHallNet() {
            netMgr.sioHall.close(); //发起断连请求
            netMgr.sioHall = null;
        },

        send2HallBySIO(protocol, msg) {
            if (!netMgr.sioHall) return;
            if (netMgr.sioHall.isConnect) {
                if (typeof (msg) != typeof ("")) {
                    msg = JSON.stringify(msg);
                }
                netMgr.sioHall.emit(protocol, msg);
            }
            else {
                cc.log("send binary socketio instance wasn't ready...");
                netMgr.queueHall.push({ p: protocol, m: msg });
            }
        },

        send2HallByGet(protocol, data, handler) {
            var xhr = cc.loader.getXMLHttpRequest();

            var str = "?";
            for (var k in data) {
                if (str != "?") {
                    str += "&";
                }
                str += k + "=" + data[k];
            }

            var requestURL = `http://${netMgr.hallHost}:${netMgr.hallPort}/${protocol}` + encodeURI(str);

            xhr.open("GET", requestURL, true);
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if (handler !== null) {
                            handler(ret);
                        }
                    } catch (e) {
                    }
                    finally {
                        if (cc.vv && cc.vv.wc) {
                        }
                    }
                }
            };

            xhr.timeout = 5000;
            xhr.send();
        },

        send2HallByPost(protocol, data, handler) {
            data = JSON.stringify(data);
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status >= 200) {
                    var ret = JSON.parse(xhr.responseText);
                    handler(ret);
                }
            };
            var requestURL = `http://${netMgr.hallHost}:${netMgr.hallPort}/${protocol}`;
            xhr.open("POST", requestURL);
            xhr.setRequestHeader("Content-Type", "text/plain", "charset=utf-8");


            xhr.send(data);
        },





    },
});
