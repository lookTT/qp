
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

        this.headimg.getComponent("imgLoader").url = "http://b-ssl.duitang.com/uploads/item/201501/23/20150123095036_GCWVx.jpeg";
    },

    start() {

    },

    onclick() {
        this.headimg.getComponent("imgLoader").url = "http://b-ssl.duitang.com/uploads/item/201411/29/20141129235826_NPwFz.jpeg";
    }

    // update (dt) {},
});
