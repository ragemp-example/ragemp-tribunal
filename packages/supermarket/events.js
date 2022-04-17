let supermarket = require('./index.js');
let money = call('money');
let inventory = call('inventory');
let notify = call('notifications');

module.exports = {
    "init": async () => {
        await supermarket.init();
        inited(__dirname);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (shape.isSupermarket) {
            let id = shape.supermarketId;
            let data = supermarket.getRawShopData(id);
            player.call('supermarket.enter', [data]);
            player.currentsupermarketId = shape.supermarketId;
        }
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (shape.isSupermarket) {
            player.call('supermarket.exit');
        }
    },
    "supermarket.products.buy": (player, id) => {
        let supermarketId = player.currentsupermarketId;
        if (supermarketId == null) return;

        let item = supermarket.getItemById(id);

        let price = item.products * supermarket.productPrice * supermarket.getPriceMultiplier(supermarketId);
        if (player.character.cash < price) return notify.error(player, 'Недостаточно денег');
        let finalProducts = parseInt(item.products);
        let productsAvailable = supermarket.getProductsAmount(supermarketId);
        if (finalProducts > productsAvailable) return notify.error(player, 'В магазине кончились продукты');

        let params = {};

        switch (id) {
            case 13:
                params.sex = player.character.gender ? 0 : 1;
                params.pockets = '[12,4,12,7,12,10]';
                params.texture = 0;
                params.variation = 45;
                break;
            case 56:
                params.litres = 0;
                params.max = 20;
                break;
            case 34:
                params.thirst = 100;
                break;
            case 35:
                params.satiety = 20;
                params.thirst = -5;
                break;
            case 130:
                params.satiety = 10;
                params.thirst = 50;
                break;
            case 129:
                params.satiety = 40;
                params.thirst = -10;
                break;
            case 126:
                params.satiety = 60;
                params.thirst = -10;
                break;
            case 127:
                params.satiety = 65;
                params.thirst = -15;
                break; 
        }

        inventory.addItem(player, id, params, (e) => {
            if (e) return notify.error(player, e);
            money.removeCash(player, price, function (result) {
                if (result) {
                    supermarket.removeProducts(supermarketId, finalProducts);
                    supermarket.updateCashbox(supermarketId, price);
                    notify.success(player, `Вы приобрели предмет "${item.name}"`);
                } else {
                    notify.error(player, 'Ошибка покупки');
                }
            }, `Покупка в 24/7 item: ${id}`);
        });
    },
}
