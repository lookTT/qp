var port = process.argv[2] ? process.argv[2] : 3000;//端口号
var Service = require("./s_game");
var configRedis = require("../configRedis");
var configMysql = require("../configMysql");
var configGameType = require("../configGameType");
var configHall = require("../configHall");
new Service(port, configRedis, configMysql, configGameType.niuniu, configHall.host, configHall.port);

console.log("LET'S ROCK NOW!", "Listen Port:", port);
process.on('uncaughtException', function (err) {
    console.log('uncaughtException Start:');
    console.log(err);
    console.log('uncaughtException End!');
});


//http://192.168.238.128:3000/signup?account=z1&password=123456&name=zzz1
//http://192.168.238.128:3000/signin?account=z1&password=123456