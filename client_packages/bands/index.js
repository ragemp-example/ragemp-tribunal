"use strict";

mp.bands = {
    // Блипы зон гетто
    bandZones: [],
    // Показ блипов на карте
    zonesShow: false,
    // Цвета блипов (factionId: blipColor)
    colors: {
        8: 2,
        9: 27,
        10: 46,
        11: 3,
        16: 1
    },
    // Нативки
    natives: {
        _GET_BLIP_INFO_ID_ITERATOR: "0x186E5D252FA50E7D",
        GET_FIRST_BLIP_INFO_ID: "0x1BEDE233E6CD2A1F",
        GET_NEXT_BLIP_INFO_ID: "0x14F96AA50D6FBEA7",
        DOES_BLIP_EXIST: "0xA6DB27D19ECBB7DA",
        SET_BLIP_SPRITE: "0xDF735600A4696DAF",
        SET_BLIP_ALPHA: "0x45FF974EEE1C8734",
        SET_BLIP_ROTATION: "0xF87683CDF73C3F6E",
        SET_BLIP_COLOUR: "0x03D7FB09E75D6B7E",
        SET_BLIP_FLASHES: "0xB14552383D39CE3E",
        GET_BLIP_COLOUR: "0xDF729E8D20CF7327",
        _SET_BLIP_SHOW_HEADING_INDICATOR: "0x5FBCA48327B914DF",
    },
    blipAlpha: 175,
    flashTimer: null,
    flashColor: 4,
    captureTimer: null,
    captureFactions: [],


    initBandZones(zones) {
        this.clearBandZones();
        zones.forEach(zone => {
            var blip = mp.game.ui.addBlipForRadius(zone.x, zone.y, 50, 100);
            mp.game.invoke(this.natives.SET_BLIP_SPRITE, blip, 5);
            mp.game.invoke(this.natives.SET_BLIP_ALPHA, blip, this.blipAlpha);
            mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, this.colors[zone.factionId]);
            this.bandZones.push(blip);
            this.saveBlip(blip);
            if (zone.flash) this.flashBlip(zone.id, true);
        });
    },
    clearBandZones() {
        var blips = mp.storage.data.bandZones;
        if (!blips) return;
        blips.forEach(blip => {
            mp.game.ui.removeBlip(blip);
        });
        blips = [];
    },
    saveBlip(blip) {
        if (!mp.storage.data.bandZones) mp.storage.data.bandZones = [];
        mp.storage.data.bandZones.push(blip);
    },
    flashBlip(id, toggle) {
        var blip = this.bandZones[id - 1];
        // mp.game.invoke(this.natives.SET_BLIP_FLASHES, blip, toggle);
        mp.timer.remove(this.flashTimer);
        if (!toggle) return;
        var oldColor = mp.game.invoke(this.natives.GET_BLIP_COLOUR, blip);
        this.flashTimer = mp.timer.addInterval(() => {
            var color = mp.game.invoke(this.natives.GET_BLIP_COLOUR, blip);
            if (color == oldColor) mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, this.flashColor);
            else mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, oldColor);
        }, 500);
    },
    setOwner(id, factionId) {
        var blip = this.bandZones[id - 1];
        this.flashBlip(id, false);
        mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, this.colors[factionId]);
    },
    startCapture(bandId, enemyBandId, time, bandScore = 0, enemyBandScore = 0) {
        time = parseInt(time);
        mp.callCEFV(`captureScore.start(${bandId}, ${enemyBandId}, ${time}, ${bandScore}, ${enemyBandScore})`);
        mp.timer.remove(this.captureTimer);
        //this.removePlayerBlips();
        this.captureFactions = [bandId, enemyBandId];

        //this.createPlayerBlips();
        this.captureTimer = mp.timer.add(() => {
            //this.removePlayerBlips();
            this.captureFactions = [];
        }, time * 1000);
    },
    stopCapture() {
        mp.callCEFV(`captureScore.show = false`);
    },
    setCaptureScore(bandId, score) {
        mp.callCEFV(`captureScore.setScore(${bandId}, ${score})`);
    },
    logKill(target, killer, reason) {
        reason = parseInt(reason);

        if (typeof target == 'object') target = JSON.stringify(target);
        if (typeof killer == 'object') killer = JSON.stringify(killer);
        // самоубийство
        if (reason == 3452007600) return mp.callCEFV(`killList.add(\`${target}\`)`);
        // на авто
        if (reason == 2741846334) return mp.callCEFV(`killList.add(\`${target}\`, \`${killer}\`, 'car')`);
        // рукопашка
        if (reason == 2725352035) return mp.callCEFV(`killList.add(\`${target}\`, \`${killer}\`, 'hand')`);

        // огнестрел, либо что-то еще? :D
        var name = mp.weapons.getWeaponName(reason);
        mp.callCEFV(`killList.add(\`${target}\`, \`${killer}\`, \`${name}\`)`);
    },
    createPlayerBlip(player) {
        if (!this.captureFactions.length) return;
        if (player.remoteId == mp.players.local.remoteId) return;
        var factionId = player.getVariable("factionId");
        if (!this.captureFactions.includes(factionId)) return;
        player.createBlip(1);
        mp.game.invoke(this.natives._SET_BLIP_SHOW_HEADING_INDICATOR, player.blip, true);
        mp.game.invoke(this.natives.SET_BLIP_COLOUR, player.blip, this.colors[factionId]);
    },
    createPlayerBlips() {
        mp.players.forEach(rec => {
            this.createPlayerBlip(rec);
        });
    },
    removePlayerBlips() {
        mp.players.forEach(rec => {
            var factionId = rec.getVariable("factionId");
            if (!mp.factions.isBandFaction(factionId)) return;
            rec.destroyBlip();
        });
    },
    setStorageInfo(data) {
        var items = [];
        for (var i = 0; i < data.names.length; i++) {
            var name = data.names[i];
            var count = data.counts[i];
            var per = parseInt(count / this.bandZones.length * 100);
            items.push({
                text: name,
                values: [`${count} зон ( ${per}% )`],
            });
        }
        items.push({
            text: "Вернуться"
        });

        mp.callCEFV(`selectMenu.setItems('bandPower', ${JSON.stringify(items)})`);

        var cash = JSON.stringify([`$${data.cash}`]);
        mp.callCEFV(`selectMenu.setItemValues('bandCash', 'Баланс', \`${cash}\`)`);
    },
    setRobbedVehicle(vehicle, enable) {
        if (enable) {
            vehicle.setTyreBurst(0, true, 1000);
            vehicle.setTyreBurst(1, true, 1000);
            vehicle.setTyreBurst(4, true, 1000);
            vehicle.setTyreBurst(5, true, 1000);

            vehicle.setDoorBroken(0, false);
            vehicle.setDoorBroken(1, false);
            vehicle.setDoorBroken(2, false);
            vehicle.setDoorBroken(3, false);
            vehicle.setDoorBroken(4, false);
            vehicle.setDoorBroken(5, false);

            vehicle.setEngineHealth(0);
            vehicle.setDamage(0, 1, 0, 200, 200, false);
            vehicle.setDamage(0, -1, 0, 200, 200, false);
            vehicle.setDamage(1, 0, 0, 200, 200, false);
            vehicle.setDamage(-1, 0, 0, 200, 200, false);

            vehicle.setDirtLevel(15);
        } else {
            vehicle.setFixed();
            vehicle.setDirtLevel(0);
        }
    },
};

