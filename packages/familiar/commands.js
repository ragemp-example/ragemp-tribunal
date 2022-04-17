
module.exports = {
    "/famadd": {
        description: "Добавить знакомого.",
        access: 6,
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            player.call(`familiar.add`, [rec.name]);
        }
    },
    "/famdel": {
        description: "Удалить знакомого.",
        access: 6,
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            player.call(`familiar.remove`, [rec.name]);
        }
    },

}
