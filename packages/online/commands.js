const online = require('./index');

module.exports = {
    "/toponline": {
        access: 6,
        description: "Вывести топ игроков по онлайну за период",
        args: "[период_в_днях]:n [лимит]:n",
        handler: async (player, args, out) => {
            const top = await online.getTopOnlinePlayers(parseInt(args[0]), parseInt(args[1]));
            if (!top) return;
            out.info('------Топ игроков по онлайну------');
            top.forEach((p, i) => p.total && out.info(`${i+1}) ${p.name} - ${Math.floor(p.total / 60)} часов`))
            out.info('----------------------------------');
        }
    },
};