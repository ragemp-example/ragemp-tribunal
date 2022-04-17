"use strict";

mp.mafia = {
    // Блипы зон для рекетов
    mafiaZones: [],
    // Показ блипов на карте
    zonesShow: false,
    // Цвета блипов (factionId: blipColor)
    colors: {
        12: 43,
        13: 31,
        14: 40,
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
    blipAlpha: 120,
    flashTimer: null,
    flashColor: 1,
    bizWarTimer: null,
    bizWarFactions: [],
    followPlayer: null,
    attachBootInfo: {
        3900892662: {
            pos: new mp.Vector3(0, -2, 1.25),
            rot: new mp.Vector3(0, 0, 0)
        },
        2364918497: {
            pos: new mp.Vector3(0, -2.8, 1.15),
            rot: new mp.Vector3(0, 0, 0)
        },
    },
    peds: [{
        model: "a_m_m_tennis_01",
        position: {
            x: 1393.211669921875,
            y: 1152.9739990234375,
            z: 114.44327545166016
        },
        heading: 93.38162994384766,
        defaultScenario: 'WORLD_HUMAN_AA_SMOKE'
    },
        {
            model: "g_m_m_mexboss_01",
            position: {
                x: -1501.0418701171875,
                y: 858.7176513671875,
                z: 181.59483337402344
            },
            heading: 108.4709701538086,
            defaultScenario: 'WORLD_HUMAN_SMOKING'
        },
        {
            model: "u_m_o_finguru_01",
            position: {
                x: -111.40033721923828,
                y: 999.7276611328125,
                z: 235.75689697265625
            },
            heading: 27.995311737060547,
            defaultScenario: 'WORLD_HUMAN_SMOKING_CLUBHOUSE'
        },
        {
            model: "ig_taostranslator",
            position: {
                x: -623.5755004882812,
                y: -236.7606964111328,
                z: 38.05701446533203
            },
            heading: 45.72397994995117,
            defaultScenario: 'WORLD_HUMAN_AA_COFFEE'
        },
    ],
    initMafiaZones(zones) {
        this.clearMafiaZones();
        zones.forEach(zone => {
            var blip = mp.game.ui.addBlipForRadius(zone.x, zone.y, 50, 150);
            mp.game.invoke(this.natives.SET_BLIP_SPRITE, blip, 5);
            mp.game.invoke(this.natives.SET_BLIP_ALPHA, blip, this.blipAlpha);
            mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, 4);
            this.mafiaZones.push(blip);
            this.saveBlip(blip);
            if (zone.flash) this.flashBlip(zone.id, true);
        });
    },
    clearMafiaZones() {
        var blips = mp.storage.data.mafiaZones;
        if (!blips) return;
        blips.forEach(blip => {
            mp.game.ui.removeBlip(blip);
        });
        blips = [];
    },
    saveBlip(blip) {
        if (!mp.storage.data.mafiaZones) mp.storage.data.mafiaZones = [];
        mp.storage.data.mafiaZones.push(blip);
    },
    flashBlip(id, toggle) {
        var blip = this.mafiaZones[id];
        // mp.game.invoke(this.natives.SET_BLIP_FLASHES, blip, toggle);
        mp.timer.remove(this.flashTimer);
        mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, 4);
        if (!toggle) return;
        var oldColor = mp.game.invoke(this.natives.GET_BLIP_COLOUR, blip);
        this.flashTimer = mp.timer.addInterval(() => {
            var color = mp.game.invoke(this.natives.GET_BLIP_COLOUR, blip);
            if (color == oldColor) mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, this.flashColor);
            else mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, oldColor);
        }, 500);
    },
    showBizWarMenu(data) {
        var items = [];
        var counts = [0, 0, 0];
        data.bizes.forEach(biz => {
            items.push({
                text: biz.name,
                values: [`ID: ${biz.id}`],
                factionId: biz.factionId,
            });
            counts[biz.factionId - 12]++;
        });
        items.push({
            text: "Закрыть"
        });


        mp.callCEFV(`selectMenu.setItems('mafiaBizWar', ${JSON.stringify(items)})`);
        mp.callCEFV(`selectMenu.setProp('mafiaBizWar', 'bizCount', ${data.bizCount})`);
        mp.callCEFV(`selectMenu.setProp('mafiaBizWar', 'names', ${JSON.stringify(data.names)})`);
        mp.callCEFV(`selectMenu.setProp('mafiaBizWar', 'counts', ${JSON.stringify(counts)})`);
        mp.callCEFV(`selectMenu.menus['mafiaBizWar'].update()`);
        mp.callCEFV(`selectMenu.showByName('mafiaBizWar')`);
    },
    startBizWar(mafiaId, enemyMafiaId, time, mafiaScore = 0, enemyMafiaScore = 0) {
        time = parseInt(time);
        mp.callCEFV(`captureScore.start(${mafiaId}, ${enemyMafiaId}, ${time}, ${mafiaScore}, ${enemyMafiaScore})`);
        mp.timer.remove(this.bizWarTimer);
        //this.removePlayerBlips();
        this.bizWarFactions = [mafiaId, enemyMafiaId];

        //this.createPlayerBlips();
        this.bizWarTimer = mp.timer.add(() => {
            //this.removePlayerBlips();
            this.bizWarFactions = [];
        }, time * 1000);
    },
    stopBizWar() {
        mp.callCEFV(`captureScore.show = false`);
    },
    setBizWarScore(mafiaId, score) {
        mp.callCEFV(`captureScore.setScore(${mafiaId}, ${score})`);
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
        if (!this.bizWarFactions.length) return;
        if (player.remoteId == mp.players.local.remoteId) return;
        var factionId = player.getVariable("factionId");
        if (!this.bizWarFactions.includes(factionId)) return;
        player.createBlip(1);
        mp.game.invoke(this.natives._SET_BLIP_SHOW_HEADING_INDICATOR, player.blip, true);
        mp.game.invoke(this.natives.SET_BLIP_COLOUR, player.blip, this.colors[factionId]);
    },
    createPlayerBlips() {
        // debug(`createPlayerBlips`)
        mp.players.forEach(rec => {
            this.createPlayerBlip(rec);
        });
    },
    removePlayerBlips() {
        // debug(`removePlayerBlips`)
        mp.players.forEach(rec => {
            var factionId = rec.getVariable("factionId");
            if (!mp.factions.isMafiaFaction(factionId)) return;
            rec.destroyBlip();
        });
    },
    setStorageInfo(data) {
        var items = [];
        for (var i = 0; i < data.names.length; i++) {
            var name = data.names[i];
            var count = data.counts[i];
            var per = parseInt(count / data.bizCount * 100);
            items.push({
                text: name,
                values: [`${count} биз. ( ${per}% )`],
            });
        }
        items.push({
            text: "Вернуться"
        });

        mp.callCEFV(`selectMenu.setItems('mafiaPower', ${JSON.stringify(items)})`);

        var cash = JSON.stringify([`$${data.cash}`]);
        mp.callCEFV(`selectMenu.setItemValues('mafiaCash', 'Баланс', \`${cash}\`)`);
    },
    registerAttachments() {
        // мешок на голове
        mp.attachmentMngr.register("headBag", "prop_cs_sack_01", 65068, new mp.Vector3(0.02, 0, 0),
            new mp.Vector3(90, -90, 10)
        );
    },
    startFollowToPlayer(playerId) {
        var player = mp.players.atRemoteId(playerId);
        if (!player) return;
        this.followPlayer = player;
    },
    stopFollowToPlayer() {
        this.followPlayer = null;
    },
    hasBag(player) {
        if (!player) player = mp.players.local;
        return player.hasAttachment("headBag");
    },
    playerPutIntoBoot(player, vehicleId) {
        if (!player || !mp.players.exists(player)) return;

        var a = require('animations/data.js')[802].split(" ");

        var vehicle = mp.vehicles.atRemoteId(vehicleId);
        if (vehicle && mp.vehicles.exists(vehicleId)) {
            var i = this.getAttachBootInfo(vehicle);
            // debug(`attachInfo:`)
            // debug(i)
            player.attachTo(vehicle.handle, 0, i.pos.x, i.pos.y, i.pos.z, i.rot.x, i.rot.y, i.rot.z, false, false, false, false, 2, true);
            mp.utils.requestAnimDict(a[0], () => {
                player.taskPlayAnim(a[0], a[1], 8, 0, -1, 1, 0, false, false, false);
            });
            if (mp.players.local.remoteId == player.remoteId) mp.busy.add("inBoot", false)
        } else {
            if (mp.players.local.remoteId == player.remoteId) {
                player.stopAnimTask(a[0], a[1], 3);
                mp.busy.remove("inBoot");
            } else player.clearTasksImmediately();
            player.detach(true, true);
        }
    },
    getAttachBootInfo(vehicle) {
        // debug(`model: ${vehicle.model}`)
        var info = this.attachBootInfo[vehicle.model];
        if (!info) return {
            pos: new mp.Vector3(0, -2.3, 1.25),
            rot: new mp.Vector3(0, 0, 0)
        };
        return info;
    }
};

