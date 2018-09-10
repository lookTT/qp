'use strict'
class proxy_all {
    constructor() {
        this.http = require('http');
        this.httpProxy = require('http-proxy');
        this.proxy = null;
        this.server = null;

        this.isSet = false;
    }


    runHttpProxy(server_ip, server_port) {
        if (this.isSet) {
            return;
        }
        this.isSet = true;

        var self = this;

        this.proxy = this.httpProxy.createProxyServer({});
        this.server = this.http.createServer(function (req, res) {
            self.proxy.web(req, res, { target: `http://${server_ip}:${server_port}` });
        });

        setTimeout(function () {
            console.log("proxy_http listening on port " + server_port);
            self.server.listen(server_port);
        }, 1000);
    };


    runSocketioProxy(server_ip, server_port) {
        if (this.isSet) {
            return;
        }
        this.isSet = true;

        var self = this;

        this.server = this.httpProxy.createServer({
            target: `ws://${server_ip}:${server_port}`,
            ws: true,
            xfwd: true,
        });

        setTimeout(function () {
            console.log("proxy_socketio listening on port " + server_port);
            self.server.listen(server_port);
        }, 1000);
    };
}

module.exports = proxy_all;