mp.events.add({
    "characterInit.done": () => {},
    "bands.bandZones.init": (zones) => {
        mp.bands.initBandZones(zones);
    },
    "bands.bandZones.flash": (id, toggle) => {
        mp.bands.flashBlip(id, toggle);
    },
    "bands.bandZones.set": (id, factionId) => {
        mp.bands.setOwner(id, factionId);
    },
    "bands.bandZones.show": (enable) => {
        var alpha = (enable) ? mp.bands.blipAlpha : 0;
        mp.bands.bandZones.forEach(blip => {
            mp.game.invoke(mp.bands.natives.SET_BLIP_ALPHA, blip, alpha);
        });
        mp.bands.zonesShow = enable;
    },
    "bands.capture.start": (bandId, enemyBandId, time, bandScore = 0, enemyBandScore = 0) => {
        mp.bands.startCapture(bandId, enemyBandId, time, bandScore, enemyBandScore);
    },
    "bands.capture.stop": () => {
        mp.bands.stopCapture();
    },
    "bands.capture.score.set": (bandId, score) => {
        mp.bands.setCaptureScore(bandId, score);
    },
    "bands.capture.killList.log": (target, killer, reason) => {
        mp.bands.logKill(target, killer, reason);
    },
    "bands.storage.info.set": (data) => {
        mp.bands.setStorageInfo(data);
    },
    "render": () => {
        if (!mp.bands.zonesShow) return;
        mp.bands.bandZones.forEach(blip => {
            mp.game.invoke(mp.bands.natives.SET_BLIP_ROTATION, blip, 0);
        });
    },
    "entityStreamIn": (entity) => {
        // if (entity.type == "player") mp.bands.createPlayerBlip(entity);
        // else if (entity.type == "vehicle" && entity.getVariable("robbed")) mp.bands.setRobbedVehicle(entity, true);
    },
});

mp.events.addDataHandler("factionId", (player, value) => {
    if (player.type == "player") player.destroyBlip();
});

mp.events.addDataHandler("robbed", (vehicle, value) => {
    if (vehicle.type == "vehicle") mp.bands.setRobbedVehicle(vehicle, value);
});

// for tests
// mp.players.local.destroyBlip();
// mp.players.local.createBlip(1);
// mp.game.invoke(mp.bands.natives._SET_BLIP_SHOW_HEADING_INDICATOR, mp.players.local.blip, true);
