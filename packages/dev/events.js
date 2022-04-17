"use strict";

let dev = call('dev');
let terminal = call('terminal');

module.exports = {
    "init": () => {
        dev.init();
        inited(__dirname);
    },
    "dev.eval.result": (player, result, recId) => {
        var rec = mp.players.at(recId);
        if (!rec || !rec.character || !rec.character.admin) return;

        terminal.log(`${player.name} (client) => ${result}`, rec);
    },
    "characterInit.done": (player) => {
        if (!dev.showBuild) return;

        player.call(`hud.setData`, [{
            build: dev.getBuild(),
            branch: dev.getBranch(),
        }]);
    },
}
