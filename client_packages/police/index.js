"use strict";

let followMeFunctionBind = false;

mp.police = {
    arrestType: null,
    haveCuffs: false,
    followPlayer: null,
    wanted: 0,
    wantedTimer: null,
    clearWantedTime: 60 * 60 * 1000, // время очищения 1 ур. розыска (ms)
    searchRadius: 150,
    searchTime: 2 * 60 * 1000, // время жизни блипа поиска преступника
    searchTimer: null,
    searchItems: [],
    natives: {
        SET_BLIP_SPRITE: "0xDF735600A4696DAF",
        SET_BLIP_ALPHA: "0x45FF974EEE1C8734",
        SET_BLIP_COLOUR: "0x03D7FB09E75D6B7E",
    },
    jailInfo: {
        // КПЗ ЛСПД
        0: {
            coords: new mp.Vector3(459.35162353515625, -997.807373046875, 24.914854049682617),
            radius: 10,
        },
        // тюрьма за городом
        1: {
            coords: new mp.Vector3(1689.7947998046875, 2598.755859375, 45.56488800048828),
            radius: 200,
        },
        // КПЗ ЛССД
        2: {
            coords: new mp.Vector3(-439.4527282714844, 5989.65185546875, 31.716529846191406),
            radius: 20,
        },
    },
    robbedPlaces: [],

    setArrest(arrestType) {
        this.arrestType = arrestType;
    },
    setCuffs(enable) {
        this.haveCuffs = enable;
        mp.inventory.enable(!enable);
        mp.mapCase.enable(!enable);
        mp.callCEFR('phone.show', [false]);
        enable ? mp.busy.add("cuffs", false) : mp.busy.remove("cuffs");
    },
    setWanted(val) {
        this.wanted = val;
        mp.playerMenu.setWanted(val);
        mp.timer.remove(this.wantedTimer);
        mp.callCEFV(`hud.wanted = ${val}`);
        if (!val) return;
        this.wantedTimer = mp.timer.add(() => {
            mp.events.callRemote(`police.wanted.lower`);
        }, this.clearWantedTime);
    },
    startFollowToPlayer(playerId) {
        var player = mp.players.atRemoteId(playerId);
        if (!player) return;
        this.followPlayer = player;
    },
    stopFollowToPlayer() {
        this.followPlayer = null;
    },
    searchBlipCreate(name, pos) {
        this.removeSearchBlip();
        pos = mp.utils.randomSpherePoint(pos, this.searchRadius);
        var blip = mp.game.ui.addBlipForRadius(pos.x, pos.y, 50, this.searchRadius);
        mp.game.invoke(this.natives.SET_BLIP_ALPHA, blip, 175);
        mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, 1);

        this.saveSearchBlip(blip);

        mp.timer.remove(this.searchTimer);
        this.searchTimer = mp.timer.add(() => {
            this.removeSearchBlip();
        }, this.searchTime);
    },
    saveSearchBlip(blip) {
        mp.storage.data.searchBlip = blip;
    },
    removeSearchBlip() {
        if (!mp.storage.data.searchBlip) return;

        mp.game.ui.removeBlip(mp.storage.data.searchBlip);
        delete mp.storage.data.searchBlip;
    },
};

