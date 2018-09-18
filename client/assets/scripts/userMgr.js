cc.Class({
    extends: cc.Component,

    properties: {
        userid: '',
        account: '',
        password: '',
        mask: '',
        userName: '',
        sex: '',
        headimg: '',
        level: 1,
        exp: 0,
        coins: 0,
        gems: 0,
        lucky: 0,
        roomid: '',
        history: '',
        signup_time: -1,
        signin_time: -1,
        bind_userid: '',

        ip: '',
        token: '',
    },



    login(account, password) {
        var self = this;
        var msgSignin = {
            account: account,
            password: password,
        }

        cc.qp.netMgr.send2HallByPost('signin', msgSignin, function (retSignin) {
            if (retSignin.errorid == 0) {
                //登陆成功
                var info = retSignin.info;

                self.userid = info.userid;
                self.account = info.account;
                self.mask = info.mask;
                self.userName = cc.qp.utils.fromBase64(info.name);
                self.sex = info.sex;
                self.headimg = info.headimg;
                self.level = info.level;
                self.exp = info.exp;
                self.coins = info.coins;
                self.gems = info.gems;
                self.lucky = info.lucky;
                self.roomid = info.roomid;
                self.history = info.history;
                self.signup_time = info.signup_time;
                self.signin_time = info.signin_time;
                self.bind_userid = info.bind_userid;

                self.ip = info.ip;
                self.token = info.token;

                cc.director.loadScene("hall");
            }
            else if (retSignin.errorid == 2) {
                var msgSignup = {
                    account: account,
                    password: password,
                    name: account,
                }
                //不存在的玩家则进行创建
                cc.qp.netMgr.send2HallByPost('signup', msgSignup, function (retSignup) {
                    if (retSignup.errorid == 0) {
                        self.login(account, password); //重新登录
                    }
                });

            }


        });
    },

});
