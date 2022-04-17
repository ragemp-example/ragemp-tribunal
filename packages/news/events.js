"use strict";
let chat = call('chat');
let factions = call('factions');
let inventory = call('inventory');
let news = call('news');
let notifs = call('notifications');

module.exports = {
    "init": () => {
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        player.call(`callCEFR`, [`news.price`, [news.symbolPrice]]);
        if (!factions.isNewsFaction(player.character.factionId)) return;
        // player.call(`mapCase.init`, [player.name, player.character.factionId]);
        mp.events.call(`mapCase.news.init`, player);
    },
    "news.storage.clothes.take": (player, index) => {
        if (!player.insideFactionWarehouse) return notifs.error(player, `Вы далеко`, `Склад Weazel News`);
        if (!factions.isNewsFaction(player.character.factionId)) return notifs.error(player, `Вы не редактор`, `Склад Weazel News`);

        var character = player.character;
        var faction = factions.getFaction(character.factionId);
        var header = `Склад ${faction.name}`;

        if (faction.ammo < news.clothesAmmo) return notifs.error(player, `Недостаточно боеприпасов`, header);
        if (player.inventory.items.length) return notifs.error(player, `Необходимо раздеться, чтобы надеть форму`, header);

        inventory.fullDeleteItemsByParams([6, 7, 8, 9, 10, 2, 14, 1], ["faction", "owner"], [character.factionId, character.id]);

        var hatParams, topParams, legsParams, feetsParams, earsParams, tiesParams, masksParams, glassesParams;
        if (character.gender == 0) { // муж.
            hatParams = { // prop 0
                sex: 1,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
            topParams = { // clothes 11 / 3 / 8
                sex: 1,
                torso: // /clothes 3
                    [12, 11, 4, 6][index],
                tTexture: [-1, -1, -1, -1][index],
                variation: // clothes 11
                    [41, 43, 23, 28][index],
                texture: [3, 0, 1, 2][index],
                undershirt: // clothes 8
                    [15, 15, 31, 31][index]
            };
            legsParams = { // clothes 4
                sex: 1,
                variation: [1, 0, 10, 10][index],
                texture: [1, 12, 0, 2][index]
            };
            feetsParams = { // clothes 6
                sex: 1,
                variation: [4, 4, 21, 21][index],
                texture: [1, 1, 0, 0][index]
            };
            earsParams = { // prop 2
                sex: 1,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
            tiesParams = { // clothes 7
                sex: 1,
                variation: [-1, -1, -1, 38][index],
                texture: [-1, -1, -1, 10][index]
            };
            masksParams = { // clothes 1
                sex: 1,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
            glassesParams = { // prop 1
                sex: 1,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
        } else {
            hatParams = { // prop 0
                sex: 0,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
            topParams = { // clothes 11 / 3 / 8
                sex: 0,
                torso: // /clothes 3
                    [0, 0, 3, 1][index],
                tTexture: [-1, -1, -1, -1][index],
                variation: // clothes 11
                    [14, 27, 7, 6][index],
                texture: [2, 5, 0, 2][index],
                undershirt: // clothes 8
                    [15, 15, 37, 37][index]
            };
            legsParams = { // clothes 4
                sex: 0,
                variation: [4, 64, 8, 6][index],
                texture: [8, 0, 0, 2][index]
            };
            feetsParams = { // clothes 6
                sex: 0,
                variation: [1, 1, 0, 0][index],
                texture: [0, 0, 0, 0][index]
            };
            earsParams = { // prop 2
                sex: 0,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
            tiesParams = { // clothes 7
                sex: 0,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
            masksParams = { // clothes 1
                sex: 0,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
            glassesParams = { // prop 1
                sex: 0,
                variation: [-1, -1, -1, -1][index],
                texture: [-1, -1, -1, -1][index]
            };
        }
        if (topParams.undershirt == -1) delete topParams.undershirt;
        if (topParams.uTexture == -1) delete topParams.uTexture;
        if (topParams.tTexture == -1) delete topParams.tTexture;

        // hatParams.faction = faction.id;
        // topParams.faction = faction.id;
        // legsParams.faction = faction.id;
        // feetsParams.faction = faction.id;
        // earsParams.faction = faction.id;
        // tiesParams.faction = faction.id;
        // masksParams.faction = faction.id;
        // glassesParams.faction = faction.id;

        topParams.pockets = '[5,5,5,5,10,5]';
        legsParams.pockets = '[5,5,5,5,10,5]';
        hatParams.clime = '[-10,15]';
        topParams.clime = '[-10,15]';
        legsParams.clime = '[-10,15]';
        feetsParams.clime = '[-10,15]';
        topParams.name = `Рубашка ${faction.name}`;
        legsParams.name = `Брюки ${faction.name}`;

        // hatParams.owner = character.id;
        // topParams.owner = character.id;
        // legsParams.owner = character.id;
        // feetsParams.owner = character.id;
        // earsParams.owner = character.id;
        // tiesParams.owner = character.id;
        // masksParams.owner = character.id;
        // glassesParams.owner = character.id;

        var response = (e) => {
            if (e) notifs.error(player, e, header);
        };

        if (hatParams.variation != -1) inventory.addItem(player, 6, hatParams, response);
        if (topParams.variation != -1) inventory.addItem(player, 7, topParams, response);
        if (legsParams.variation != -1) inventory.addItem(player, 8, legsParams, response);
        if (feetsParams.variation != -1) inventory.addItem(player, 9, feetsParams, response);
        if (earsParams.variation != -1) inventory.addItem(player, 10, earsParams, response);
        if (tiesParams.variation != -1) inventory.addItem(player, 2, tiesParams, response);
        if (masksParams.variation != -1) inventory.addItem(player, 14, masksParams, response);
        if (glassesParams.variation != -1) inventory.addItem(player, 1, glassesParams, response);

        notifs.success(player, `Форма выдана`, header);
        factions.setAmmo(faction, faction.ammo - news.clothesAmmo);
    },
    "news.stream": (player) => {
        var header = `Weazel News`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!factions.isNewsFaction(player.character.factionId)) return out(`Вы не редактор`);
        var rank = factions.getRank(player.character.factionId, news.streamRank);
        if (player.character.factionRank < rank.id) return out(`Доступно с ранга ${rank.name}`);

        news.stream(player);
    },
    "news.stream.member": (player, recId) => {
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return notifs.error(player, `Игрок не найден`);
        if (player.dist(rec.position) > 10) return notifs.error(player, `${rec.name} далеко`);
        news.streamMember(player, rec);
    },
    "chat.action.say": (player, text) => {
        news.streamHandle(player, text);
    },
    "/s": (player, text) => {
        news.streamHandle(player, text);
    },
    "playerQuit": (player) => {
        if (!player.character) return;

        var i = news.liveStream.memberIds.indexOf(player.id);
        if (i != -1) news.liveStream.memberIds.splice(i, 1);

        if (!factions.isNewsFaction(player.character.factionId)) return;
        if (news.liveStream.ownerId != player.id) return;

        news.stream(player);
    },
}
