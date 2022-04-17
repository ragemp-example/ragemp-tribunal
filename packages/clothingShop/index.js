let shops;
let bizes;

module.exports = {
    business: {
        type: 4,
        name: "Магазин одежды",
        productName: "Одежда",
    },
    rentPerDayMultiplier: 0.01,
    minPriceMultiplier: 1.0,
    maxPriceMultiplier: 2.0,
    productPrice: 20,
    itemIds: {
        "bracelets": 12,
        "ears": 10,
        "glasses": 1,
        "watches": 11,
        "ties": 2,
        "hats": 6,
        "tops": 7,
        "pants": 8,
        "shoes": 9,
    },
    async init() {
        bizes = call('bizes');
        await this.loadShopsFromDB();
    },
    async loadShopsFromDB() {
        shops = await db.Models.ClothingShop.findAll();
        for (var i = 0; i < shops.length; i++) {
            this.createShop(shops[i]);
        }
        console.log(`[CLOTHINGSHOP] Загружено магазинов одежды: ${i}`);
    },
    createShop(shop) {
        mp.blips.new(73, new mp.Vector3(shop.x, shop.y, shop.z),
            {
                name: 'Магазин одежды',
                color: 0,
                shortRange: true,
            });

        mp.markers.new(1, new mp.Vector3(shop.x, shop.y, shop.z - 0.05), 0.8,
            {
                color: [245, 167, 66, 200],
                visible: true,
                dimension: 0
            });

        let shape = mp.colshapes.newSphere(shop.x, shop.y, shop.z, 1.8);
        shape.isClothingShop = true;
        shape.clothingShopId = shop.id;
    },
    getRawShopData(id) {
        let shop = shops.find(x => x.id == id);
        return {
            pos: {
                x: shop.placeX,
                y: shop.placeY,
                z: shop.placeZ,
                h: shop.placeH
            },
            camera: {
                x: shop.cameraX,
                y: shop.cameraY,
                z: shop.cameraZ
            },
            bType: shop.bType,
            priceMultiplier: shop.priceMultiplier,
            class: shop.class
        }
    },
    getBizParamsById(id) {
        let shop = shops.find(x => x.bizId == id);
        if (!shop) return;
        let params = [
            {
                key: 'priceMultiplier',
                name: 'Наценка на товары',
                max: this.maxPriceMultiplier,
                min: this.minPriceMultiplier,
                current: shop.priceMultiplier
            }
        ]
        return params;
    },
    setBizParam(id, key, value) {
        let shop = shops.find(x => x.bizId == id);
        if (!shop) return;
        shop[key] = value;
        shop.save();
    },
    getProductsAmount(id) {
        let shop = shops.find(x => x.id == id);
        let bizId = shop.bizId;
        let products = bizes.getProductsAmount(bizId);
        return products;
    },
    removeProducts(id, products) {
        let shop = shops.find(x => x.id == id);
        let bizId = shop.bizId;
        bizes.removeProducts(bizId, products);
    },
    getPriceMultiplier(id) {
        let shop = shops.find(x => x.id == id);
        return shop.priceMultiplier;
    },
    updateCashbox(id, money) {
        let shop = shops.find(x => x.id == id);
        let bizId = shop.bizId;
        bizes.bizUpdateCashBox(bizId, money);
    },
    getProductsConfig() {
        return this.productsConfig;
    },
    getPriceConfig() {
        let priceConfig = {};
        for (let key in this.productsConfig) {
            priceConfig[key] = this.productsConfig[key] * this.productPrice;
        }
        return priceConfig;
    },
    calculateProductsNeeded(price) {
        let products = parseInt(price * 0.8 / this.productPrice);
        return products;
    }
}