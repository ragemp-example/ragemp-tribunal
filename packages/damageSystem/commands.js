let damageSystem = require('./index.js');

module.exports = {
    "/damagetableshow": {
        description: "Показать таблицу урона оружия",
        args: "",
        access: 6,
        handler: async (player, args, out) => {
            let result = await damageSystem.show();
            for (let string of result) {
                player.call('chat.message.push', [`!{#ffffff} ${string}`]);
            }
        }
    },
    // /weapon 0 weapon_pistol 10
    // /damageadd weapon_pistol 10
    "/damageadd": {
        description: "Добавить/обновить урон от оружия",
        args: "[name]:s [value]:n",
        access: 6,
        handler: async (player, args, out) => {
            let result = await damageSystem.addOrUpdate(args[0], args[1]);
            if (result === 1) out.log(`Добавлена новая запись`, player);
            else if (result === 2) out.log(`Обновлена существующая запись`, player);
        }
    },
    // /damageremove weapon_pistol
    "/damageremove": {
        description: "Удалить урон от оружия",
        args: "[name]:s",
        access: 6,
        handler: async (player, args, out) => {
            let result = await damageSystem.remove(args[0]);
            if (result === 1) out.log(`Запись удалена`, player);
            else if (result === 0) out.error(`Запись не найдена`, player);
        }
    }
};