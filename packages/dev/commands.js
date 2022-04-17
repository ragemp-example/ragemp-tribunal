let dev = call('dev');

module.exports = {
    "/eval": {
        description: "Выполнить код на сервере.",
        access: 6,
        args: "[code]",
        handler: (player, args, out) => {
            var code = args.join(" ");
            out.log(code);
            out.log(eval(code));
        }
    },
    "/evalcl": {
        description: "Выполнить код на клиенте игрока.",
        access: 6,
        args: "[ид_игрока]:n [code]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return out.error(`Игрок #${args[0]} не найден`, player);

            args.shift();
            var code = args.join(" ");

            out.log(`${rec.name} (client) <= ${code}`, player);
            rec.call(`dev.eval`, [code, player.id]);
        }
    },
    "/build": {
        description: "Вкл/выкл номер сборки в худе.",
        access: 3,
        args: "[состояние]:b",
        handler: (player, args, out) => {
            dev.enableBuild(args[0]);
            if (args[0]) out.info(`${player.name} включил показ сборки сервера`);
            else out.info(`${player.name} выключил показ сборки сервера`);
        }
    },
    "/query": {
        description: "Время запроса 1+1 в БД.",
        access: 3,
        args: "[количество]:n",
        handler: async (player, args, out) => {
            var sequelize = require(`../base/db`).sequelize;
            var all = 0;
            for (var i = 0; i < args[0]; i++) {
                var start = Date.now();
                await sequelize.query(`SELECT 1+1 FROM characters`);
                var diff = Date.now() - start;
                out.info(`time: ${diff} ms.`, player);
                all += diff;
            }
            out.info(`Среднее: ${all / args[0]} ms.`, player);
        }
    },
}
