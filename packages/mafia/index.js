"use strict";

let factions;
let bizes = call('bizes');
let notifs = call('notifications');
let timer = call('timer');
let utils = call('utils');

module.exports = {
    // Позиции, где можно проводить бизвары
    mafiaZones: [{
            id: 0,
            name: "Зона для рекета 1",
            x: 1549.3131103515625,
            y: 2203.40966796875,
        },
        {
            id: 1,
            name: "Зона для рекета 2",
            x: 1063.94775390625,
            y: 2357.687255859375,
        },
        {
            id: 2,
            name: "Зона для рекета 3",
            x: 2953.53466796875,
            y: 2787.001708984375,
        },
        {
            id: 3,
            name: "База нефтяников",
            x: 1534.7117919921875,
            y: -2123.951171875,
        },
        {
            id: 4,
            name: "Свалка Sandy Shores",
            x: 2386.0888671875,
            y: 3092.919677734375,
        }
    ],
    // Мин. ранг, который может бизварить
    bizWarRank: 8,
    // Зоны, на которых происходит бизвар
    wars: {},
    // Время завершения последнего бизвара (ms)
    lastWarTime: 0,
    // Время отдыха между бизварами (ms)
    waitWarTime: 20 * 60 * 1000,
    // Повторное участие в бизваре после убийства
    reveangeKill: true,
    // Время захвата (ms)
    warTime: 5 * 60 * 1000,
    // Промежуток часов, в который можно начать захват
    bizWarInterval: [15, 23],
    // Кол-во боеприпасов, списываемое за выдачу оружия
    gunAmmo: 100,
    // Кол-во боеприпасов, списываемое за выдачу патронов
    ammoAmmo: 1,
    // Кол-во боеприпасов, списываемое за отмычку
    lockPickAmmo: 5,
    // Ранг, с которого можно взять отмычку
    lockPickRank: 5,

    convertToClientMafiaZones() {
        var zones = this.mafiaZones.slice();
        var warZoneIds = Object.keys(this.wars);
        if (warZoneIds.length) zones[warZoneIds[0]].flash = true;
        return zones;
    },
    getZone(id) {
        return this.mafiaZones[id];
    },
    init() {
        factions = call('factions');
    },
    isInMafiaZone(pos, zone) {
        return pos.x > zone.x - 150 && pos.x < zone.x + 150 && pos.y < zone.y + 150 && pos.y > zone.y - 150;
    },
    getZoneByPos(pos) {
        for (var i = 0; i < this.mafiaZones.length; i++) {
            var zone = this.mafiaZones[i];
            if (this.isInMafiaZone(pos, zone)) return zone;
        }

        return null;
    },
    // влияние мафии от 0 до 1 (min: 0 - ниодного бизнеса не захвачено, max: 1 - все бизнесы захвачены)
    getPowerMafia(mafiaId) {
        var count = 0;
        var bizesCount = bizes.getBizesByFactionId(mafiaId).length;

        return count / bizesCount;
    },
    startBizWar(player, bizId) {
        var header = `Рекет`;
        var out = (text) => {
            notifs.error(player, text, header)
        };
        var faction = factions.getFaction(player.character.factionId);
        if (!factions.isMafiaFaction(faction)) return out(`Вы не член мафии`);
        var rank = factions.getRank(faction, this.bizWarRank);
        if (player.character.factionRank < rank.id) return out(`Доступно с ранга ${rank.name}`);
        var zone = this.getZoneByPos(player.position);
        if (!zone) return out(`Вы не в зоне, где можно забить стрелку`);
        var biz = bizes.getBizById(bizId);
        if (!biz) return out(`Бизнес #${bizId} не найден`);
        if (biz.info.type == 10) return out(`Нельзя захватить клуб`);
        if (biz.info.factionId == faction.id) return out(`${biz.info.name} уже под вашей крышей`);
        if (Object.keys(this.wars).length) return out(`В штате уже идет война за бизнес`);
        var diff = Date.now() - this.lastWarTime;
        if (diff < this.waitWarTime) {
            var minutes = parseInt((this.waitWarTime - diff) / 1000 / 60);
            return out(`Повторный захват будет доступен через ${minutes} мин.`);
        }

        let hours = utils.getMoscowHours();
        if (hours < this.bizWarInterval[0] || hours > this.bizWarInterval[1])
            return out(`Захват доступен с ${this.bizWarInterval[0]} до ${this.bizWarInterval[1]} ч.`);

        var enemyFaction = factions.getFaction(biz.info.factionId);
        this.wars[zone.id] = {
            mafia: {
                id: faction.id,
                score: 0,
            },
            enemyMafia: {
                id: enemyFaction.id,
                score: 0,
            },
            startTime: Date.now(),
            bizId: biz.info.id,
        };
        timer.add(() => {
            try {
                this.stopBizWar(zone);
            } catch (e) {
                console.log(e);
            }
        }, this.warTime);
        mp.players.forEach(rec => {
            if (!rec.character) return;
            var factionId = rec.character.factionId;
            rec.call(`mafia.mafiaZones.flash`, [zone.id, true]);
            if (!factionId) return;
            if (!factions.isMafiaFaction(factionId)) return;
            if (factionId == faction.id) {
                rec.call(`mafia.bizWar.start`, [factionId, enemyFaction.id, this.warTime / 1000]);
                notifs.success(rec, `Ваша мафия напала на ${enemyFaction.name} для отжатия ${biz.info.name}`, header);
            } else if (factionId == enemyFaction.id) {
                rec.call(`mafia.bizWar.start`, [enemyFaction.id, faction.id, this.warTime / 1000]);
                notifs.info(rec, `На вас напала мафия ${faction.name} для отжатия ${biz.info.name}`, header);
            }
        });
    },
    stopBizWar(zone) {
        if (typeof zone == 'number') zone = this.getZone(zone);
        if (!this.wars[zone.id]) return;

        var war = this.wars[zone.id];
        var winMafiaId = war.mafia.id;
        var loseMafiaId = war.enemyMafia.id;
        if (war.enemyMafia.score > war.mafia.score) {
            winMafiaId = war.enemyMafia.id;
            loseMafiaId = war.mafia.id;
        }

        var header = `Рекет`;
        mp.players.forEach(rec => {
            if (!rec.character) return;
            rec.call(`mafia.mafiaZones.flash`, [zone.id, false]);
            var factionId = rec.character.factionId;
            if (!factionId) return;
            if (!factions.isMafiaFaction(factionId)) return;
            if (factionId == winMafiaId) {
                var str = (war.mafia.id == winMafiaId) ? 'attack' : 'defender';
                rec.call(`prompt.showByName`, [`bizWar_${str}_win`]);
                notifs.success(rec, `Ваша мафия победила`, header);
            } else if (factionId == loseMafiaId) {
                var str = (war.mafia.id == loseMafiaId) ? 'attack' : 'defender';
                rec.call(`prompt.showByName`, [`bizWar_${str}_lose`]);
                notifs.error(rec, `Ваша мафия проиграла`, header);
            }
        });

        bizes.setFactionId(war.bizId, winMafiaId);
        this.lastWarTime = Date.now();
        delete this.wars[zone.id];
    },
    inWar(factionId) {
        var i = Object.values(this.wars).findIndex(x => x.mafia.id == factionId || x.enemyMafia.id == factionId);
        return i != -1;
    },
    checkReveangeKill(player) {
        if (this.reveangeKill) return;
        if (!player.lastWarDeathTime) return;
        var diff = Date.now() - player.lastWarDeathTime;
        if (diff > this.warTime) delete player.lastWarDeathTime;
        else {
            notifs.error(player, `Reveange Kill запрещен`, `Рекет`);
            terminal.log(`[MAFIA] ${player.name} сделал Reveange Kill на бизваре`);
        }
    },
    giveScore(player, enemy, reason, zone) {
        if (typeof zone == 'number') zone = this.getZone(zone);
        var war = this.wars[zone.id];
        if (!war) return;

        var mafiaId, score;

        if (player.character.factionId == war.mafia.id) {
            war.mafia.score++;
            mafiaId = war.mafia.id;
            score = war.mafia.score;
        } else if (player.character.factionId == war.enemyMafia.id) {
            war.enemyMafia.score++;
            mafiaId = war.enemyMafia.id;
            score = war.enemyMafia.score;
        }

        mp.players.forEach(rec => {
            if (!rec.character) return;
            var factionId = rec.character.factionId;
            if (!factionId) return;
            if (!factions.isMafiaFaction(factionId)) return;
            if (factionId != war.mafia.id && factionId != war.enemyMafia.id) return;

            rec.call(`mafia.bizWar.killList.log`, [{
                name: enemy.name,
                factionId: enemy.character.factionId
            }, {
                name: player.name,
                factionId: player.character.factionId
            }, reason.toString()]);
            rec.call(`mafia.bizWar.score.set`, [mafiaId, score]);
        });
    },
    // сколько осталось для окончания бизвар (ms)
    haveTime(war) {
        return this.warTime - (Date.now() - war.startTime);
    },
    sendStorageInfo(player) {
        var factionIds = bizes.getBizesFactionIds();
        var data = {
            names: factions.getMafiaFactions().map(x => x.name),
            counts: [0, 0, 0, 0],
            bizCount: factionIds.length,
            cash: factions.getFaction(player.character.factionId).cash,
        };

        factionIds.forEach(id => {
            data.counts[id === 17 ? 3 :id - 12]++;
        });

        player.call(`mafia.storage.info.set`, [data]);
    },
    setBag(player, bag) {
        if (bag) {
            player.bag = bag;
            player.addAttachment("headBag");
        } else {
            player.addAttachment("headBag", true);
            delete player.bag;
        }
    },
};
