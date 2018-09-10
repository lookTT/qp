var Service = require("./s_hall");
var configRedis = require("../configRedis");
var configMysql = require("../configMysql");
new Service(3000, configRedis, configMysql);


//http://192.168.238.128:3000/signup?account=z1&password=123456&name=zzz1
//http://192.168.238.128:3000/signin?account=z1&password=123456