"use strict";

let timer = require("./index.js");

module.exports = {
    "init": () => {
        timer.init();
        inited(__dirname);
        // timer.add(async function() {
        //     throw new Error("BAD ERROR");
        //     console.log("TIMER1");
        // }, 5000);
    },
    // "player.joined": (player) => {
    //     if (timer.getChecker() == null) {
    //         timer.setChecker(player);
    //     }
    // },
    // "playerQuit": (player) => {
    //     if (timer.getChecker() == player) {
    //         let newChecker = mp.players.toArray().find(x => x != player);
    //         timer.setChecker(newChecker);
    //     }
    // },
    // "timer.error": (player) => {
    //     if (player != timer.getChecker()) player.call("timer.check.stop", []);
    //     throw new Error("[TIMER] ERROR! Серверный таймер перестал отвечать");
    // }
}