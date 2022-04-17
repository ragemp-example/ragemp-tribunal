let houseService = require('./index.js');


module.exports = {
    "/gotohouse": {
        description: "Переместиться к дому",
        args: "[id]:n",
        access: 4,
        handler: (player, args) => {
            let house = houseService.getHouseById(parseInt(args[0]));
            if (house == null) return;
            let info = house.info;
            player.position = new mp.Vector3(info.spawnX, info.spawnY, info.spawnZ);
        }
    },
    "/houseadd": {
        description: "Создать дом",
        args: "",
        access: 5,
        handler: (player, args) => {
            player.call("house.add.open", []);
        }
    },
    "/housedropall": {
        description: "Сбросить владельцев всех домов",
        args: "",
        access: 6,
        handler: async (player, args) => {
            await houseService.dropAllHouses();
            player.call('notifications.push.info', ["У всех домов очищен владелец", "Система домов"]);
        }
    },
    "/houseremove": {
        access: 5,
        handler: (player, args) => {
            if (isNaN(parseInt(args[0]))) return;
            houseService.removeHouse(parseInt(args[0]), player);
        }
    },
    "/housechangeprice": {
        description: "Обновить интерьер у дома",
        access: 5,
        args: "[id]:n [цена_дома]:n",
        handler: (player, args) => {
            if (isNaN(parseInt(args[0])) || isNaN(parseInt(args[1]))) return player.call('notifications.push.error', ["Введите аргументы верно", "Ошибка"]);
            if (!houseService.changePrice(parseInt(args[0]), parseInt(args[1]))) {
                player.call('notifications.push.error', ["Ошибка изменения интерьера", "Ошибка"]);
                return;
            }
            player.call('notifications.push.success', ["Вы изменили цену у дома с id " + args[0] + " на " + args[1], "Успешно"]);
        }
    },
    "/interioradd": {
        description: "Добавить интерьер",
        args: "",
        access: 5,
        handler: (player, args) => {
            player.call("house.add.interior.open", []);
        }
    },
    "/garageadd": {
        description: "Добавить гараж",
        args: "",
        access: 5,
        handler: (player, args) => {
            player.call("house.add.garage.open", []);
        }
    },
    "/housechangeint": {
        description: "Обновить интерьер у дома",
        access: 5,
        args: "[id]:n [interiorId]:n",
        handler: (player, args, out) => {
            if (isNaN(parseInt(args[0])) || isNaN(parseInt(args[1]))) return player.call('notifications.push.error', ["Введите аргументы верно", "Ошибка"]);
            if (!houseService.changeInterior(parseInt(args[0]), parseInt(args[1]))) {
                player.call('notifications.push.error', ["Ошибка изменения интерьера", "Ошибка"]);
                return;
            }
            player.call('notifications.push.success', ["Вы изменили интерьер у дома с id " + args[0] + " на " + args[1], "Успешно"]);
        }
    },
}
