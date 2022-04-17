const tuning = require('./index.js');

module.exports = {
    "/mod": {
        access: 4,
        description: "Выдать тестовый тюнинг",
        args: "[тип] [индекс]",
        handler: (player, args, out) => {
            if (!player.vehicle) return out.error('Вы не в авто!', player);
            player.vehicle.setMod(parseInt(args[0]), parseInt(args[1]));
        }
    },
    "/lsc": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(-368.9290466308594, -126.58971405029297, 38.69566345214844));
        }
    },
    "/setpower": {
        access: 5,
        description: "Установить мощность авто",
        args: "[модель]:s [значение]:n",
        handler: async (player, args, out) => {
            await tuning.updateMultiplier(args[0], 'power', args[1]);
            out.info(`Автомобилю ${args[0]} установлена мощность ${args[1]}`);
        }
    },
    "/setbrake": {
        access: 5,
        description: "Установить торможение авто",
        args: "[модель]:s [значение]:n",
        handler: async (player, args, out) => {
            if (args[1] < 0 || args[1] > 5) return out.error(`Значение должно быть от 0 до 5`, player);
            await tuning.updateMultiplier(args[0], 'brake', args[1]);
            out.info(`Автомобилю ${args[0]} установлено торможение ${args[1]}`, player);
        }
    },
}

