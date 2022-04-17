"use strict";
let fs = require('fs');
let path = require('path');

let notifs;

/// Модуль реализующий админские функции
let commands = {};

let massTeleportData = {
    position: null,
    dimension: null
};

module.exports = {
    // Кол-во варнов, при которых игрок улетает в бан
    banWarns: 3,
    // Время снятия бана за варны
    warnsBanDays: 30,
    // Время снятия всех варнов от последнего
    warnDays: 14,

    /// Инициализация админских команд из всех модулей
    init() {
        notifs = call('notifications');

        console.log("[COMMANDS] load commands...");
        fs.readdirSync(path.dirname(__dirname)).forEach(file => {
            if (file != 'base' && !ignoreModules.includes(file) && fs.existsSync(path.dirname(__dirname) + "/" + file + '/commands.js')) {
                Object.assign(commands, require('../' + file + '/commands'));
                console.log(`[COMMANDS] --${file}`);
            }
        });
        console.log("[COMMANDS] loaded.");
    },
    getCommands() {
        return commands;
    },
    isValidArg(type, arg) {
        if (type == "n") return !isNaN(arg) && arg.length > 0;
        if (type == "s") return arg && arg.length > 0;
        if (type == "b") return !isNaN(arg) && (arg == 0 || arg == 1);
        return false;
    },
    toValidArg(type, arg) {
        if (type == "n") return parseFloat(arg);
        if (type == "b") return arg == 1 ? true : false;
        return arg;
    },
    isTerminalCommand(args) {
        return args.indexOf(':') != -1;
    },
    getMassTeleportData() {
        return massTeleportData;
    },
    setMassTeleportData(pos, dimension) {
        massTeleportData.position = pos;
        massTeleportData.dimension = dimension;
    },
    checkClearWarns(player) {
        if (!player.character.warnNumber) return;
        if (!player.character.warnDate || Date.now() - player.character.warnDate.getTime() > this.warnDays * 24 * 60 * 60 * 1000) {
            player.character.warnNumber = 0;
            player.character.warnDate = null;
            player.character.save();
            notifs.success(player, `Варны были анулированы. Не нарушайте правила.`);
        }
    },
    async removeAccounts() {
        await this.removeCharacters();

        let accounts = await db.Models.Account.findAll({

        });
        for (let j = 0; j < accounts.length; j++) {
            await accounts[j].destroy();
        }
        console.log(`All accounts destroyed`);
    },
    async removeCharacters(accountId) {
        if (accountId == null) {
            mp.players.forEach(player => player.kick("Персонаж удален"));
        }

        let options = {
            include: [{
                model: db.Models.Feature,
            },
                {
                    model: db.Models.Appearance,
                },
                {
                    model: db.Models.Promocode,
                    include: db.Models.PromocodeReward,
                },
                {
                    as: "settings",
                    model: db.Models.CharacterSettings,
                },
            ]
        };
        if (accountId != null) {
            options.where = {
                accountId: accountId
            }
        }
        let characters = await db.Models.Character.findAll(options);
        await this.removeCharactersObjects(characters);
        console.log(`All characters destroyed`);
    },
    async removeAccount(id) {
        await this.removeCharacters(id);

        let account = await db.Models.Account.findOne({
            where: {
                id: id
            },
        });
        await account.destroy();
        console.log(`Account with id ${id} destroyed`);
    },
    async removeCharacter(id) {
        let player = this.findPlayerByCharacterId(id);
        if (player != null) {
            player.kick("Персонаж удален");
        }

        let characters = await db.Models.Character.findAll({
            where: {
                id: id
            },
            include: [{
                    model: db.Models.Feature,
                },
                {
                    model: db.Models.Appearance,
                },
                {
                    model: db.Models.Promocode,
                    include: db.Models.PromocodeReward,
                },
                {
                    as: "settings",
                    model: db.Models.CharacterSettings,
                },
            ]
        });
        await this.removeCharactersObjects(characters);
        if (characters.length === 0) {
            console.log(`Character with id ${id} does not exist`);
        }
    },
    async removeCharactersObjects(characters) {
        for (let i = 0; i < characters.length; i++) {
            characters[i].CharacterInventories = await db.Models.CharacterInventory.findAll({
                where: {
                    parentId: null,
                    playerId: characters[i].id
                },
                include: {
                    as: "params",
                    model: db.Models.CharacterInventoryParam,
                },
            });
            characters[i].tattoos = await db.Models.CharacterTattoo.findAll({
                where: {
                    characterId: characters[i].id
                }
            });
            let phone = await db.Models.Phone.findOne({
                where: {
                    characterId: characters[i].id
                },
                include: [
                    db.Models.PhoneContact,
                    db.Models.PhoneCallStory,
                    {
                        model: db.Models.PhoneDialog,
                        include: [{
                            model: db.Models.PhoneMessage,
                            limit: 20,
                        }, ]
                    }
                ]
            });
            let jobSkills = await db.Models.JobSkill.findAll({
                where: {
                    characterId: characters[i].id
                }
            });
            let familiars = await db.Models.Familiar.findAll({
                where: {
                    [Op.or]: {
                        characterA: characters[i].id,
                        characterB: characters[i].id
                    }
                },
            });
            let notificationsList = await db.Models.Notification.findAll({
                where: {
                    characterId: characters[i].id
                }
            });
            let fines = await db.Models.Fine.findAll({
                where: {
                    [Op.or]: {
                        copId: characters[i].id,
                        recId: characters[i].id
                    }
                },
            });
            let vehicles = await db.Models.Vehicle.findAll({
                where: {
                    [Op.and]: {
                        key: "private",
                        owner: characters[i].id
                    }
                },
            });
            let policeRecords = await db.Models.PoliceRecord.findAll({
                where: {
                    characterId: characters[i].id
                }
            });

            for (let j = 0; j < characters[i].CharacterInventories.length; j++) {
                await characters[i].CharacterInventories[j].destroy();
            }
            for (let j = 0; j < characters[i].tattoos.length; j++) {
                await characters[i].tattoos[j].destroy();
            }
            for (let j = 0; j < characters[i].Appearances.length; j++) {
                await characters[i].Appearances[j].destroy();
            }
            for (let j = 0; j < characters[i].Features.length; j++) {
                await characters[i].Features[j].destroy();
            }
            for (let j = 0; j < jobSkills.length; j++) {
                await jobSkills[j].destroy();
            }
            for (let j = 0; j < familiars.length; j++) {
                await familiars[j].destroy();
            }
            for (let j = 0; j < notificationsList.length; j++) {
                await notificationsList[j].destroy();
            }
            for (let j = 0; j < fines.length; j++) {
                await fines[j].destroy();
            }
            for (let j = 0; j < vehicles.length; j++) {
                await vehicles[j].destroy();
            }
            for (let j = 0; j < policeRecords.length; j++) {
                await policeRecords[j].destroy();
            }

            if (characters[i].Promocode != null) {
                await characters[i].Promocode.destroy();
            }
            if (characters[i].settings != null) {
                await characters[i].settings.destroy();
            }

            if (phone != null) {
                for (let j = 0; j < phone.PhoneContacts.length; j++) {
                    await phone.PhoneContacts[j].destroy();
                }
                for (let j = 0; j < phone.PhoneCallStories.length; j++) {
                    await phone.PhoneCallStories[j].destroy();
                }
                for (let j = 0; j < phone.PhoneDialogs.length; j++) {
                    for (let k = 0; k < phone.PhoneDialogs[j].PhoneMessages.length; k++) {
                        await phone.PhoneDialogs[j].PhoneMessages[k].destroy();
                    }
                    await phone.PhoneDialogs[j].destroy();
                }
                await phone.destroy();
            }

            let charId = characters[i].id;
            await characters[i].destroy();

            console.log(`Character with id ${charId} destroyed`);
        }
    },
    findPlayerByCharacterId(id) {
        let currentPlayer = null;
        mp.players.forEach(player => {
            if (currentPlayer != null) return;
            if (player != null && player.character != null && player.character.id === id) {
                currentPlayer = player;
            }
        });
        return currentPlayer;
    }
};
