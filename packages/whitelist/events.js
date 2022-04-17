"use strict";

let whitelist = require('./index.js');
let allowed = whitelist.getAllowed();

module.exports = {
    "init": async () => {
        await whitelist.init();
        inited(__dirname);
    },
    // "player.joined": (player) => {
    //     if (!whitelist.isEnabled()) return;

    //     if (whitelist.isInWhiteList(player.socialClub)) {
    //         console.log(`[WHITELIST] ${player.socialClub} зашел на сервер по вайтлисту`);
    //     } else {
    //         console.log(`[WHITELIST] ${player.socialClub} пытался войти, но его нет в вайтлисте`);
    //         player.call('notifications.push.error', [`Social Club ${player.socialClub} не находится в вайтлисте`]);
    //         player.kick("Kicked");
    //     }
    // }
}