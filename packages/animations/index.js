"use strict";

// Список всех анимаций
let list = require('./data.js');

module.exports = {
    init() {

    },
    playAnimation(player, dict, name, speed, flag) {
        // player.playAnimation(dict, name, speed, flag);
        player.setVariable("anim", {
            dict: dict,
            name: name,
            speed: speed,
            flag: flag
        });
    },
    playAnimationById(player, id) {
        id = Math.clamp(id, 0, list.length - 1);
        var anim = list[id].split(' ');
        this.playAnimation(player, anim[0], anim[1], 1, 1);
    },
    stopAnimation(player) {
        // player.stopAnimation();
        player.setVariable("anim", null);
    },
    has(dict, name) {
        return list.findIndex(x => x == (dict + " " + name)) != -1;
    },
}
