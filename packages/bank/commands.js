let bankService = require('./index.js');

module.exports = {
    "/createbank": {
        access: 6,
        description: "Создать банк",
        args: "",
        handler: async (player, args, out) => {
            await bankService.createBank(player);
            out.info("Новый банк создан", player)
        }
    },
    "/destroybank": {
        access: 6,
        description: "Удалить банк",
        args: "",
        handler: async (player, args, out) => {
            if (await bankService.deleteBank(player)) {
                out.info("Банк удален", player);
            }
            else {
                out.error("Вы находитесь не рядом с банком", player);
            }
        }
    },
    "/gotobank": {
        access: 5,
        description: "Переместиться к банку",
        args: "[id]:n",
        handler: async (player, args, out) => {
            let bank = bankService.getBankById(args[0]);
            if (bank != null) player.position = new mp.Vector3(bank.info.x, bank.info.y, bank.info.z + 1);
        }
    },
};