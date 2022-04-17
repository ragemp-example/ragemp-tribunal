"use strict";


mp.death = {
    // Время ожидания предложения (ms)
    waitHurtTime: 4000,
    // Время ожидания медиков (ms)
    medKnockTime: 10 * 60 * 1000,
    // Время ожидания без медиков (ms)
    knockTime: 100 * 1000,
    // Таймер ожидания медиков
    knockTimer: null,

    knock(player, enable) {
        var dict = "amb@world_human_bum_slumped@male@laying_on_left_side@base";
        player.clearTasksImmediately();
        if (enable) mp.utils.requestAnimDict(dict, () => {
            player.taskPlayAnim(dict, 'base', 8.0, 0, -1, 1, 1.0, false, false, false);
        });
    },
    disableControls(enable) {
        mp.events.call(`mapCase.enable`, !enable);
        mp.events.call(`inventory.enable`, !enable);
        mp.callCEFV(`interactionMenu.enable = ${!enable}`);
        mp.events.call(`effect`, `MP_Killstreak_Out`, 800);
    },
    startKnockTimer(time) {
        this.stopKnockTimer();
        this.knockTimer = mp.timer.add(() => {
            mp.events.call(`death.callRemote.spawn`);
        }, time);
        mp.callCEFV(`timer.start('death', ${time})`);
    },
    stopKnockTimer() {
        mp.timer.remove(this.knockTimer);
        mp.callCEFV(`timer.stop()`);
    }
};

mp.events.add({
    "death.callRemote.spawn": () => {
        var pos = mp.players.local.position;
        var groundZ = mp.game.gameplay.getGroundZFor3dCoord(pos.x, pos.y, pos.z + 2, false, false);
        var dimension = mp.players.local.dimension;
        // mp.events.call(`weapons.ammo.sync`, true);
        mp.events.callRemote(`death.spawn`, groundZ, dimension, true);
    },
    "playerDeath": (player, reason, killer) => {
        if (mp.players.local.getVariable('room')) return;
        mp.death.disableControls(true);
        var arrest = false;
        if (killer && killer.remoteId != mp.players.local.remoteId) {
            var factionId = killer.getVariable("factionId");
            var haveCuffs = mp.busy.includes("cuffs");
            arrest = (mp.factions.isPoliceFaction(factionId) || mp.factions.isFibFaction(factionId)) && mp.police.wanted && haveCuffs;
        }
        mp.timer.add(() => {
            if (arrest) return mp.events.callRemote(`police.cells.forceArrest`);
            var knocked = mp.players.local.getVariable("knocked");
            if (!knocked) {
                var data = {
                    medKnockTime: mp.death.medKnockTime,
                    knockTime: mp.death.knockTime,
                };
                mp.callCEFV(`offerDialog.show('death', ${JSON.stringify(data)})`);
            } else {
                mp.events.call(`death.callRemote.spawn`);
            }
        }, mp.death.waitHurtTime);

    },
    "entityStreamIn": (player) => {
        if (player.type != "player") return;
        var knocked = player.getVariable("knocked") || false;
        mp.death.knock(player, knocked);
    },
    "render": () => {
        var knocked = mp.players.local.getVariable("knocked");
        if (knocked) mp.game.controls.disableAllControlActions(0);
    },
    "time.main.tick": () => {
        var player = mp.players.local;
        if (!player.getVariable("knocked")) return;
        if (player.isPlayingAnim("amb@world_human_bum_slumped@male@laying_on_left_side@base", "base", 3)) return;
        mp.death.knock(player, true);
    },
});

mp.events.addDataHandler("knocked", (player, knocked) => {
    mp.death.knock(player, knocked);
    if (player.remoteId == mp.players.local.remoteId) {
        mp.death.disableControls(knocked);
        if (knocked) {
            // mp.notify.info(`Ожидайте медиков в течение ${mp.death.knockTime / 1000} сек.`, `Здоровье`);
            mp.death.startKnockTimer(knocked);
        } else mp.death.stopKnockTimer();
    }
});
