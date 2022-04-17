let maskList;
let dbData;
let shop;
let bizes;

module.exports = {
    productPrice: 10,
    rentPerDayMultiplier: 0.01,
    minPriceMultiplier: 1.0,
    maxPriceMultiplier: 2.0,
    business: {
        type: 7,
        name: "Магазин масок",
        productName: "Маски",
    },
    async init() {
        bizes = call('bizes');
        await this.loadMaskShop();
        this.createMaskShop();
        this.loadMasksFromDB();
    },
    async loadMaskShop() {
        let data = await db.Models.MaskShop.findAll();
        dbData = data[0];
        if (!dbData) return;
        console.log(`[MASKSHOP] Магазин масок загружен`);
        shop = {
            x: dbData.x,
            y: dbData.y,
            z: dbData.z,
            fitting: {
                x: dbData.fittingX,
                y: dbData.fittingY,
                z: dbData.fittingZ,
                h: dbData.fittingH
            },
            camera: {
                x: dbData.cameraX,
                y: dbData.cameraY,
                z: dbData.cameraZ
            }
        }
    },
    createMaskShop() {
        if (!shop) return;
        mp.blips.new(362, new mp.Vector3(shop.x, shop.y, shop.z),
        {
            name: "Магазин масок",
            shortRange: true,
            color: 4
        });

        let shape = mp.colshapes.newSphere(shop.x, shop.y, shop.z, 2.5);

        shape.onEnter = (player) => {
            if (player.vehicle) return;
            player.call('masks.shop.shape', [true]);
            player.call('prompt.show', ['Нажмите <span>E</span> для того, чтобы посмотреть маски']);
        }

        shape.onExit = (player) => {
            player.call('masks.shop.shape', [false]);
            player.call('prompt.hide');
        }
    },
    async loadMasksFromDB() {
        maskList = await db.Models.Mask.findAll();
    },
    getMaskList() {
        return maskList;
    },
    getRawMaskList() {
        let list = [];
        maskList.forEach((current) => {
            if (!current.isAvailable) return;
            list.push({
                id: current.id,
                drawable: current.drawable,
                name: current.name,
                price: current.price
            })
        });
        return list;
    },
    getShopData() {
        return shop;
    },
    getBizParamsById(id) {
        let params = [
            {
                key: 'priceMultiplier',
                name: 'Наценка на услуги',
                max: this.maxPriceMultiplier,
                min: this.minPriceMultiplier,
                current: dbData.priceMultiplier
            }
        ];
        return params;
    },
    setBizParam(id, key, value) {
        dbData[key] = value;
        dbData.save();
    },
    getProductsAmount() {
        let bizId = dbData.bizId;
        let products = bizes.getProductsAmount(bizId);
        return products;
    },
    removeProducts(products) {
        let bizId = dbData.bizId;
        bizes.removeProducts(bizId, products);
    },
    getPriceMultiplier() {
        return dbData.priceMultiplier;
    },
    updateCashbox(money) {
        let bizId = dbData.bizId;
        bizes.bizUpdateCashBox(bizId, money);
    },
    calculateProductsNeeded(price) {
        let products = parseInt(price / this.productPrice);
        return products;
    }
}
