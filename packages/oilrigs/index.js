"use strict";

let timer;
let bizes;
let notify;
let carrier;
let utils;

module.exports = {
    business: {
        type: 11,
        name: "Нефтевышка",
        productName: "Ресурсы",
    },
    productPrice: 50,
    rentPerDayMultiplier: 0.01,
    // список нефтевышек
    rigs: [],
    // минимальная цена за баррель
    minOilPrice: 60,
    // максимальная цена за баррель
    maxOilPrice: 100,
    // интервал пополнения 1 барреля
    storageUpdateTime: 1000,
    // сколько ресурсов тратится при производстве 1 барреля
    productsPerBarrel: 1,
    priceOffset: 5,
    currentSellPrice: 123,
    sellPos: new mp.Vector3(2832.228759765625, 1661.8287353515625, 24.58161354064941 - 1),
    sellStats: {
      lastHour: 0,
      currentHour: 0
    },
    skill: 0.1,
    async init() {
        timer = call('timer');
        bizes = call('bizes');
        notify = call('notifications');
        carrier = call('carrier');
        utils = call('utils');

        await this.loadRigsFromDB();

        inited(__dirname);
    },
    async loadRigsFromDB() {
        const rigsFromDB = await db.Models.OilRig.findAll();

        // удаляем вышки без бизнеса
        rigsFromDB
            .filter(r => r.bizId == null)
            .forEach(async r => r.destroy());

        rigsFromDB
            .filter(rig => rig.bizId != null)
            .forEach(rig => {
                this.rigs.push({info: rig});
                this.loadRig(rig);
            });
    },
    initBizBlips() {
        this.rigs.forEach(rig => {
            const biz = bizes.getBizById(rig.info.bizId);
            if (!biz) return;
            rig.blipBiz = mp.blips.new(683, new mp.Vector3(biz.info.x, biz.info.y, biz.info.z),
            {
                name: "Нефтевышка",
                shortRange: true,
                color: 29,
                scale: 1
            });
        });
    },
    loadRig(dbInfo) {
        const rig = this.getRigById(dbInfo.id);

        const shape = mp.colshapes.newSphere(dbInfo.x, dbInfo.y, dbInfo.z, 4);
        shape.onEnter = (player) => {
            let veh = player.vehicle;
            if (!veh || veh.key !== "job" || veh.owner !== 4
                || !carrier.isOilTanker(veh)) return notify.warning(player, 'Чтобы закупить нефть, вы должны находиться в нефтевозе');
            player.currentOilRigId = dbInfo.id;
            player.call('selectMenu.show', [`oilRigBuy`]);
        };

        shape.onExit = (player) => {
            player.call('selectMenu.hide');
            player.currentOilRigId = null;
        };

        rig.shape = shape;

        rig.marker = mp.markers.new(1, new mp.Vector3(dbInfo.x, dbInfo.y, dbInfo.z - 2), 2.5, {
            color: [255, 159, 15, 128],
            visible: true,
            dimension: 0
        });

        rig.blip = mp.blips.new(683, new mp.Vector3(dbInfo.x, dbInfo.y, dbInfo.z),
        {
            name: "Покупка нефти",
            shortRange: true,
            scale: 0.7
        });

        rig.label = mp.labels.new(``, new mp.Vector3(dbInfo.x, dbInfo.y, dbInfo.z + 1), {
            los: false,
            font: 0,
            drawDistance: 15,
        });
        this.updateLabel(dbInfo.id);

        if (dbInfo.isActive) this.startWork(dbInfo.id);
        const biz = bizes.getBizById(dbInfo.bizId);
        if (!biz) return;
        rig.blipBiz = mp.blips.new(683, new mp.Vector3(biz.info.x, biz.info.y, biz.info.z),
        {
            name: "Нефтевышка",
            shortRange: true,
            scale: 1
        });
    },
    async createRig(player, id, price) {
        const pos = player.position;
        const rig = this.getRigById(id);
        if (!rig) return notify.error(player, 'Вышка с таким id не найдена');
        if (rig.info.bizId) return notify.error(player, 'Вышка уже привязаны к бизнесу');

        rig.info.bizId = await bizes.createBiz(`Нефтевышка #${id}`, price, 11, pos);
        await rig.info.save();
        this.loadRig(rig.info);
        notify.success(player, 'Бизнес добавлен');
    },
    async createRigStorage(player) {
        const { position } = player;

        const dbInfo = await db.Models.OilRig.create({
            x: position.x,
            y: position.y,
            z: position.z
        });

        this.rigs.push({ info: dbInfo });
        notify.info(player, `База нефтевышки #${dbInfo.id} добавлена. Добавьте точку бизнеса командой /createrig`);
    },
    startWork(id) {
        const rig = this.getRigById(id);
        if (!rig) return;
        rig.workInterval = timer.addInterval(async () => {
            if (this.getProductsAmount(id) < this.productsPerBarrel) return;
            if (rig.info.oil === rig.info.oilMax) return;
            await this.updateOilRig(id, +1);
            this.removeProducts(id, this.productsPerBarrel);
            this.updateLabel(id);
        }, this.storageUpdateTime);
    },
    stopWork(id) {
        const rig = this.getRigById(id);
        if (!rig) return;
        if (!rig.workInterval) return;

        timer.remove(rig.workInterval);
        rig.workInterval = null;
    },
    async updateOilRig(id, value) {
        const rig = this.getRigById(id);
        if (!rig) return;
        rig.info.oil = Math.clamp(rig.info.oil + value, 0, rig.info.oilMax);
        await rig.info.save();
    },
    getRigById(id) {
        return this.rigs.find(rig => rig.info.id === id);
    },
    getRigByBizId(bizId) {
        return this.rigs.find(rig => rig.info.bizId === bizId);
    },
    async toggleWork(player) {
        const biz = bizes.getBizByPlayerPos(player);
        if (!biz) return;
        if (biz.info.type !== 11) return;

        const rig = this.getRigByBizId(biz.info.id);
        if (!rig) return;

        rig.info.isActive = !rig.info.isActive;
        await rig.info.save();

        if (rig.info.isActive) {
            this.startWork(rig.info.id)
            notify.success(player, 'Вы запустили добычу нефти');
        } else {
            this.stopWork(rig.info.id);
            notify.warning(player, 'Вы приостановили добычу нефти');
        }
    },
    getBizParamsById(id) {
        let rig = this.getRigByBizId(id);
        if (!rig) return;
        return [
            {
                key: 'oilPrice',
                name: 'Цена барреля нефти',
                max: this.maxOilPrice,
                min: this.minOilPrice,
                current: rig.info.oilPrice,
                isInteger: true
            }
        ];
    },
    setBizParam(id, key, value) {
        const rig = this.getRigByBizId(id);
        if (!rig) return;
        rig.info[key] = value;
        rig.info.save();
        if (key === 'oilPrice') this.updateLabel(rig.info.id);
    },
    getProductsAmount(id) {
        const rig = this.getRigById(id);
        return bizes.getProductsAmount(rig.info.bizId);
    },
    removeProducts(id, products) {
        const rig = this.getRigById(id);
        bizes.removeProducts(rig.info.bizId, products);
    },
    updateCashbox(id, money) {
        let rig = this.rigs.find(r => r.info.id === id);
        bizes.bizUpdateCashBox(rig.info.bizId, money);
    },
    updateLabel(id) {
        const rig = this.getRigById(id);
        if (!rig) return;

        rig.label.text = `~y~Нефтевышка #${id}\n~g~$${rig.info.oilPrice} ~w~за баррель\n~o~${rig.info.oil}/${rig.info.oilMax} ~w~баррелей`;
    },
    updateSellLabel() {
        let label = mp.labels.toArray().find(x => x.isOilSell);
        label.text = `~y~Сбыт нефти\n~g~$${this.currentSellPrice} ~w~за баррель`;
    },
    createSellMarker() {
        let pos = this.sellPos;
        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 7.5);

        colshape.onEnter = (player) => {
            let veh = player.vehicle;
            if (!veh || veh.key !== "job" || veh.owner !== 4
                || !carrier.isOilTanker(veh)) return notify.warning(player, 'Чтобы продать нефть, вы должны находиться в нефтевозе');
            player.isInOilSell = true;
            player.call('selectMenu.show', [`oilSell`]);
        }

        colshape.onExit = (player) => {
            player.call('selectMenu.hide');
            player.isInOilSell = false;
        }

        mp.blips.new(683, pos, {
            color: 10,
            name: `Сбыт нефти`,
            shortRange: 10,
            scale: 1
        });

        mp.markers.new(1, pos, 8, {
            color: [235, 128, 52, 70]
        });

        let label = mp.labels.new(``, new mp.Vector3(pos.x, pos.y, pos.z + 2.5), {
            los: false,
            font: 0,
            drawDistance: 20,
        });
        label.isOilSell = true;
        this.updateSellLabel();
    },
    initSellPrice() {
        this.currentSellPrice = Math.floor((this.minOilPrice + this.maxOilPrice + 2*this.priceOffset) / 2 + this.getRandomOffset());
        console.log(`[OILRIGS] Устeановлена цена продажи нефти - $${this.currentSellPrice}`);
    },
    updateSellPrice() {
        let stats = this.sellStats;
        let currentPrice = this.currentSellPrice;
        let minPrice = this.minOilPrice + this.priceOffset;
        let maxPrice = this.maxOilPrice + this.priceOffset;
        if (stats.currentHour > stats.lastHour) {
            this.currentSellPrice = Math.clamp(currentPrice - this.priceOffset - this.getRandomOffset(), minPrice, maxPrice);
        } else {
            this.currentSellPrice = Math.clamp(currentPrice + this.priceOffset + this.getRandomOffset(), minPrice, maxPrice);
        }
        console.log(`[OILRIGS] За этот час продано ${stats.currentHour} бар. нефти (за прошлый - ${stats.lastHour} бар.), новая цена - $${this.currentSellPrice}`);
        stats.lastHour = stats.currentHour;
        stats.currentHour = 0;
        this.updateSellLabel();
    },
    getRandomOffset() {
        return utils.randomInteger(0, 3);
    }
};