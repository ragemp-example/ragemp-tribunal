"use strict";
/// Модуль выбора и создания персоонажа
let admin;
let characterInit = require("./index.js");
let logger = call("logger");
let utils = call("utils");
let inventory;
let donate;

module.exports = {
    "init": () => {
        admin = call('admin');
        inventory = call('inventory');
        donate = call('donate');
        characterInit.moduleInit();
        inited(__dirname);
    },
    "auth.done": (player) => {
        player.characterInit = {
            created: false,
        };
        mp.events.call('characterInit.start', player);
    },
    "characterInit.start": async (player) => {
        let charInfos = await characterInit.init(player);
        if (charInfos.length != 0 && player.account.slots == 1 && charInfos[0].charInfo.hours >= characterInit.timeForSecondSlot) {
            player.account.slots = 2;
            await player.account.save();
        }
        player.call('characterInit.init', [charInfos, {
            slots: player.account.slots,
            coins: player.account.donate,
            costSecondSlot: characterInit.costSecondSlot,
            timeForSecondSlot: characterInit.timeForSecondSlot,
            costThirdSlot: characterInit.costThirdSlot,
        }]);
    },
    "characterInit.choose": (player, charnumber) => {
        if (charnumber == null || isNaN(charnumber)) return player.call('characterInit.choose.ans', [0]);
        if (charnumber < 0 || charnumber > 2) return player.call('characterInit.choose.ans', [0]);

        if (player.characters[charnumber]) {
            player.character = player.characters[charnumber];
            player.name = player.character.name;
            delete player.characters;
            characterInit.applyCharacter(player);

            player.call('characterInit.choose.ans', [1]);
            characterInit.spawn(player);
            admin.checkClearWarns(player);
            mp.events.call('characterInit.done', player);
        } else {
            player.call('characterInit.choose.ans', [1]);
            characterInit.create(player);
        }
    },
    "characterInit.change": (player) => {
        if (player.account.donate < donate.changeAppearancePrice) return;
        player.lastPos = player.position;
        player.lastDim = player.dimension;
        player.dimension = player.id + 1;

        characterInit.create(player, true);
    },
    "characterInit.change.result": async (player, charData) => {
        if (charData) {
            player.characterInfo = JSON.parse(charData);

            player.character.father = player.characterInfo.father;
            player.character.mother = player.characterInfo.mother;
            player.character.similarity = player.characterInfo.similarity;
            player.character.skin = player.characterInfo.skin;
            player.character.hair = player.characterInfo.hair;
            player.character.hairColor = player.characterInfo.hairColor;
            player.character.hairHighlightColor = player.characterInfo.hairHighlightColor;
            player.character.eyebrowColor = player.characterInfo.eyebrowColor;
            player.character.beardColor = player.characterInfo.beardColor;
            player.character.eyeColor = player.characterInfo.eyeColor;
            player.character.blushColor = player.characterInfo.blushColor;
            player.character.lipstickColor = player.characterInfo.lipstickColor;
            player.character.chestHairColor = player.characterInfo.chestHairColor;

            for (let i = 0; i < 20; i++) {
                player.character.Features[i].value = player.characterInfo.Features[i].value;
                player.character.Features[i].order = player.characterInfo.Features[i].order;
                await player.character.Features[i].save();
            }
            for (let i = 0; i < 11; i++) {
                player.character.Appearances[i].value = player.characterInfo.Appearances[i].value;
                player.character.Appearances[i].opacity = player.characterInfo.Appearances[i].opacity;
                player.character.Appearances[i].order = player.characterInfo.Appearances[i].order;
                await player.character.Appearances[i].save();
            }

            await player.character.save();

            player.character.Appearances.sort((x, y) => {
                if (x.order > y.order) return 1;
                if (x.order < y.order) return -1;
                if (x.order === y.order) return 0;
            });
            player.character.Features.sort((x, y) => {
                if (x.order > y.order) return 1;
                if (x.order < y.order) return -1;
                if (x.order === y.order) return 0;
            });
        }
        characterInit.applyCharacter(player);
        inventory.updateAllView(player);
        player.position = player.lastPos;
        player.lastPos = null;
        player.dimension = player.lastDim;
        player.lastDim = null;
        player.characterInfo = null;
        player.account.donate -= donate.changeAppearancePrice;
        await player.account.save();
        mp.events.call("player.donate.changed", player);
    },
    "characterInit.slot.buy": async (player) => {
        let price = player.account.slots === 3 ? null : player.account.slots === 2 ? characterInit.costThirdSlot : characterInit.costSecondSlot;
        if (price) {
            if (player.account.donate >= price) {
                player.account.donate -= price;
                player.account.slots++;
                await player.account.save();
                player.call("characterInit.slot.buy.ans", [1, player.account.slots, player.account.donate]);
            }
            else {
                player.call("characterInit.slot.buy.ans", [0, player.account.slots, player.account.donate]);
            }
        }
        else {
            player.call("characterInit.slot.buy.ans", [2, player.account.slots, player.account.donate]);
        }
    },
    /// Разморозка игрока после выбора персоонажа
    "characterInit.done": (player) => {
        player.call('characterInit.done');
        player.authTime = Date.now();

        logger.log(`Авторизовал персонажа (IP: ${player.ip})`, "characterInit", player);
    },
    /// События создания персоонажа
    "characterInit.create.check": (player, fullname, charData) => {
        characterInit.save(player, fullname, charData);
    },
    "characterInit.loadCharacter": (player) => {
        characterInit.applyCharacter(player);
    },
    "inventory.done": (player) => {
        if (player.characterInit.created) {
            characterInit.giveStartFood(player);
            characterInit.setStartClothes(player);
            // characterInit.giveStartWater(player);
        }
    },
    "playerQuit": (player) => {
        if (!player.character) return;

        var minutes = parseInt((Date.now() - player.authTime) / 1000 / 60);
        player.character.minutes += minutes;
        player.character.bonusMinutes += minutes;
        if (!player.dimension && !player.character.arrestTime) {
            player.character.x = player.position.x;
            player.character.y = player.position.y;
            player.character.z = player.position.z;
            player.character.h = player.heading;
        }
        player.character.save();

        player.account.lastIp = player.ip;
        player.account.lastDate = new Date();
        player.account.save();
        logger.log(`Деавторизовал персонажа`, "characterInit", player);
    },
};
