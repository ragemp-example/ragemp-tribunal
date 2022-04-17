var notifs = require('../notifications');
var fib = require('./index');

module.exports = {
    "/fspy": {
        access: 6,
        description: "Установить/снять просшуку.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            mp.events.call(`fib.spy`, player, args[0]);
        }
    },
    "/faddcall": {
        access: 6,
        description: "Добавить вызов в планшет.",
        args: "[описание]",
        handler: (player, args, out) => {
            mp.events.call(`mapCase.fib.calls.add`, player, args.join(" "));
        }
    },
    "/fremcall": {
        access: 6,
        description: "Удалить вызов из планшета.",
        args: "[ид]:n",
        handler: (player, args, out) => {
            mp.events.call(`mapCase.fib.calls.remove`, player, args[0]);
        }
    },
}
