let tuning = require('./index.js');
let money = call('money');
let vehicles = call('vehicles');

module.exports = {
    "init": async () => {
        await tuning.init();
        inited(__dirname);
    },
    "playerEnterColshape": (player, shape) => {
        if (shape.isCustoms) {
            if (!player.vehicle) return player.call('prompt.show', ['Вы должны находиться в транспорте']);
            
            if (player.vehicle.key != 'private') return player.call('prompt.show', ['Этот транспорт нельзя модифицировать']); 

            if (player.vehicle.owner != player.character.id) return player.call('prompt.show', ['Нельзя модифицировать чужой транспорт']);

            let allowedTypes = [0, 3];
            let modelsWithDisabledTuning = ['caddy', 'bmwe34'];
            if (!player.vehicle.tuning || !allowedTypes.includes(player.vehicle.properties.vehType)) return player.call('prompt.show', ['Этот транспорт нельзя модифицировать']);
            if (modelsWithDisabledTuning.includes(player.vehicle.modelName)) return player.call('prompt.show', ['Этот транспорт нельзя модифицировать']);
            let occupants = vehicles.getOccupants(player.vehicle);
            if (occupants.length > 1) return player.call('prompt.show', ['Нельзя тюнинговать транспорт с пассажирами']);

            player.call('tuning.fadeOut');
            let customs = tuning.getCustomsDataById(shape.customsId);
            player.currentCustomsId = shape.customsId;
            player.vehicle.dimension = player.id + 10000;
            player.vehicle.position = new mp.Vector3(customs.tuneX, customs.tuneY, customs.tuneZ);
            player.call('vehicles.heading.set', [customs.tuneH])
            let primary = player.vehicle.color1;
            let secondary = player.vehicle.color2;
            let priceInfo = {
                veh: player.vehicle.properties.price,
                config: tuning.getPriceConfig(),
                priceMultiplier: tuning.getPriceMultiplier(shape.customsId)
            }
            let ignoreGetterData = tuning.getIgnoreGetterModsData(player.vehicle);
            player.call('tuning.start', [customs.id, primary, secondary, priceInfo, ignoreGetterData]);
            // player.call('vehicles.engine.toggle', [false]);
            // player.vehicle.setVariable("engine", false);
            player.vehicle.isBeingTuned = true;

            // TODO: from Carter: test hotfix with vehicle dimension
            mp.players.forEach(rec => {
                if (!rec.character) return;
                if (rec.id == player.id) return;
                if (rec.dimension != player.vehicle.dimension) return;

                rec.dimension = 0;
            });
        }
    },
    "tuning.end": (player, id) => {
        if (!player.vehicle) return player.dimension = 0;
        let customs = tuning.getCustomsDataById(id);
        player.vehicle.position = new mp.Vector3(customs.returnX, customs.returnY, customs.returnZ);
        player.vehicle.dimension = 0;
        player.vehicle.isBeingTuned = false;
        player.call('vehicles.heading.set', [customs.returnH]);
    },
    "tuning.colors.set": async (player, primary, secondary) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.colors.set.ans', [2]);

        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.colors.set.ans', [3]);

        let customsId = player.currentCustomsId;
        if (customsId == null) return;

        let defaultPrice = tuning.getColorsPrice();
        let products = tuning.calculateProductsNeeded(defaultPrice);
        let price = parseInt(defaultPrice * tuning.getPriceMultiplier(customsId));

        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.colors.set.ans', [5]);

        if (player.character.cash < price) return player.call('tuning.colors.set.ans', [1]);

        money.removeCash(player, price, async function (result) {
            if (result) {
                vehicle.setColor(primary, secondary);
                vehicle.color1 = primary;
                vehicle.color2 = secondary;
                await vehicle.db.update({
                    color1: primary,
                    color2: secondary
                });
                player.call('tuning.colors.set.ans', [0]);
                tuning.removeProducts(customsId, products);
                tuning.updateCashbox(customsId, price);
            } else {
                player.call('tuning.colors.set.ans', [4]);
            }
        }, `Смена цвета т/с ${vehicle.properties.name} в LSC (#${primary} | #${secondary})`);
    },
    "tuning.buy": (player, type, index) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.buy.ans', [2]);

        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.buy.ans', [3]);

        let customsId = player.currentCustomsId;
        if (customsId == null) return;

        let defaultPrice = tuning.calculateModPrice(vehicle.properties.price, type, index);
        let products = tuning.calculateProductsNeeded(defaultPrice);
        let price = parseInt(defaultPrice * tuning.getPriceMultiplier(customsId));

        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.buy.ans', [5]);

        if (player.character.cash < price) return player.call('tuning.buy.ans', [1]);

        money.removeCash(player, price, function (result) {
            if (result) {
                let config = tuning.getModsConfig();
                let syncMods = tuning.elementsToSync;
                typeName = config[type];
                tuning.saveMod(vehicle, typeName, index);
                syncMods.includes(type.toString()) ? tuning.syncMod(vehicle, type.toString(), index) :
                    vehicle.setMod(type, index);
                player.call('tuning.buy.ans', [0, typeName, index]);
                tuning.removeProducts(customsId, products);
                tuning.updateCashbox(customsId, price);
                if (typeName = 'engineType') {
                    tuning.initBoost(vehicle);
                    player.call('vehicles.engine.updated');
                }
            } else {
                player.call('tuning.buy.ans', [4]);
            }
        }, `Покупка тюнинга т/с ${vehicle.properties.name} в LSC (type #${type} | index #${index})`);

    },
    "tuning.repair": (player) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.repair.ans', [2]);

        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.repair.ans', [3]);

        let customsId = player.currentCustomsId;
        if (customsId == null) return;

        let defaultPrice = tuning.getPriceConfig().repair;
        let products = tuning.calculateProductsNeeded(defaultPrice);
        let price = parseInt(defaultPrice * tuning.getPriceMultiplier(customsId));

        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.repair.ans', [5]);

        if (player.character.cash < price) return player.call('tuning.repair.ans', [1]);

        money.removeCash(player, price, function (result) {
            if (result) {
                player.vehicle.repair();
                player.call('tuning.repair.ans', [0]);
                tuning.removeProducts(customsId, products);
                tuning.updateCashbox(customsId, price);
            } else {
                player.call('tuning.repair.ans', [4]);
            }
        }, `Ремонт т/с ${vehicle.properties.name} в LSC`);
    },
    "characterInit.done": (player) => {
        player.call('vehicles.powerConfig.init', [tuning.powerMultipliers]);
        player.call('vehicles.brakeConfig.init', [tuning.brakeMultipliers]);
    }
}