mp.events.add({
    "characterInit.done": () => {
        mp.police.removeSearchBlip();
    },
    "police.arrest.set": (arrestType) => {
        mp.police.setArrest(arrestType);
    },
    "police.cuffs.set": (enable) => {
        mp.police.setCuffs(enable);
    },
    "police.cuffs.callRemote": (data) => {
        if (typeof data == 'string') data = JSON.parse(data);

        var rec = mp.utils.getNearPlayer(mp.players.local.position);
        if (!rec) return mp.notify.error(`Рядом никого нет`, `Наручники`);
        data.recId = rec.remoteId;
        mp.events.callRemote(`police.cuffs`, JSON.stringify(data));
    },
    "police.wanted.set": (val) => {
        mp.police.setWanted(val);
        // mp.game.gameplay.setFakeWantedLevel(val);
    },
    "render": () => {
        if (mp.police.followPlayer) {
            mp.game.controls.disableControlAction(0, 21, true); /// бег
            mp.game.controls.disableControlAction(0, 22, true); /// прыжок
            mp.game.controls.disableControlAction(0, 31, true); /// вперед назад
            mp.game.controls.disableControlAction(0, 30, true); /// влево вправо
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 257, true); /// стрельба
            mp.game.controls.disableControlAction(1, 200, true); // esc
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
            mp.game.controls.disableControlAction(24, 37, true); /// Tab
            mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2
        }
        if (mp.police.haveCuffs) {
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 257, true); /// стрельба
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
            mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2

            if (mp.players.local.vehicle) {
                mp.game.controls.disableControlAction(0, 59, true); /// INPUT_VEH_MOVE_LR
                mp.game.controls.disableControlAction(0, 60, true); /// INPUT_VEH_MOVE_UD
                mp.game.controls.disableControlAction(0, 71, true); /// INPUT_VEH_ACCELERATE
                mp.game.controls.disableControlAction(0, 72, true); /// INPUT_VEH_BRAKE
                mp.game.controls.disableControlAction(0, 75, true); /// INPUT_VEH_EXIT
            }
        }
        if (mp.police.arrestType != null) {
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 257, true); /// стрельба
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
        }
    },
    "police.follow.start": (playerId) => {
        mp.police.startFollowToPlayer(playerId);
    },
    "police.follow.stop": () => {
        mp.police.stopFollowToPlayer();
        mp.mafia.stopFollowToPlayer();
    },
    "police.search.blip.create": (name, pos) => {
        mp.police.searchBlipCreate(name, pos);
    },
    "time.main.tick": () => {
        var start = Date.now();
        if (mp.police.followPlayer) {
            var pos = mp.police.followPlayer.position;
            var localPos = mp.players.local.position;
            var dist = mp.game.system.vdist(pos.x, pos.y, pos.z, localPos.x, localPos.y, localPos.z);
            if (dist > 30) {
                mp.police.followPlayer = null;
                return;
            }
            var speed = 3;
            if (dist < 10) speed = 2;
            if (dist < 5) speed = 1;
            mp.players.local.taskFollowNavMeshToCoord(pos.x, pos.y, pos.z, speed, -1, 1, true, 0);
        }
        mp.players.forEachInStreamRange(rec => {
            if (rec.vehicle) return;
            if (!rec.getVariable("cuffs")) return;
            if (rec.isPlayingAnim('mp_arresting', 'idle', 3)) return;
            mp.utils.requestAnimDict('mp_arresting', () => {
                rec.taskPlayAnim('mp_arresting', 'idle', 1, 0, -1, 49, 0, false, false, false);
            });
        });
        mp.timeMainChecker.modules.police = Date.now() - start;
    },
    "entityStreamOut": (entity) => {
        if (entity.type != "player") return;
        if (!mp.police.followPlayer) return;
        if (entity.remoteId != mp.police.followPlayer.remoteId) return;
        mp.police.followPlayer = null;
    },
    "playerQuit": (player) => {
        if (!mp.police.followPlayer) return;
        if (player.remoteId != mp.police.followPlayer.remoteId) return;
        mp.police.followPlayer = null;
    },
    "police.inventory.search.init": (data) => {
        mp.police.searchItems = data.items;

        let items = data.items.map(x => {
            return {
                text: x.name
            }
        });
        items.push({ text: 'Закрыть' });
        mp.callCEFV(`selectMenu.menus['searchItems'].header = 'Обыск ID ${data.playerId}'`);
        mp.callCEFV(`selectMenu.setItems('searchItems', ${JSON.stringify(items)});`)
        mp.events.call('selectMenu.show', 'searchItems');
    },
    "police.inventory.search.take": (index) => {
        let item = mp.police.searchItems[index];
        let pos = mp.inventory.getGroundItemPos(mp.players.local);
        mp.events.callRemote('police.inventory.search.take', item.id, JSON.stringify(pos));
    },
    "police.inventory.search.taken": (itemId) => {
        if (itemId != null) {
            mp.police.searchItems = mp.police.searchItems.filter(x => x.id != itemId);
            let items = mp.police.searchItems.map(x => {
                return {
                    text: x.name
                }
            });
            items.push({ text: 'Закрыть' });
            mp.callCEFV(`selectMenu.setItems('searchItems', ${JSON.stringify(items)});`)
        }
        mp.callCEFV('selectMenu.loader = false');
    },
    "police.history.set": (result) => {
        mp.callCEFV(`mapCase.setCrimeHistory(${result})`);
    },
    'police.robbery.show': (isHouse, id, position) => {
        mp.notify.warning(`Проходит ограбление ${isHouse ? 'дома' : 'бизнеса'} №${id}, он отмечен на карте желтым`);
        let info = {
            id: id,
            isHouse: isHouse
        };
        info.blip = mp.blips.new(630, position, { color: 71, name: "Ограбление", scale: 1.5, shortRange: true });
        info.blip.setFlashes(true);
        info.shape = mp.colshapes.newTube(position.x, position.y, position.z, 12.0, 50.0, 0);
        info.shape.robberyId = id;
        info.shape.isHouse = isHouse;
        mp.police.robbedPlaces.push(info);
    },
    'playerEnterColshape': (shape) => {
        if (shape.robberyId) {
            let index = mp.police.robbedPlaces.findIndex(x => x.id === shape.robberyId && x.isHouse === shape.isHouse);
            if (index === -1) return;
            let robbery = mp.police.robbedPlaces[index];
            robbery.blip.destroy();
            robbery.shape.destroy();
            mp.police.robbedPlaces.splice(index, 1);
            mp.notify.info('Вы достигли места ограбления');
        }
    },
    "factions.faction.set": (val, ranks, blipsPos) => {
        if (val === 2 || val === 3) {
            if (!followMeFunctionBind){
                mp.keys.bind(0x58, true, followMeFunction);   // X
                followMeFunctionBind = true;
            }
        }
        else {
            if (followMeFunctionBind) {
                mp.keys.unbind(0x58, true, followMeFunction); // X
                followMeFunctionBind = false;
            }
        }
    }
});

let followMeFunction = () => {
    let entity = mp.getCurrentInteractionEntity();
    if (!entity) return;
    if (entity.type != 'player') return;
    mp.events.callRemote(`police.follow`, entity.remoteId);
}