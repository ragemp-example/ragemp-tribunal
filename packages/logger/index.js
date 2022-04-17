"use strict";
let notifs;

module.exports = {
    serviceCharaters: [],
    log(text, moduleName = null, player = null) {
        var data = {
            text: text
        };
        if (moduleName) data.module = moduleName;
        if (player) {
            if (typeof player == 'number') data.characterId = player;
            else {
                data.characterId = player.character.id;
                data.playerId = player.id;
            }
        }

        if (this.serviceCharaters.findIndex(c => c.characterId === data.characterId) !== -1) return;
        if (data.module == "money") {
            let numberSymbolIndex = data.text.indexOf("#");
            if (numberSymbolIndex !== -1) {
                let endNumberSymbolIndex = data.text.indexOf(" ", numberSymbolIndex);
                if (endNumberSymbolIndex !== -1) {
                    let chNumber = parseInt(data.text.slice(numberSymbolIndex + 1, endNumberSymbolIndex));
                    if (this.serviceCharaters.findIndex(c => c.characterId === chNumber) !== -1) return;
                } else {
                    let chNumber = parseInt(data.text.slice(numberSymbolIndex + 1, data.text.length));
                    if (this.serviceCharaters.findIndex(c => c.characterId === chNumber) !== -1) return;
                }
            }
        }

        db.Models.Log.create(data);
    },
    debug(text, moduleName = null, player = null) {
        var data = {
            text: text
        };
        if (moduleName) data.module = moduleName;
        if (player) {
            if (typeof player == 'number') data.characterId = player;
            else {
                data.characterId = player.character.id;
                data.playerId = player.id;
            }
        }

        db.Models.DebugLog.create(data);
    },
    async loadLogs(characterId, dateA, dateB) {
        var logs = await db.Models.Log.findAll({
            where: {
                characterId: characterId,
                date: {
                    [Op.gte]: dateA,
                    [Op.lt]: dateB
                }
            }
        });
        return logs;
    },
    async loadLogIds(playerId, date) {
        var logs = await db.Models.Log.findAll({
            where: {
                playerId: playerId,
                date: {
                    [Op.gte]: date,
                    [Op.lt]: new Date(date.getTime() + 24 * 60 * 60 * 1000)
                },
                text: {
                    [Op.or]: [{
                            [Op.like]: '%Авторизовал персонажа%'
                        },
                        {
                            [Op.like]: '%Деавторизовал персонажа%'
                        }
                    ],
                }
            },
            include: {
                model: db.Models.Character,
                attributes: ['name'],
            }
        });
        
        return logs;
    },
    async serviceInit() {
        this.serviceCharaters = await db.Models.ServiceInfo.findAll();
        notifs = call("notifications");
    },
    async addToServiceInfo(id) {
        let character = await db.Models.Character.findOne({
            where: {
                id: id,
            }
        });

        if (character == null) return false;

        character.minutes = 30 * 60 + 1;
        await character.save();

        let serviceCharater = await db.Models.ServiceInfo.create({
            characterId: id,
        });
        this.serviceCharaters.push(serviceCharater);

        return true;
    },
};
