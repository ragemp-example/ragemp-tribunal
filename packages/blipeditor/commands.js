let blipeditor = require('./index');
let notifs = call("notifications");

module.exports = {
    "/blipadd": {
        description: "Создать метку на карте",
        args: "[name]:s [sprite]:n [color]:n [scale]:n",
        access: 5,
        handler: async (player, args) => {
            await blipeditor.create({
                name: args[0],
                sprite: args[1],
                x: player.position.x,
                y: player.position.y,
                color: args[2],
                dimension: player.dimension,
                scale: args[3],
            });
            notifs.info(player, "Объект создан", "Создание объекта");
        }
    },
    "/blipaddeverywhere": {
        description: "Создать метку на карте",
        args: "[name]:s [sprite]:n [color]:n [scale]:n",
        access: 5,
        handler: async (player, args) => {
            await blipeditor.create({
                name: args[0],
                sprite: args[1],
                x: player.position.x,
                y: player.position.y,
                color: args[2],
                dimension: null,
                scale: args[3],
            });
            notifs.info(player, "Метка на карте создана во всех измерениях", "Создание метки на карте");
        }
    },
    "/blipremove": {
        description: "Удалить метку на карте",
        args: "[id]:n",
        access: 5,
        handler: async (player, args) => {
            let result = await blipeditor.remove(args[0]);
            if (result) {
                notifs.info(player, "Метка на карте удалена", "Удаление метки на карте");
            } else {
                notifs.info(player, "Метки на карте с таким id не существует", "Удаление метки на карте");
            }
        }
    },
    "/bliplist": {
        description: "Показать список меток на карте",
        args: "",
        access: 5,
        handler: async (player, args) => {
            blipeditor.show(player);
        }
    },
};