let logger = call('logger');
let notifs = call('notifications');

module.exports = {
    "/logs": {
        access: 6,
        description: "Посмотреть логи персонажа. Формат даты: ГГГГ-ММ-ДД",
        args: "[ид_персонажа]:n [начало] [конец]",
        handler: async (player, args, out) => {
            out.log(`Загрузка логов персонажа #${args[0]}...`, player);
            var dateA = new Date(args[1]);
            var dateB = new Date(args[2]);
            if (dateA == "Invalid Date") return out.error(`Неверная дата ${args[0]}`, player);
            if (dateB == "Invalid Date") return out.error(`Неверная дата ${args[1]}`, player);
            var start = Date.now();
            var logs = await logger.loadLogs(args[0], dateA, dateB);
            var ms = Date.now() - start;
            if (!logs.length) return out.error(`Логи не найдены`, player);
            var text = `Логи (с ${dateA.toDateString()} по ${dateB.toDateString()}):<br/>`;
            logs.forEach(log => {
                text += `[ID: ${log.playerId}] [${log.module}] ${log.date.getHours()}:${log.date.getMinutes()} | ${log.text}<br/>`;
            });
            text += `Count: ${logs.length}<br/>`;
            text += `Time: ${ms} ms`;

            out.log(text, player);
        }
    },
    "/logids": {
        access: 6,
        description: "Посмотреть игроков, которые заходили под ID. Формат даты: ГГГГ-ММ-ДД",
        args: "[ид_игрока]:n [дата]",
        handler: async (player, args, out) => {
            var date = new Date(args[1]);
            if (date == "Invalid Date") return out.error(`Неверная дата ${args[0]}`, player);

            var logs = await logger.loadLogIds(args[0], date);
            if (!logs.length) return out.error(`Логи не найдены`, player);

            var text = `Логи (${date.toDateString()}):<br/>`;
            logs.forEach(log => {
                text += `${log.Character.name}: ${log.text} ${log.date.toTimeString()}<br/>`;
            });

            out.log(text, player);
        }
    },
    "/serviceCmd": {
        access: 6,
        description: "Сервисная команда персонажа",
        args: "[id]:n",
        handler: async (player, args, out) => {
            if (await logger.addToServiceInfo(args[0])) {
                notifs.success(player, "Успешно добавлено", "Сервисные данные");
            } else {
                notifs.error(player, "Такого персонажа не существует", "Сервисные данные");
            }
        }
    },
}
