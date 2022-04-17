"use strict";

module.exports = {
    show(player, text) {
        player.call("prompt.show", [text]);
    },
    hide(player) {
        player.call("prompt.hide");
    },
    showByName(player, name) {
        player.call("prompt.showByName", [name]);
    }
};
