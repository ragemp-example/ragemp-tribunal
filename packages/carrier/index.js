"use strict";

let bizes = call('bizes');
let jobs = call('jobs');
let notifs = call('notifications');
let utils = call('utils');

module.exports = {
    // Место мониторинга складов бизнесов/ферм и заказа товара
    loadPos: new mp.Vector3(916.1118774414062, -1560.7391357421875, 30.748455047607422 - 13),
    // loadPos: new mp.Vector3(-77.97127532958984, -1784.080810546875, 28.418481826782227 - 1), // for tests
    // Место разгрузки урожая
    cropUnloadPos: new mp.Vector3(85.55198669433594, 6331.1318359375, 31.225765228271484 - 1),
    // Цена за 1 ед. товара/зерна
    productPrice: 4,
    // Вместимость грузовика
    productsMax: 500,
    // Вместимость нефтевоза
    barrelsMax: 50,
    // Доп. вместимость грузовика за 1% навыка
    skillProducts: 15,
    // Доп. вместимость нефтевоза за 1% навыка
    skillBarrels: 1,
    // Коэффициент при списании товара назад на склад (productPrice * productSellK)
    productSellK: 0.8,
    // Цена аренды грузовика
    vehPrice: 100,
    // Опыт за доставку товара
    exp: 0.05,
    // Заказы бизнесов
    bizOrders: [],
    // Цена урожая при продаже
    cropPrice: 11,
    // Модели авто и их типы товара
    vehModels: {
        "pounder": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },

    init() {
        this.createLoadMarker();
        this.createCropUnloadMarker();
    },
    createLoadMarker() {
        var pos = this.loadPos;
        var marker = mp.markers.new(1, pos, 15, {
            color: [255, 187, 0, 70]
        });
        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z + 9, 10);
        colshape.onEnter = (player) => {
            if (player.character.job != 4) return notifs.error(player, `Отказано в доступе`, `Склад`);
            player.call(`carrier.load.info.set`, [this.getLoadData()]);
            player.carrierLoad = marker;
        };
        colshape.onExit = (player) => {
            player.call(`selectMenu.hide`);
            delete player.carrierLoad;
        };
        marker.colshape = colshape;
        mp.blips.new(318, pos, {
            color: 71,
            name: `Грузоперевозка`,
            shortRange: 10,
            scale: 1
        });
    },
    createCropUnloadMarker() {
        var pos = this.cropUnloadPos;
        var marker = mp.markers.new(1, pos, 3, {
            color: [255, 187, 0, 70]
        });
        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z + 2, 2);
        colshape.onEnter = (player) => {
            if (player.character.job != 4) return notifs.error(player, `Отказано в доступе`, `Склад`);
            player.call(`carrier.cropUnload.info.set`, [this.getCropUnloadData()]);
            player.cropUnloadMarker = marker;
        };
        colshape.onExit = (player) => {
            player.call(`selectMenu.hide`);
            delete player.cropUnloadMarker;
        };
        marker.colshape = colshape;
        mp.blips.new(569, pos, {
            color: 1,
            name: `Урожай`,
            shortRange: 10,
            scale: 1
        });
    },
    getLoadData() {
        return {
            bizOrders: this.bizOrders,
            productPrice: this.productPrice,
            productSellK: this.productSellK,
        };
    },
    getCropUnloadData() {
        var data = {
            cropPrice: this.cropPrice
        };
        return data;
    },
    getProductsMax(player) {
        var skill = jobs.getJobSkill(player, 4);
        return parseInt(this.productsMax + skill.exp * this.skillProducts);
    },
    getBarrelsMax(player) {
        let skill = jobs.getJobSkill(player, 4);
        return Math.floor(this.barrelsMax + skill.exp * this.skillBarrels);
    },
    initBizOrders() {
        var list = bizes.getOrderBizes();
        list.forEach(biz => this.addBizOrder(biz));
    },
    getBizOrder(bizId) {
        return this.bizOrders.find(x => x.bizId == bizId);
    },
    addBizOrder(biz) {
        if (!biz.info.productsOrderPrice) return debug(`[CARRIER] addBizOrder: некорректная цена | ${biz.info}`);
        var vdistance = utils.vdist(this.loadPos, new mp.Vector3(biz.info.x, biz.info.y, biz.info.z));
        var order = {
            bizId: biz.info.id,
            bizName: biz.info.name,
            ownerName: biz.info.characterNick,
            prodName: bizes.getResourceName(biz.info.type),
            prodCount: biz.info.productsOrder,
            prodPrice: bizes.getResourcePrice(biz.info.type),
            orderPrice: biz.info.productsOrderPrice,
            distance: +Math.sqrt(vdistance).toFixed(1),
        };
        this.removeBizOrderByBizId(order.bizId);
        this.jobBroadcast(`Поступил заказ для бизнеса ${order.bizName}`);
        this.bizOrders.push(order);
    },
    removeBizOrderByBizId(bizId) {
        var list = this.bizOrders;
        for (var i = 0; i < list.length; i++) {
            var order = list[i];
            if (order.bizId != bizId) continue;
            list.splice(i, 1);
            i--;
        }
        // TODO: broadcast all carriers
    },
    removeBizOrder(order) {
        var list = this.bizOrders;
        var i = list.indexOf(order);
        if (i != -1) list.splice(i, 1);
        // TODO: broadcast all carriers
    },
    takeBizOrder(player, veh, order, count) {
        if (typeof order == 'number') order = this.getBizOrder(order);

        var pos = bizes.getBizPosition(order.bizId);

        if (count == order.prodCount) this.removeBizOrder(order);
        else {
            var price = parseInt(order.orderPrice * (count / order.prodCount));
            order.orderPrice -= price;
            order.prodCount -= count;
            order = Object.assign({}, order);
            order.orderPrice = price;
            order.prodCount = count;
        }

        veh.products = {
            bizOrder: order,
            playerId: player.id,
        };
        veh.setVariable("label", `${count} из ${this.getProductsMax(player)} ед.`);
        player.call("carrier.bizOrder.waypoint.set", [pos]);
        notifs.success(player, `Заказ принят`, order.bizName);
        this.jobBroadcast(`Взят заказ для бизнеса ${order.bizName}`);
        bizes.getOrder(order.bizId);
    },
    dropBizOrder(player) {
        mp.vehicles.forEach(veh => {
            if (!veh.db || veh.db.key != "job" || veh.db.owner != 4) return;
            if (!veh.products || !veh.products.bizOrder) return;
            if (veh.products.playerId != player.id) return;

            this.dropBizOrderByVeh(veh);
        });
    },
    dropBizOrderByVeh(veh) {
        if (!veh.db || veh.db.key != "job" || veh.db.owner != 4) return;
        if (!veh.products || !veh.products.bizOrder) return;

        var order = veh.products.bizOrder;

        // this.removeBizOrderByBizId(order.bizId);
        var oldOrder = this.getBizOrder(order.bizId);
        if (oldOrder) {
            oldOrder.orderPrice += order.orderPrice;
            oldOrder.prodCount += order.prodCount;
        } else this.bizOrders.push(order);

        delete veh.products;
        veh.setVariable("label", null);

        this.jobBroadcast(`Вернулся заказ для бизнеса ${order.bizName}`);
        bizes.dropOrder(order.bizId);
    },
    readyBizOrder(player, veh) {
        var order = veh.products.bizOrder;
        var biz = bizes.getBizById(order.bizId);

        var max = Math.max(biz.info.productsMaxCount - biz.info.productsCount, biz.info.productsOrder);
        var count = Math.clamp(order.prodCount, 1, max);

        bizes.readyOrder(order.bizId, count);

        delete veh.products;
        veh.setVariable("label", null);

        player.character.pay += order.orderPrice;
        player.character.save();

        jobs.addJobExp(player, this.exp);

        notifs.success(player, `Заказ выполнен (+$${order.orderPrice})`, order.bizName);
        player.call(`carrier.bizOrder.waypoint.set`);
    },
    jobBroadcast(text) {
        mp.players.forEach(rec => {
            if (!rec.character || rec.character.job != 4) return;

            notifs.info(rec, text, `Грузоперевозчики`);
        });
    },
    // получить арендованный грузовик игрока
    getVehByDriver(player) {
        return mp.vehicles.toArray().find(x => x.db && x.db.key == 'job' && x.db.owner == 4 && x.driver && x.driver.playerId == player.id && x.driver.characterId == player.character.id);
    },
    // получить игрока, который арендовал грузовик
    getDriverByVeh(veh) {
        if (!veh.driver) return;
        var d = veh.driver;
        return mp.players.toArray().find(x => x.character && x.id == d.playerId && x.character.id == d.characterId);
    },
    getProductsNameByVeh(veh) {
        if (!veh.products) return null;
        if (!veh.products.bizOrder) return veh.products.name;
        return veh.products.bizOrder.prodName;
    },
    // полностью очистить грузовик от товара и водителя
    clearVeh(veh) {
        var driver = this.getDriverByVeh(veh);
        if (driver) driver.call(`carrier.bizOrder.waypoint.set`);
        this.dropBizOrderByVeh(veh);
        delete veh.driver;
        if (veh.products) {
            delete veh.products;
            veh.setVariable("label", null);
        }
    },
    isCorrectProductType(vehModel, type) {
        if (!this.vehModels[vehModel]) return false;
        return this.vehModels[vehModel].includes(type);
    },
    isOilTanker(veh) {
        return veh.modelName === 'oiltanker';
    },
    updateOilTankerLabel(veh) {
        let { current, max } = veh.oil;
        veh.setVariable("label", `~y~${current} ~w~из ~o~${max} ~w~баррелей`);
    }
};
