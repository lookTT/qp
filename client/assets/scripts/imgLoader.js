cc.Class({
    extends: cc.Component,

    properties: {
        url: {
            get() {
                return this._url;
            },
            set(value) {
                this._url = value;

                var self = this;
                cc.loader.load(this.url, function (error, tex) {
                    if (error) {
                        cc.log("Load remote image failed: " + error);
                    }
                    else {
                        var spriteFrame = new cc.SpriteFrame(tex);
                        self.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    }
                });
            }
        },
    },

});
