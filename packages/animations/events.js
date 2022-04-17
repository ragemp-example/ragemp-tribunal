var animations = require('./index.js');
module.exports = {
    "init": () => {
        animations.init();
        inited(__dirname);
    },
    "animations.play": (player, dict, name, speed, flag) => {
        animations.playAnimation(player, dict, name, speed, flag);
    },
    "animations.playById": (player, id) => {
        animations.playAnimationById(player, id);
    },
    "animations.stop": (player) => {
        animations.stopAnimation(player);
    }
}
