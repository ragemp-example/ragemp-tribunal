let time = require('./index');

module.exports = {
    "/payday": {
        access: 6,
        description: "Вызвать PayDay",
        args: "",
        handler: (player, args) => {
            time.payDay();
        }
    },
    "/settime": {
        access: 6,
        description: "Сменить время",
        args: "[часы]",
        handler: (player, args, out) => {
            let hours = parseInt(args[0]);
            time.setCustomTime(hours);
            out.info(`${player.name} установил время на ${hours} ч.`);
        }
    },
    "/resettime": {
        access: 6,
        description: "Возобновить обновление времени",
        args: "",
        handler: (player, args, out) => {
            time.resetCustomTime();
            out.info(`${player.name} возобновил обновление времени`);
        }
    }
}
