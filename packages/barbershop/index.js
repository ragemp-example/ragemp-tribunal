let bizes;

let shops;

module.exports = {
    business: {
        type: 6,
        name: "Парикмахерская",
        productName: "Ресурсы",
    },
    rentPerDayMultiplier: 0.01,
    minPriceMultiplier: 1.0,
    maxPriceMultiplier: 2.0,
    productPrice: 20,
    hairstyleProducts: 10,
    facialHairProducts: 7,
    colorChangeProducts: 5,
    finalProductsMultiplier: 0.8,
    async init() {
        bizes = call('bizes');
        await this.loadBarbershopsFromDB();
    },
    async loadBarbershopsFromDB() {
        shops = await db.Models.Barbershop.findAll();
        for (var i = 0; i < shops.length; i++) {
            this.createBarbershop(shops[i]);
        }
        console.log(`[BARBERSHOP] Загружено парикмахерских: ${i}`);
    },
    createBarbershop(shop) {
        mp.blips.new(71, new mp.Vector3(shop.x, shop.y, shop.z),
            {
                name: 'Парикмахерская',
                color: 0,
                shortRange: true,
            });
        let shape = mp.colshapes.newSphere(shop.x, shop.y, shop.z, 4);

        shape.isBarbershop = true;
        shape.barbershopId = shop.id;
    },
    getRawBarbershopData(shopId) {
        let shop = shops.find(x => x.id == shopId);

        let data = {
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
            bType: shop.bType
        }
        return data;
    },
    getBarbershopData(shopId) {
        return shops.find(x => x.id == shopId);
    },
    getBizParamsById(id) {
        let shop = shops.find(x => x.bizId == id);
        if (!shop) return;
        let params = [
            {
                key: 'priceMultiplier',
                name: 'Наценка на услуги',
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
    }
}