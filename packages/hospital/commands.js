module.exports = {
    "/hheal": {
        access: 6,
        description: "Предложить лечение игроку.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            mp.events.call(`hospital.healing.show`, player, args[0]);
        }
    },
    "/haddcall": {
        access: 6,
        description: "Добавить вызов в планшет.",
        args: "[описание]",
        handler: (player, args, out) => {
            mp.events.call(`mapCase.ems.calls.add`, player, args.join(" "));
        }
    },
    "/hremcall": {
        access: 6,
        description: "Удалить вызов из планшета.",
        args: "[ид]:n",
        handler: (player, args, out) => {
            mp.events.call(`mapCase.ems.calls.remove`, player, args[0]);
        }
    },
}
