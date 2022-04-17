"use strict";

module.exports = {
    // Макс. кол-во знакомых
    maxList: 100,

    async initList(player) {
        var dbList = await db.Models.Familiar.findAll({
            where: {
                [Op.or]: {
                    characterA: player.character.id,
                    characterB: player.character.id
                }
            },
            include: [{
                    as: "characterOne",
                    model: db.Models.Character,
                    attributes: ['name']
                },
                {
                    as: "characterTwo",
                    model: db.Models.Character,
                    attributes: ['name']
                }
            ],
            limit: this.maxList
        });
        player.familiar = {
            list: dbList
        };

        var names = this.getNamesList(player);
        player.call(`familiar.init`, [names]);
    },
    getNamesList(player) {
        var names = [];
        player.familiar.list.forEach(familiar => {
            if (familiar.characterA == player.character.id) names.push(familiar.characterTwo.name);
            else names.push(familiar.characterOne.name);
        });
        return names;
    },
    have(player, characterId) {
        var i = player.familiar.list.findIndex(x => x.characterA == characterId || x.characterB == characterId);
        return i != -1;
    },
    add(player, rec) {
        if (this.have(player, rec.character.id)) return;
        var fam = db.Models.Familiar.build({
            characterA: player.character.id,
            characterB: rec.character.id
        });
        fam.save();

        player.familiar.list.push(fam);
        rec.familiar.list.push(fam);

        player.call(`familiar.add`, [rec.name]);
        rec.call(`familiar.add`, [player.name]);

        if (player.familiar.list.length > this.maxList) player.familiar.list.shift().destroy();
        if (rec.familiar.list.length > this.maxList) rec.familiar.list.shift().destroy();
    },
};
