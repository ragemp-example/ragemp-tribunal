let notifs = call('notifications');

module.exports = {
    "/promocode": {
        access: 5,
        description: "Изменить реферальный промокод игрока.",
        args: "[ид_игрока]:n [промокод]",
        handler: async (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            var code = args[1].toUpperCase();
            var promocode = await db.Models.Promocode.findOne({
                attributes: ["id"],
                where: {
                    promocode: code
                }
            });
            if (promocode) return out.error(`Промокод ${args[1]} занят`, player);

            rec.character.Promocode.promocode = code;
            rec.character.Promocode.save();

            out.info(`${player.name} изменил промокод ${rec.name} на ${code}`)
            notifs.success(rec, `${player.name} изменил ваш промокод на ${code}`);
            mp.events.call("player.promocode.changed", rec);
        }
    },
    "/media": {
        access: 5,
        description: "Выдать/забрать роль медиа (ютубер/стример).",
        args: "[ид_игрока]:n",
        handler: async (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            var promocode = rec.character.Promocode;
            promocode.media = !promocode.media;
            promocode.save();

            if (promocode.media) {
                out.info(`${player.name} выдал ${rec.name} роль медиа`)
                notifs.success(rec, `${player.name} выдал вам роль медиа`);
            } else {
                out.info(`${player.name} забрал у ${rec.name} роль медиа`)
                notifs.success(rec, `${player.name} забрал у вас роль медиа`);
            }
            mp.events.call("player.media.changed", rec);
        }
    },
    "/mediastats": {
        access: 5,
        description: "Статистика медиа (ютуберов/стримеров).",
        args: "",
        handler: async (player, args, out) => {

            var promocodes = await db.Models.Promocode.findAll({
                where: {
                    media: 1
                },
                include: {
                    attributes: ["name"],
                    model: db.Models.Character,
                },
                order: [
                    ["invited", "DESC"],
                    ["completed", "DESC"],
                ],
            });
            var text = `ТОП медиа:<br/>`;
            for (var i = 0; i < promocodes.length; i++) {
                var p = promocodes[i];
                text += `${i+1}) ${p.Character.name} - ${p.promocode} [${p.completed}/${p.invited}]<br/>`;
            }
            out.log(text, player);
        }
    },
}
