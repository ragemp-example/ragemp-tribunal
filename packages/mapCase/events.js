"use strict";
let chat = require('../chat');
let factions = require('../factions');
let mapCase = require('./index');
let money = call('money');
let news = call('news');
let notifs = require('../notifications');
let police = require('../police');
let utils = require('../utils');


var out = {
    error(player, text) {
        player.call(`mapCase.message.red.show`, [text]);
    },
    success(player, text) {
        player.call(`mapCase.message.green.show`, [text]);
    }
};

module.exports = {
    "init": () => {
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        if (player.character.wanted) {
            mapCase.addPoliceWanted(player);
            mapCase.addFibWanted(player);
        }
    },
    "mapCase.gover.init": async (player) => {
        var ranks = factions.getClientRanks(player.character.factionId);
        player.call(`mapCase.gover.ranks.set`, [ranks]);

        var members = await factions.getAllMembers(player);
        members = await mapCase.convertDBMembers(members);
        player.call(`mapCase.gover.members.add`, [members]);
        mapCase.addGoverMember(player);
    },
    "mapCase.gover.rank.raise": (player, recId) => {
        if (!factions.isGovernmentFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Повышение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя повысить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank - 1) return out.error(player, `Недостаточно прав для повышения ${rec.name}`);
        var max = factions.getMaxRank(rec.character.factionId);
        if (rec.character.factionRank >= max.id) return out.error(player, `${rec.name} имеет макс. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank + 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} повысил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был повышен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.gover.rank.lower": (player, recId) => {
        if (!factions.isGovernmentFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Понижение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`, header);
        if (rec.id == player.id) return out.error(player, `Нельзя понизить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для понижения ${rec.name}`);
        var min = factions.getMinRank(rec.character.factionId);
        if (rec.character.factionRank <= min.id) return out.error(player, `${rec.name} имеет мин. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank - 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} понизил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был понижен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.gover.members.uval": (player, recId) => {
        if (!factions.isGovernmentFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        if (!factions.canUval(player)) return out.error(player, `Недостаточно прав`);
        var header = `Увольнение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя уволить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для увольнения ${rec.name}`);

        factions.deleteMember(rec);
        notifs.info(rec, `${player.name} уволил вас`, header);
        var text = `<span>${rec.name}</span><br /> был уволен`;
        out.success(player, text);
    },
    "mapCase.pd.init": async (player) => {
        player.call(`mapCase.pd.calls.add`, [mapCase.policeCalls]);

        var wanted = police.getWanted();
        wanted = mapCase.convertWanted(wanted);
        player.call(`mapCase.pd.wanted.add`, [wanted]);

        var ranks = factions.getClientRanks(player.character.factionId);
        player.call(`mapCase.pd.ranks.set`, [ranks]);

        var members = await factions.getAllMembers(player);
        members = await mapCase.convertDBMembers(members);
        player.call(`mapCase.pd.members.add`, [members]);
        mapCase.addPoliceMember(player);
    },
    "mapCase.pd.searchByPhone": async (player, number) => {
        // console.log(`searchByPhone: ${number}`)
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        var characters = await db.Models.Character.findAll({
            attributes: ['id', 'name'],
            limit: 20,
            include: [{
                    model: db.Models.Phone,
                    where: {
                        number: {
                            [Op.like]: `%${number}%`
                        }
                    },
                },
                db.Models.House
            ],
        });
        var result = mapCase.convertCharactersToResultData(characters);
        player.call(`mapCase.pd.resultData.set`, [result]);
    },
    "mapCase.pd.searchByName": async (player, name) => {
        // console.log(`searchByName: ${name}`)
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        var characters = await db.Models.Character.findAll({
            attributes: ['id', 'name'],
            where: {
                name: {
                    [Op.like]: `%${name}%`
                }
            },
            limit: 20,
            include: [db.Models.Phone, db.Models.House],
        });
        var result = mapCase.convertCharactersToResultData(characters);
        player.call(`mapCase.pd.resultData.set`, [result]);
    },
    "mapCase.pd.searchByCar": async (player, plate) => {
        // console.log(`searchByCar: ${plate}`)
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        var vehicles = await db.Models.Vehicle.findAll({
            attributes: ['owner'],
            where: {
                key: "private",
                plate: {
                    [Op.like]: `%${plate}%`
                }
            },
            limit: 20
        });
        var owners = [];
        for (var i = 0; i < vehicles.length; i++) owners.push(vehicles[i].owner);
        var characters = await db.Models.Character.findAll({
            attributes: ['id', 'name'],
            where: {
                id: owners
            },
            limit: 20,
            include: [db.Models.Phone, db.Models.House],
        });
        var result = mapCase.convertCharactersToResultData(characters);
        player.call(`mapCase.pd.resultData.set`, [result]);
    },
    "mapCase.pd.searchById": async (player, recId) => {
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        var header = `Установление личности`;
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок <span>#${recId}</span> не найден`);

        // TODO: Лишний запрос в БД
        var character = await db.Models.Character.findByPk(rec.character.id, {
            attributes: ['id', 'name', 'gender', 'wanted', 'wantedCause', 'law', 'crimes'],
            include: [db.Models.Phone, db.Models.House, db.Models.Faction, db.Models.FactionRank, db.Models.Fine],
        });
        var vehicles = await db.Models.Vehicle.findAll({
            where: {
                key: "private",
                owner: recId
            }
        });
        var result = mapCase.convertCharactersToProfileData(character, vehicles);
        player.call(`mapCase.pd.profileData.set`, [result]);
    },
    "mapCase.pd.getProfile": async (player, id) => {
        // console.log(`getProfile: ${id}`)
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        var character = await db.Models.Character.findByPk(id, {
            attributes: ['id', 'name', 'gender', 'wanted', 'wantedCause', 'law', 'crimes'],
            include: [db.Models.Phone, db.Models.House, db.Models.Faction, db.Models.FactionRank, db.Models.Fine],
        });
        var vehicles = await db.Models.Vehicle.findAll({
            where: {
                key: "private",
                owner: id
            }
        });
        var result = mapCase.convertCharactersToProfileData(character, vehicles);
        result.spouse = '';
        player.call(`mapCase.pd.profileData.set`, [result]);
    },
    "mapCase.pd.fines.give": async (player, data) => {
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        data = JSON.parse(data);
        data.price = Math.clamp(data.price, 1, 10000);

        var fine = await db.Models.Fine.create({
            copId: player.character.id,
            recId: data.recId,
            cause: data.cause,
            price: data.price
        });
        var rec = mp.players.getBySqlId(data.recId);
        if (rec) {
            rec.character.Fines.push(fine);
            mp.events.call("player.fines.changed", rec);
        } else rec = data.recId;

        notifs.info(rec, `${player.name} выписал вам штраф на сумму $${fine.price} (${fine.cause})`, `Штраф`);
        var text = `Штраф на сумму <span>${fine.price}$</span><br/>выдан <span>${data.recName}</span><br/> по причине <span>${data.cause}</span>`;
        out.success(player, text);
        police.addRecord(data.recId, `Штраф $${data.price} (${data.cause})`, player.character.name);
    },
    "mapCase.pd.wanted.search": (player, characterId) => {
        var rec = mp.players.getBySqlId(characterId);
        if (!rec || !rec.character) return out.error(player, `Персонаж #${characterId} оффлайн`);
        if (!rec.character.wanted) return out.error(player, `${rec.name} не в розыске`);
        if (!factions.isPoliceFaction(player.character.factionId) && !factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не сотрудник`);
        if (rec.dimension != 0) return out.error(player, `${rec.name} достаточно хорошо скрыт`);
        if (player.lastWantedSearch && Date.now() - player.lastWantedSearch < police.searchTime) return out.error(player, `Ожидайте...`);
        player.lastWantedSearch = Date.now();

        var pos = police.getSearchPosition(rec.position);

        player.call(`police.search.blip.create`, [rec.name, pos]);
        out.success(player, `Приблизительное местоположение ${rec.name} отмечено на карте`);
    },
    "mapCase.pd.wanted.give": (player, data) => {
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        data = JSON.parse(data);

        var rec = mp.players.getBySqlId(data.recId);
        notifs.info(rec || data.recId, `${player.name} выдал вам ${data.wanted} ур. по причине: ${data.cause}`, `Розыск`);
        if (rec) {
            police.setWanted(rec, data.wanted, data.cause);

            mp.players.forEach(cop => {
                if (!cop.character) return;
                if (!factions.isPoliceFaction(cop.character.factionId)) return;

                notifs.warning(cop, `${player.name} выдал ${rec.character.wanted} ур. ${rec.name} по причине ${data.cause}`, `Розыск`);
            });
        } else db.Models.Character.update({
            wanted: data.wanted,
            wantedCause: data.cause
        }, {
            where: {
                id: data.recId
            }
        });
        var text = `Уровень розыска <span>${data.wanted}&#9733;</span><br/>выдан <span>${data.recName}</span><br/> по причине <span>${data.cause}</span>`;
        out.success(player, text);

        police.addRecord(data.recId, `Розыск ${data.wanted} ур. (${data.cause})`, player.character.name);
    },
    "mapCase.pd.calls.add": (player, description) => {
        mapCase.addPoliceCall(player, description);
    },
    "mapCase.pd.calls.remove": (player, id) => {
        mapCase.removePoliceCall(id);
    },
    "mapCase.pd.calls.accept": (player, id) => {
        // console.log(`calls.accept: ${player.name} ${id}`)
        if (!factions.isPoliceFaction(player.character.factionId) && !factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        var header = `Вызов полиции`;
        var rec = mp.players.getBySqlId(id);
        if (!rec) return out.error(player, `Игрок #${id} оффлайн`);
        var accepted = mapCase.acceptPoliceCall(id);
        if (!accepted) return out.error(player, `Вызов #${id} принят другим полицейским`);
        notifs.success(rec, `${player.name} принял ваш вызов, оставайтесь на месте`, header);
        var text = `Вы приняли вызов от <br/><span>${rec.name}</span>`;
        out.success(player, text);
        player.call(`waypoint.set`, [rec.position.x, rec.position.y]);

        mp.players.forEach(_rec => {
            if (!_rec.character) return;
            var id = _rec.character.factionId;
            if (!factions.isPoliceFaction(id) && !factions.isFibFaction(id)) return;

            notifs.info(_rec, `${player.name} принял вызов ${rec.name}`, header);
        });
    },
    "mapCase.pd.rank.raise": (player, recId) => {
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Повышение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя повысить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank - 1) return out.error(player, `Недостаточно прав для повышения ${rec.name}`);
        var max = factions.getMaxRank(rec.character.factionId);
        if (rec.character.factionRank >= max.id) return out.error(player, `${rec.name} имеет макс. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank + 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} повысил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был повышен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.pd.rank.lower": (player, recId) => {
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Понижение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`, header);
        if (rec.id == player.id) return out.error(player, `Нельзя понизить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для понижения ${rec.name}`);
        var min = factions.getMinRank(rec.character.factionId);
        if (rec.character.factionRank <= min.id) return out.error(player, `${rec.name} имеет мин. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank - 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} понизил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был понижен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.pd.members.uval": (player, recId) => {
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        if (!factions.canUval(player)) return out.error(player, `Недостаточно прав`);
        var header = `Увольнение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя уволить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для увольнения ${rec.name}`);

        factions.deleteMember(rec);
        notifs.info(rec, `${player.name} уволил вас`, header);
        var text = `<span>${rec.name}</span><br /> был уволен`;
        out.success(player, text);
    },
    "mapCase.pd.emergency.call": (player) => {
        if (!factions.isPoliceFaction(player.character.factionId)) return out.error(player, `Вы не являетесь сотрудником`);
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isPoliceFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            // chat.push(rec, `${player.name} запросил подкрепление`);
            notifs.warning(rec, `${player.name} запросил подкрепление`, `Police`);
            rec.call(`mapCase.pd.emergencyBlips.add`, [player.name, player.position]);
        });
        out.success(player, `Сработал экстренный вызов`);
    },
    "mapCase.army.init": async (player) => {
        var ranks = factions.getClientRanks(player.character.factionId);
        player.call(`mapCase.army.ranks.set`, [ranks]);

        var members = await factions.getAllMembers(player);
        members = await mapCase.convertDBMembers(members);
        player.call(`mapCase.army.members.add`, [members]);
        mapCase.addArmyMember(player);
    },
    "mapCase.army.rank.raise": (player, recId) => {
        if (!factions.isArmyFaction(player.character.factionId)) return out.error(player, `Вы не являетесь военным`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Повышение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя повысить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank - 1) return out.error(player, `Недостаточно прав для повышения ${rec.name}`);
        var max = factions.getMaxRank(rec.character.factionId);
        if (rec.character.factionRank >= max.id) return out.error(player, `${rec.name} имеет макс. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank + 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} повысил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был повышен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.army.rank.lower": (player, recId) => {
        if (!factions.isArmyFaction(player.character.factionId)) return out.error(player, `Вы не являетесь военным`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Понижение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`, header);
        if (rec.id == player.id) return out.error(player, `Нельзя понизить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для понижения ${rec.name}`);
        var min = factions.getMinRank(rec.character.factionId);
        if (rec.character.factionRank <= min.id) return out.error(player, `${rec.name} имеет мин. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank - 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} понизил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был понижен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.army.members.uval": (player, recId) => {
        if (!factions.isArmyFaction(player.character.factionId)) return out.error(player, `Вы не являетесь военным`);
        if (!factions.canUval(player)) return out.error(player, `Недостаточно прав`);
        var header = `Увольнение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя уволить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для увольнения ${rec.name}`);

        factions.deleteMember(rec);
        notifs.info(rec, `${player.name} уволил вас`, header);
        var text = `<span>${rec.name}</span><br /> был уволен`;
        out.success(player, text);
    },
    "mapCase.crm.init": async (player) => {
        player.call('mapCase.crm.members.clear');
        var ranks = factions.getClientRanks(player.character.factionId);
        const playerRank = factions.getRankName(player);
        const pay = factions.getRankById(player.character.factionId, player.character.factionRank).pay;
        player.call('mapCase.userRank.set', [playerRank]);
        player.call('mapCase.userSalary.set', [pay]);
        player.call(`mapCase.crm.ranks.set`, [ranks]);

        var members = await factions.getAllMembers(player);
        members = await mapCase.convertDBMembers(members);
        player.call(`mapCase.crm.members.add`, [members]);
        mapCase.addCrmMember(player);
    },
    "mapCase.crm.rank.raise": (player, recId) => {
        if (!factions.isCrimeFaction(player.character.factionId)) return out.error(player, `Вы не являетесь военным`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Повышение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя повысить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank - 1) return out.error(player, `Недостаточно прав для повышения ${rec.name}`);
        var max = factions.getMaxRank(rec.character.factionId);
        if (rec.character.factionRank >= max.id) return out.error(player, `${rec.name} имеет макс. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank + 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} повысил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был повышен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.crm.rank.lower": (player, recId) => {
        if (!factions.isCrimeFaction(player.character.factionId)) return out.error(player, `Вы не являетесь военным`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Понижение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`, header);
        if (rec.id == player.id) return out.error(player, `Нельзя понизить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для понижения ${rec.name}`);
        var min = factions.getMinRank(rec.character.factionId);
        if (rec.character.factionRank <= min.id) return out.error(player, `${rec.name} имеет мин. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank - 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} понизил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был понижен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.crm.members.uval": (player, recId) => {
        if (!factions.isCrimeFaction(player.character.factionId)) return out.error(player, `Вы не являетесь военным`);
        if (!factions.canUval(player)) return out.error(player, `Недостаточно прав`);
        var header = `Увольнение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя уволить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для увольнения ${rec.name}`);

        factions.deleteMember(rec);
        notifs.info(rec, `${player.name} уволил вас`, header);
        var text = `<span>${rec.name}</span><br /> был уволен`;
        out.success(player, text);
    },
    "mapCase.fib.init": async (player) => {
        // player.call(`mapCase.fib.calls.add`, [mapCase.fibCalls]);
        player.call(`mapCase.fib.calls.add`, [mapCase.policeCalls]);

        var wanted = police.getWanted();
        wanted = mapCase.convertWanted(wanted);
        player.call(`mapCase.fib.wanted.add`, [wanted]);

        var ranks = factions.getClientRanks(player.character.factionId);
        player.call(`mapCase.fib.ranks.set`, [ranks]);

        var members = await factions.getAllMembers(player);
        members = await mapCase.convertDBMembers(members);
        player.call(`mapCase.fib.members.add`, [members]);
        mapCase.addFibMember(player);
    },
    "mapCase.fib.searchByPhone": async (player, number) => {
        // console.log(`searchByPhone: ${number}`)
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        var characters = await db.Models.Character.findAll({
            attributes: ['id', 'name'],
            limit: 20,
            include: [{
                    model: db.Models.Phone,
                    where: {
                        number: {
                            [Op.like]: `%${number}%`
                        }
                    },
                },
                db.Models.House
            ],
        });
        var result = mapCase.convertCharactersToResultData(characters);
        player.call(`mapCase.fib.resultData.set`, [result]);
    },
    "mapCase.fib.searchByName": async (player, name) => {
        // console.log(`searchByName: ${name}`)
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        var characters = await db.Models.Character.findAll({
            attributes: ['id', 'name'],
            where: {
                name: {
                    [Op.like]: `%${name}%`
                }
            },
            limit: 20,
            include: [db.Models.Phone, db.Models.House],
        });
        var result = mapCase.convertCharactersToResultData(characters);
        player.call(`mapCase.fib.resultData.set`, [result]);
    },
    "mapCase.fib.searchByCar": async (player, plate) => {
        // console.log(`searchByCar: ${plate}`)
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        var vehicles = await db.Models.Vehicle.findAll({
            attributes: ['owner'],
            where: {
                key: "private",
                plate: {
                    [Op.like]: `%${plate}%`
                }
            },
            limit: 20
        });
        var owners = [];
        for (var i = 0; i < vehicles.length; i++) owners.push(vehicles[i].owner);
        var characters = await db.Models.Character.findAll({
            attributes: ['id', 'name'],
            where: {
                id: owners
            },
            limit: 20,
            include: [db.Models.Phone, db.Models.House],
        });
        var result = mapCase.convertCharactersToResultData(characters);
        player.call(`mapCase.fib.resultData.set`, [result]);
    },
    "mapCase.fib.searchById": async (player, recId) => {
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        var header = `Установление личности`;
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок <span>#${recId}</span> не найден`);

        // TODO: Лишний запрос в БД
        var character = await db.Models.Character.findByPk(rec.character.id, {
            attributes: ['id', 'name', 'gender', 'wanted', 'wantedCause', 'law', 'crimes'],
            include: [db.Models.Phone, db.Models.House, db.Models.Faction, db.Models.FactionRank, db.Models.Fine],
        });
        var vehicles = await db.Models.Vehicle.findAll({
            where: {
                key: "private",
                owner: recId
            }
        });
        var result = mapCase.convertCharactersToProfileData(character, vehicles);
        player.call(`mapCase.fib.profileData.set`, [result]);
    },
    "mapCase.fib.getProfile": async (player, id) => {
        // console.log(`getProfile: ${id}`)
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        var character = await db.Models.Character.findByPk(id, {
            attributes: ['id', 'name', 'gender', 'wanted', 'wantedCause', 'law', 'crimes'],
            include: [db.Models.Phone, db.Models.House, db.Models.Faction, db.Models.FactionRank, db.Models.Fine],
        });
        var vehicles = await db.Models.Vehicle.findAll({
            where: {
                key: "private",
                owner: id
            }
        });
        var result = mapCase.convertCharactersToProfileData(character, vehicles);
        result.spouse = '';
        player.call(`mapCase.fib.profileData.set`, [result]);
    },
    "mapCase.fib.fines.give": async (player, data) => {
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        data = JSON.parse(data);

        var fine = await db.Models.Fine.create({
            copId: player.character.id,
            recId: data.recId,
            cause: data.cause,
            price: data.price
        });
        var rec = mp.players.getBySqlId(data.recId);
        if (rec) {
            rec.character.Fines.push(fine);
            mp.events.call("player.fines.changed", rec);
        } else rec = data.recId;

        notifs.info(rec, `${player.name} выписал вам штраф на сумму $${fine.price} (${fine.cause})`, `Штраф`);
        var text = `Штраф на сумму <span>${fine.price}$</span><br/>выдан <span>${data.recName}</span><br/> по причине <span>${data.cause}</span>`;
        out.success(player, text);
    },
    "mapCase.fib.wanted.give": (player, data) => {
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        data = JSON.parse(data);

        var rec = mp.players.getBySqlId(data.recId);
        notifs.info(rec || data.recId, `${player.name} выдал вам ${data.wanted} ур. по причине: ${data.cause}`, `Розыск`);
        if (rec) {
            police.setWanted(rec, data.wanted, data.cause);

            mp.players.forEach(cop => {
                if (!cop.character) return;
                if (!factions.isFibFaction(cop.character.factionId)) return;

                notifs.warning(cop, `${player.name} выдал ${rec.character.wanted} ур. ${rec.name} по причине ${data.cause}`, `Розыск`);
            });
        } else db.Models.Character.update({
            wanted: data.wanted,
            wantedCause: data.cause
        }, {
            where: {
                id: data.recId
            }
        });
        var text = `Уровень розыска <span>${data.wanted}&#9733;</span><br/>выдан <span>${data.recName}</span><br/> по причине <span>${data.cause}</span>`;
        out.success(player, text);
    },
    // "mapCase.fib.calls.add": (player, description) => {
    //     mapCase.addFibCall(player, description);
    // },
    // "mapCase.fib.calls.remove": (player, id) => {
    //     mapCase.removeFibCall(id);
    // },
    // "mapCase.fib.calls.accept": (player, id) => {
    //     // console.log(`calls.accept: ${player.name} ${id}`)
    //     if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
    //     var header = `Вызов FIB`;
    //     var rec = mp.players.getBySqlId(id);
    //     if (!rec || !rec.character) return out.error(player, `Игрок #${id} оффлайн`);
    //     var accepted = mapCase.acceptFibCall(id);
    //     if (!accepted) return out.error(player, `Вызов #${id} принят другим агентом`);
    //     notifs.success(rec, `${player.name} принял ваш вызов, оставайтесь на месте`, header);
    //     var text = `Вы приняли вызов от <br/><span>${rec.name}</span>`;
    //     out.success(player, text);
    //     player.call(`waypoint.set`, [rec.position.x, rec.position.y]);
    //
    //     mp.players.forEach(_rec => {
    //         if (!_rec.character) return;
    //         if (_rec.character.factionId != player.character.factionId) return;
    //
    //         notifs.info(_rec, `${player.name} принял вызов ${rec.name}`, header);
    //     });
    // },
    "mapCase.fib.rank.raise": (player, recId) => {
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Повышение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя повысить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank - 1) return out.error(player, `Недостаточно прав для повышения ${rec.name}`);
        var max = factions.getMaxRank(rec.character.factionId);
        if (rec.character.factionRank >= max.id) return out.error(player, `${rec.name} имеет макс. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank + 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} повысил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был повышен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.fib.rank.lower": (player, recId) => {
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Понижение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`, header);
        if (rec.id == player.id) return out.error(player, `Нельзя понизить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для понижения ${rec.name}`);
        var min = factions.getMinRank(rec.character.factionId);
        if (rec.character.factionRank <= min.id) return out.error(player, `${rec.name} имеет мин. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank - 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} понизил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был понижен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.fib.members.uval": (player, recId) => {
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        if (!factions.canUval(player)) return out.error(player, `Недостаточно прав`);
        var header = `Увольнение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя уволить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для увольнения ${rec.name}`);

        factions.deleteMember(rec);
        notifs.info(rec, `${player.name} уволил вас`, header);
        var text = `<span>${rec.name}</span><br /> был уволен`;
        out.success(player, text);
    },
    "mapCase.fib.emergency.call": (player) => {
        if (!factions.isFibFaction(player.character.factionId)) return out.error(player, `Вы не являетесь агентом`);
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isFibFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            // chat.push(rec, `${player.name} запросил подкрепление`);
            notifs.warning(rec, `${player.name} запросил подкрепление`, `FIB`);
            rec.call(`mapCase.fib.emergencyBlips.add`, [player.name, player.position]);
        });
        out.success(player, `Сработал экстренный вызов`);
    },
    "mapCase.ems.init": async (player) => {
        player.call(`mapCase.ems.calls.add`, [mapCase.hospitalCalls]);

        var ranks = factions.getClientRanks(player.character.factionId);
        player.call(`mapCase.ems.ranks.set`, [ranks]);

        var members = await factions.getAllMembers(player);
        members = await mapCase.convertDBMembers(members);
        player.call(`mapCase.ems.members.add`, [members]);
        mapCase.addHospitalMember(player);
    },
    "mapCase.ems.calls.add": (player, description) => {
        mapCase.addHospitalCall(player, description);
    },
    "mapCase.ems.calls.remove": (player, id) => {
        mapCase.removeHospitalCall(id);
    },
    "mapCase.ems.calls.accept": (player, id) => {
        // console.log(`calls.accept: ${player.name} ${id}`)
        if (!factions.isHospitalFaction(player.character.factionId)) return out.error(player, `Вы не являетесь медиком`);
        var header = `Вызов медика`;
        var rec = mp.players.getBySqlId(id);
        if (!rec || !rec.character) return out.error(player, `Игрок #${id} оффлайн`);
        var accepted = mapCase.acceptHospitalCall(id);
        if (!accepted) return out.error(player, `Вызов #${id} принят другим медиком`);
        notifs.success(rec, `${player.name} принял ваш вызов, оставайтесь на месте`, header);
        var text = `Вы приняли вызов от <br/><span>${rec.name}</span>`;
        out.success(player, text);
        player.call(`waypoint.set`, [rec.position.x, rec.position.y]);

        mp.players.forEach(_rec => {
            if (!_rec.character) return;
            if (_rec.character.factionId != player.character.factionId) return;

            notifs.info(_rec, `${player.name} принял вызов ${rec.name}`, header);
        });
    },
    "mapCase.ems.rank.raise": (player, recId) => {
        if (!factions.isHospitalFaction(player.character.factionId)) return out.error(player, `Вы не являетесь медиком`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Повышение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя повысить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank - 1) return out.error(player, `Недостаточно прав для повышения ${rec.name}`);
        var max = factions.getMaxRank(rec.character.factionId);
        if (rec.character.factionRank >= max.id) return out.error(player, `${rec.name} имеет макс. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank + 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} повысил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был повышен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.ems.rank.lower": (player, recId) => {
        if (!factions.isHospitalFaction(player.character.factionId)) return out.error(player, `Вы не являетесь медиком`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Понижение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`, header);
        if (rec.id == player.id) return out.error(player, `Нельзя понизить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для понижения ${rec.name}`);
        var min = factions.getMinRank(rec.character.factionId);
        if (rec.character.factionRank <= min.id) return out.error(player, `${rec.name} имеет мин. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank - 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} понизил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был понижен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.ems.members.uval": (player, recId) => {
        if (!factions.isHospitalFaction(player.character.factionId)) return out.error(player, `Вы не являетесь медиком`);
        if (!factions.canUval(player)) return out.error(player, `Недостаточно прав`);
        var header = `Увольнение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя уволить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для увольнения ${rec.name}`);

        factions.deleteMember(rec);
        notifs.info(rec, `${player.name} уволил вас`, header);
        var text = `<span>${rec.name}</span><br /> был уволен`;
        out.success(player, text);
    },
    "mapCase.news.init": async (player) => {
        var ranks = factions.getClientRanks(player.character.factionId);
        player.call(`mapCase.news.ranks.set`, [ranks]);

        player.call(`mapCase.news.ads.count.set`, [mapCase.newsAds.length]);

        var members = await factions.getAllMembers(player);
        members = await mapCase.convertDBMembers(members);
        player.call(`mapCase.news.members.add`, [members]);
        mapCase.addNewsMember(player);
    },
    "mapCase.news.ads.add": (player, text) => {
        var header = factions.getFaction(7).name;
        if (!player.phone) return notifs.error(player, `Необходим телефон`, header);
        var price = news.symbolPrice * text.length;
        if (player.character.cash < price) return notifs.error(player, `Необходимо $${price}`, header);
        if (mapCase.haveNewsAd(player)) return notifs.error(player, `Ожидайте публикацию пред. объявления`, header);
        if (player.lastAddAd) {
            var diff = Date.now() - player.lastAddAd;
            var wait = news.waitAddAd;
            if (diff < wait) return notifs.error(player, `Повторная отправка доступна через ${parseInt((wait - diff) / 1000)} сек.`, header);
        }
        player.lastAddAd = Date.now();
        money.removeCash(player, price, (res) => {
            if (!res) return notifs.error(player, `Ошибка списания наличных`, header);
        }, `Отправка объявления`);

        mapCase.addNewsAd(player, text, price);
        return notifs.success(player, `Объявление отправлено`, header);
    },
    "mapCase.news.ads.remove": (player, id) => {
        mapCase.removeNewsAd(id);
    },
    "mapCase.news.ads.get": (player) => {
        mapCase.getNewsAd(player);
    },
    "mapCase.news.ads.accept": (player, ad) => {
        ad = JSON.parse(ad);
        var pay = parseInt(Math.clamp(ad.price, 0, 200) * news.adPayK);
        money.addMoney(player, pay, (res) => {
            if (!res) return notifs.error(player, `Ошибка начисления на банк`, `Принятие объявления`);
        }, `Принятие объявления`);
        mapCase.acceptAd(player, ad);
        out.success(player, `Объявление отредактировано`);
    },
    "mapCase.news.ads.cancel": (player, ad) => {
        ad = JSON.parse(ad);
        mapCase.cancelAd(player, ad);
        out.success(player, `Объявление отклонено`);
    },
    "mapCase.news.rank.raise": (player, recId) => {
        if (!factions.isNewsFaction(player.character.factionId)) return out.error(player, `Вы не являетесь редактором`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Повышение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec || !rec.character) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя повысить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank - 1) return out.error(player, `Недостаточно прав для повышения ${rec.name}`);
        var max = factions.getMaxRank(rec.character.factionId);
        if (rec.character.factionRank >= max.id) return out.error(player, `${rec.name} имеет макс. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank + 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} повысил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был повышен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.news.rank.lower": (player, recId) => {
        if (!factions.isNewsFaction(player.character.factionId)) return out.error(player, `Вы не являетесь редактором`);
        if (!factions.canGiveRank(player)) return out.error(player, `Недостаточно прав`);
        var header = `Понижение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`, header);
        if (rec.id == player.id) return out.error(player, `Нельзя понизить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для понижения ${rec.name}`);
        var min = factions.getMinRank(rec.character.factionId);
        if (rec.character.factionRank <= min.id) return out.error(player, `${rec.name} имеет мин. ранг`);

        var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank - 1);
        factions.setRank(rec, rank.rank);
        var rankName = factions.getRankById(rec.character.factionId, rec.character.factionRank).name;

        notifs.success(rec, `${player.name} понизил вас до ${rankName}`, header);
        var text = `<span>${rec.name}</span><br /> был понижен до ранга ${rankName}`;
        out.success(player, text);
    },
    "mapCase.news.members.uval": (player, recId) => {
        if (!factions.isNewsFaction(player.character.factionId)) return out.error(player, `Вы не являетесь редактором`);
        if (!factions.canUval(player)) return out.error(player, `Недостаточно прав`);
        var header = `Увольнение`;
        var rec = mp.players.getBySqlId(recId);
        if (!rec) return out.error(player, `Игрок #${recId} оффлайн`);
        if (rec.id == player.id) return out.error(player, `Нельзя уволить себя`, header);
        if (rec.character.factionRank >= player.character.factionRank) return out.error(player, `Недостаточно прав для увольнения ${rec.name}`);

        factions.deleteMember(rec);
        notifs.info(rec, `${player.name} уволил вас`, header);
        var text = `<span>${rec.name}</span><br /> был уволен`;
        out.success(player, text);
    },
    "time.main.tick": () => {
        mapCase.publicAd();
    },
    "playerQuit": (player) => {
        if (!player.character) return;
        mapCase.removePoliceCall(player.character.id);
        // mapCase.removeFibCall(player.character.id);
        mapCase.removeHospitalCall(player.character.id);
        mapCase.removeNewsAd(player.id);
        if (player.character.wanted) {
            mapCase.removePoliceWanted(player.character.id);
            mapCase.removeFibWanted(player.character.id);
        }
        if (factions.isGovernmentFaction(player.character.factionId)) mapCase.removeGoverMember(player);
        else if (factions.isPoliceFaction(player.character.factionId)) mapCase.removePoliceMember(player);
        else if (factions.isFibFaction(player.character.factionId)) mapCase.removeFibMember(player);
        else if (factions.isArmyFaction(player.character.factionId)) mapCase.removeArmyMember(player);
        else if (factions.isHospitalFaction(player.character.factionId)) mapCase.removeHospitalMember(player);
        else if (factions.isNewsFaction(player.character.factionId)) mapCase.removeNewsMember(player);
    },
}
