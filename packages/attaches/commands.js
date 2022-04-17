module.exports = {
    "/attach": {
        description: "Добавить аттач предмета к игроку.",
        access: 6,
        args: "[ид_игрока]:n [ид_аттача]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return out.error(`Игрок #${args[0]} не найден`, player);

            args.splice(0, 1);
            var id = args.join(" ").trim();
            rec.addAttachment(id);
        }
    },
    "/remattach": {
        description: "Удалить аттач предмета у игрока.",
        access: 6,
        args: "[ид_игрока]:n [ид_аттача]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return out.error(`Игрок #${args[0]} не найден`, player);

            args.splice(0, 1);
            var id = args.join(" ").trim();
            rec.addAttachment(id, true);
        }
    },
    "/testattach": {
        access: 1,
        description: "Тестовый аттач (используется для настройки аттачей).",
        args: "[model] [bone]:n [x]:n [y]:n [z]:n [rX]:n [rY]:n [rZ]:n",
        handler: (player, args, out) => {
            player.call(`attaches.test`, args);
        }
    },
    "/testattachoff": {
        access: 1,
        description: "Удалить тестовый аттач (используется для настройки аттачей).",
        args: "",
        handler: (player, args, out) => {
            player.call(`attaches.testoff`);
        }
    },
}
