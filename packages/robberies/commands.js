module.exports = {
    "/robhouse": {
        access: 6,
        description: "Начать ограбление дома",
        args: "[id]:n",
        handler: (player, args, out) => {
            mp.events.call(`robberies.start`, player, true, args[0]);
        }
    },
    "/robbiz": {
        access: 6,
        description: "Начать ограбление бизнеса",
        args: "[id]:n",
        handler: (player, args, out) => {
            mp.events.call(`robberies.start`, player, false, args[0]);
        }
    },
}