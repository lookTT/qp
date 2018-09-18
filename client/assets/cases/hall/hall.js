
cc.Class({
    extends: cc.Component,

    properties: {
        headimg: cc.Sprite,
        userName: cc.Label,
        coins: cc.Label,
        gems: cc.Label,
    },

    onLoad() {
        // this.headimg
        this.userName.string = cc.qp.userMgr.userName;
        this.coins.string = cc.qp.userMgr.coins;
        this.gems.string = cc.qp.userMgr.gems;
    },

    start() {

    },

    // update (dt) {},
});
