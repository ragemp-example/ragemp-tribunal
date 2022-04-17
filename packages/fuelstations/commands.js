let fuelstations = require('./index.js')
module.exports = {
    "/fu": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(265.92852783203125, -1245.748291015625, 29.14651107788086));
        }
    },
    "/setfuelprice": {
        access: 6,
        description: "Установить цену топлива на АЗС",
        args: "[ID АЗС] [цена за литр]",
        handler: (player, args) => {
            let fsId = parseInt(args[0]);
            if (isNaN(fsId)) return player.call('notifications.push.error', ['Некорректное значение', 'Ошибка']);;;
            let price = parseInt(args[1]);
            if (isNaN(price) || price < 1 || price > 100) return player.call('notifications.push.error', ['Некорректное значение', 'Ошибка']);;

            try {
                fuelstations.setFuelPrice(fsId, price);
                player.call('notifications.push.success', [`Цена топлива АЗС №${fsId} - $${price}`, 'Успешно']);
            } catch (err) {
                player.call('notifications.push.error', [err.message, 'Ошибка']);
            }
        }
    }
}