mp.events.add({
    "mafia.mafiaZones.init": (zones) => {
        mp.mafia.initMafiaZones(zones);
    },
    "mafia.mafiaZones.flash": (id, toggle) => {
        mp.mafia.flashBlip(id, toggle);
    },
    "mafia.mafiaZones.show": (enable) => {
        var alpha = (enable) ? mp.mafia.blipAlpha : 0;
        mp.mafia.mafiaZones.forEach(blip => {
            mp.game.invoke(mp.bands.natives.SET_BLIP_ALPHA, blip, alpha);
        });
        mp.mafia.zonesShow = enable;
    },
    "mafia.bag.callRemote": (data) => {
        if (typeof data == 'string') data = JSON.parse(data);

        var rec = mp.utils.getNearPlayer(mp.players.local.position);
        if (!rec) return mp.notify.error(`Рядом никого нет`, `Мешок`);
        data.recId = rec.remoteId;
        mp.events.callRemote(`mafia.bag`, JSON.stringify(data));
    },
    "mafia.bizWar.showMenu": (data) => {
        mp.mafia.showBizWarMenu(data);
    },
    "mafia.bizWar.start": (mafiaId, enemymafiaId, time, mafiacore = 0, enemymafiacore = 0) => {
        mp.mafia.startBizWar(mafiaId, enemymafiaId, time, mafiacore, enemymafiacore);
    },
    "mafia.bizWar.stop": () => {
        mp.mafia.stopBizWar();
    },
    "mafia.bizWar.score.set": (mafiaId, score) => {
        mp.mafia.setBizWarScore(mafiaId, score);
    },
    "mafia.bizWar.killList.log": (target, killer, reason) => {
        mp.mafia.logKill(target, killer, reason);
    },
    "mafia.cuffs.callRemote": (data) => {
        if (typeof data == 'string') data = JSON.parse(data);

        var rec = mp.utils.getNearPlayer(mp.players.local.position);
        if (!rec) return mp.notify.error(`Рядом никого нет`, `Веревка`);
        data.recId = rec.remoteId;
        mp.events.callRemote(`mafia.cuffs`, JSON.stringify(data));
    },
    "mafia.follow.start": (playerId) => {
        mp.mafia.startFollowToPlayer(playerId);
    },
    "mafia.follow.stop": () => {
        mp.mafia.stopFollowToPlayer();
        mp.police.stopFollowToPlayer();
    },
    "mafia.storage.info.set": (data) => {
        mp.mafia.setStorageInfo(data);
    },
    "render": () => {
        if (mp.mafia.zonesShow) {
            mp.mafia.mafiaZones.forEach(blip => {
                mp.game.invoke(mp.mafia.natives.SET_BLIP_ROTATION, blip, 0);
            });
        }

        if (mp.mafia.followPlayer || mp.players.local.getVariable("inBoot") != null) {
            mp.game.controls.disableControlAction(0, 21, true); /// бег
            mp.game.controls.disableControlAction(0, 22, true); /// прыжок
            mp.game.controls.disableControlAction(0, 31, true); /// вперед назад
            mp.game.controls.disableControlAction(0, 30, true); /// влево вправо
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(1, 200, true); // esc
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
            mp.game.controls.disableControlAction(24, 37, true); /// Tab
            mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2
        }
    },
    "time.main.tick": () => {
        var start = Date.now();
        if (mp.mafia.followPlayer) {
            var pos = mp.mafia.followPlayer.position;
            var localPos = mp.players.local.position;
            var dist = mp.game.system.vdist(pos.x, pos.y, pos.z, localPos.x, localPos.y, localPos.z);
            if (dist > 30) {
                mp.mafia.followPlayer = null;
                return;
            }
            var speed = 3;
            if (dist < 10) speed = 2;
            if (dist < 5) speed = 1;
            mp.players.local.taskFollowNavMeshToCoord(pos.x, pos.y, pos.z, speed, -1, 1, true, 0);
        }
        mp.timeMainChecker.modules.mafia = Date.now() - start;
    },
    "entityStreamIn": (entity) => {
        if (entity.type == "player") {
            //mp.mafia.createPlayerBlip(entity);
            if (entity.getVariable("inBoot") != null) mp.mafia.playerPutIntoBoot(entity, entity.getVariable("inBoot"));
        } else if (entity.type == 'vehicle') {
            if (entity.getVariable("inBoot") != null) mp.mafia.playerPutIntoBoot(mp.players.atRemoteId(entity.getVariable("inBoot")), entity.remoteId);
        }
    },
    "characterInit.done": () => {
        mp.mafia.peds.forEach((current) => {
            mp.events.call('NPC.create', current);
        });
    },
    "mafia.treasury.menu.show": (cash) => {
        mp.callCEFV(`selectMenu.menus["mafiaTreasury"].items[0].values = ['$${cash}']`);
        mp.events.call('selectMenu.show', 'mafiaTreasury');
    },
    "mafia.treasury.cash.send.finish": () => {
        mp.callCEFV('selectMenu.loader = false');
    },
});

mp.events.addDataHandler("inBoot", (entity, entityId = null) => {
    if (entity.type == 'player') {
        mp.mafia.playerPutIntoBoot(entity, entityId);
    }
});

mp.mafia.registerAttachments();
