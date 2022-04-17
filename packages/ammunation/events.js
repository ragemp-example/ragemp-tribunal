let ammunation = require('./index.js');
let inventory = call('inventory');
let money = call('money');
let notify = call('notifications');

module.exports = {
    "init": async () => {
        await ammunation.init();
        inited(__dirname);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (shape.isAmmunation) {
            let id = shape.ammunationId;
            let data = ammunation.getRawShopData(id);
            let weaponsConfig = ammunation.getWeaponsConfig();
            player.call('ammunation.enter', [data, weaponsConfig, ammunation.ammoProducts]);
            player.currentAmmunationId = shape.ammunationId;
        }
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (shape.isAmmunation) {
            player.call('ammunation.exit');
        }
    },
    "ammunation.weapon.buy": (player, weaponId) => {
        let ammunationId = player.currentAmmunationId;
        if (ammunationId == null) return;

        if (!player.character) return;
        if (!player.character.gunLicenseDate) return notify.error(player, 'У вас нет лицензии на оружие');
        let weaponData = ammunation.weaponsConfig[weaponId];

        let price = parseInt(weaponData.products * ammunation.productPrice * ammunation.getPriceMultiplier(ammunationId));
        if (player.character.cash < price) return notify.error(player, 'Недостаточно денег');
        let productsAvailable = ammunation.getProductsAmount(ammunationId);
        let finalProducts = parseInt(weaponData.products * 0.8);
        if (finalProducts > productsAvailable) return notify.error(player, 'В магазине кончились ресурсы');

        let params = {
            weaponHash: mp.joaat(weaponData.gameId),
            ammo: 0,
            owner: player.character.id
        };

        inventory.addItem(player, weaponData.itemId, params, (e) => {
            if (e) return notify.error(player, e);

            money.removeCash(player, price, function (result) {
                if (result) {
                    ammunation.removeProducts(ammunationId, finalProducts);
                    ammunation.updateCashbox(ammunationId, price);
                    notify.success(player, `Вы приобрели ${weaponData.name}`);
                } else {
                    notify.error(player, 'Ошибка финансовой операции');
                }
            }, `Покупка оружия ${weaponData.name}`);
        });
    },
    "ammunation.ammo.buy": (player, values) => {
        let ammunationId = player.currentAmmunationId;
        if (ammunationId == null) return;

        if (!player.character) return;
        if (!player.character.gunLicenseDate) return notify.error(player, 'У вас нет лицензии на оружие');
        
        values = JSON.parse(values);
        let ammoItemId = values[0];
        let ammoCount = values[1];

        let price = parseInt(ammunation.ammoProducts * ammoCount * ammunation.productPrice * ammunation.getPriceMultiplier(ammunationId));
        if (player.character.cash < price) return notify.error(player, 'Недостаточно денег');

        let productsAvailable = ammunation.getProductsAmount(ammunationId);
        let finalProducts = parseInt(ammunation.ammoProducts * ammoCount * 0.8);
        if (finalProducts > productsAvailable) return notify.error(player, 'В магазине кончились ресурсы');

        let params = {
            count: ammoCount,
            owner: player.character.id
        };

        inventory.addItem(player, ammoItemId, params, (e) => {
            if (e) return notify.error(player, e);

            money.removeCash(player, price, function (result) {
                if (result) {
                    ammunation.removeProducts(ammunationId, finalProducts);
                    ammunation.updateCashbox(ammunationId, price);
                    notify.success(player, 'Вы приобрели боеприпасы');
                } else {
                    notify.error(player, 'Ошибка финансовой операции');
                }
            }, `Покупка боеприпасов с itemId #${ammoItemId} (${ammoCount} шт.)`);
        });
    },
    "ammunation.armour.buy": (player, armourId) => {
        let ammunationId = player.currentAmmunationId;
        if (ammunationId == null) return;

        if (!player.character) return;
        
        let weaponData = ammunation.weaponsConfig[armourId];

        let price = parseInt(weaponData.products * ammunation.productPrice * ammunation.getPriceMultiplier(ammunationId));
        if (player.character.cash < price) return notify.error(player, 'Недостаточно денег');
       
        let productsAvailable = ammunation.getProductsAmount(ammunationId);
        let finalProducts = parseInt(weaponData.products * 0.8);
        if (finalProducts > productsAvailable) return notify.error(player, 'В магазине кончились ресурсы');
        let params = {
            variation: 12,
            texture: weaponData.texture,
            health: 50,
            pockets: '[3,3,3,3,3,3,3,3,10,5,3,5,10,3,3,3]',
            sex: player.character.gender ? 0 : 1
        };

        inventory.addItem(player, 3, params, (e) => {
            if (e) return notify.error(player, e);
            money.removeCash(player, price, function (result) {
                if (result) {
                    ammunation.removeProducts(ammunationId, finalProducts);
                    ammunation.updateCashbox(ammunationId, price);
                    notify.success(player, 'Вы приобрели бронежилет');
                } else {
                    notify.error(player, 'Ошибка финансовой операции');
                }
            }, `Покупка бронежилета`);
        });
    },
}