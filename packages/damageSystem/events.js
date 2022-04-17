"use strict";
let damageSystem = require('./index.js');

let utils;

module.exports = {
    "init": async () => {
        utils = call("utils");

        await damageSystem.init();
        inited(__dirname);
    },
    "playerDamaged": (player, damagedPlayerId, boneName) => {
        let damagedPlayer = mp.players.at(damagedPlayerId);
        if (damagedPlayer == null) return;
        let damageValue = damageSystem.findDamageValue(player.weapon);
        if (damageValue == null) {
            damageValue = damageSystem.defaultDamage;
        }

        let damagedPlayerInfo = {
            armour: damagedPlayer.armour,
            health: damagedPlayer.health
        };

        // if (damagedPlayer.vehicle != null) {
        //     if (utils.randomInteger(0, 10) > 0) {
        //         return;
        //     }
        //     damageSystem.damagePlayer(damagedPlayerInfo, damageValue);
        // }
        // else {
        //     damageSystem.damagePlayer(damagedPlayerInfo, damageValue);
        // }
        damageSystem.damagePlayer(damagedPlayerInfo, damageValue);

        if (damagedPlayerInfo.health <= 0 && !damagedPlayer.isCustomDeath) {
            damagedPlayer.isCustomDeath = true;
            mp.events.call("customDeath", damagedPlayer, player.weapon, player);
        }
        damagedPlayer.armour = Math.clamp(damagedPlayerInfo.armour, 0, 100);
        damagedPlayer.health = Math.clamp(damagedPlayerInfo.health, 0, 100);
    },
};