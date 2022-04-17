let fishing = require('./index.js');
let inventory;
let notifs;
let utils;

module.exports = {
    "init": async () => {
        inventory = call('inventory');
        notifs = call('notifications');
        utils = call('utils');
        await fishing.init();
        inited(__dirname);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;

        if (shape.isFisher) {
            player.call('fishing.menu.show', [fishing.rodPrice]);
            player.currentColshape = shape;
        }

        if (shape.isFishPortSell) {
            player.call('fishing.menu.port.show');
        }
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;

        if (shape.isFisher) {
            player.call('fishing.menu.close');
            player.currentColshape = null;
        }

        if (shape.isFishPortSell) {
            player.call('fishing.menu.port.close');
        }
    },
    "fishing.game.enter": (player) => {
        if (!player.character) return;
        if (!player.fishing) player.fishing = {};
        if (inventory.getItemByItemId(player, fishing.getRodId())) return player.call('fishing.game.enter');

        notifs.error(player, "У вас нет удочки", "Ошибка");
        player.call('fishing.game.exit');
    },
    "fishing.game.start": async (player, depth) => {
        if (!player.character) return;
        if (!player.fishing) player.fishing = {};

        clearTimeout(player.fishing.timeoutFetch);

        let depthWeight = 5;

        if (depth < 10) depthWeight = 0;
        if (depth > 10 && depth < 20) depthWeight = 1;
        if (depth > 20 && depth < 50) depthWeight = 2;
        if (depth > 50 && depth < 150) depthWeight = 3;
        if (depth > 150 && depth < 250) depthWeight = 4;
        if (depth > 250 && depth < 450) depthWeight = 5;

        let rod = inventory.getHandsItem(player);
        if (!rod) {
            notifs.error(player, 'Удочка не в руках');
            return mp.events.call('fishing.game.exit', player);
        }
        const param = inventory.getParam(rod, 'health');
        if (!param) return mp.events.call('fishing.game.exit', player);
        let health = param.value;

        if (health <= 0) return mp.events.call('fishing.game.exit', player);

        inventory.updateParam(player, rod, 'health', health - 1);

        player.fishing.fish = fishing.fishes[utils.randomInteger(0, fishing.fishes.length - 1)];

        let zone = utils.randomInteger(10, 20);
        let speed = parseInt(health / 5);
        player.fishing.weight = utils.randomFloat(player.fishing.fish.minWeight + depthWeight, player.fishing.fish.maxWeight + depthWeight, 1);
        let time = utils.randomInteger(5, 15);

        player.fishing.timeoutFetch = setTimeout(() => {
            try {
                player.call('fishing.game.fetch', [speed, zone, player.fishing.weight, player.fishing.fish.name]);
            } catch (e) {

            }
        }, time*1000);
    },
    "fishing.game.end": (player, result) => {
        if (!player.character) return;
        if (!player.fishing) player.fishing = {};

        let rod = inventory.getItemByItemId(player, fishing.getRodId());
        let health = inventory.getParam(rod, 'health').value;

        if (result) {
            inventory.addItem(player, 15, { weight: player.fishing.weight, name: player.fishing.fish.name }, (e) => {
                if (!e) {
                    notifs.success(player, `${player.fishing.fish.name} весом ${player.fishing.weight} кг добавлен(a) в инвентарь`, 'Рыбалка');
                    fishing.addJobExp(player);
                } else {
                    return notifs.error(player, e, 'Ошибка');
                }
            });
        } else {
            notifs.error(player, 'Рыба сорвалась', 'Рыбалка');
        }

        if (health <= 0) {
            inventory.deleteItem(player, rod);
            notifs.error(player, 'Удочка сломалась', '');
            player.call('fishing.game.exit');
        }
    },
    "fishing.game.exit": (player) => {
        if (!player.character) return;
        if (!player.fishing) player.fishing = {}

        clearTimeout(player.fishing.timeoutFetch);
    },
    "fishing.rod.buy": (player) => {
        if (!player.character) return;

        fishing.buyRod(player);
    },
    "fishing.fish.sell": (player, isPort = false) => {
        if (!player.character) return;

        fishing.sellFish(player, isPort);
    }
};