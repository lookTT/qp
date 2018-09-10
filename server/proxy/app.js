var proxy_all = require("./lib/proxy_all");

//账号服务器与大厅服务器的HTTP消息透传
var http_server_list = [
	{ host: '192.168.1.3', port: 80 },
	{ host: '192.168.1.3', port: 9900 },
	{ host: '192.168.1.3', port: 9901 },
];

//游戏服务器的socket.io消息透传
var socketio_server_list = [
	{ host: '192.168.1.3', port: 10000 },
	{ host: '192.168.1.3', port: 10001 },
	{ host: '192.168.1.3', port: 10002 },
	{ host: '192.168.1.3', port: 10003 },
	{ host: '192.168.1.3', port: 10004 },
	{ host: '192.168.1.3', port: 10005 },
];

for (var i = 0; i < http_server_list.length; i++) {
	var element = http_server_list[i];
	var ph = new proxy_all();
	ph.runHttpProxy(element.host, element.port);
}

for (var i = 0; i < socketio_server_list.length; i++) {
	var element = socketio_server_list[i];
	var ph = new proxy_all();
	ph.runSocketioProxy(element.host, element.port);
}

console.log("ready for it");

process.on('uncaughtException', function (err) {
	console.log('uncaughtException Start:');
	console.log(err);
	console.log('uncaughtException End!');
});