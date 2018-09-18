'use strict'

var netHttp = cc.Class({
    extends: cc.Component,

    statics: {
        send2HallByGet(host, port, protocol, data, handler) {
            var xhr = cc.loader.getXMLHttpRequest();

            var str = "?";
            for (var k in data) {
                if (str != "?") {
                    str += "&";
                }
                str += k + "=" + data[k];
            }

            var requestURL = `http://${host}:${port}/${protocol}` + encodeURI(str);

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

        send2HallByPost(host, port, protocol, data, handler) {
            data = JSON.stringify(data);
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status >= 200) {
                    var ret = JSON.parse(xhr.responseText);
                    handler(ret);
                }
            };
            var requestURL = `http://${host}:${port}/${protocol}`;
            xhr.open("POST", requestURL);
            xhr.setRequestHeader("Content-Type", "text/plain", "charset=utf-8");


            xhr.send(data);
        },

    },
});
