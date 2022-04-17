let shops;
let bizes;

module.exports = {
    business: {
        type: 1,
        name: "Супермаркет",
        productName: "Продукты",
    },
    rentPerDayMultiplier: 0.01,
    minPriceMultiplier: 1.0,
    maxPriceMultiplier: 2.0,
    productPrice: 10,
    items: {
        "products": [
            {
                id: 34,
                name: 'Вода',
                description: 'Прекрасно утоляет жажду.',
                products: 2
            },
            {
                id: 130,
                name: 'Кола',
                description: 'Газированный напиток, который утоляет жажду и немного голод.',
                products: 4
            },
            {
                id: 35,
                name: 'Плитка шоколада',
                description: 'Молочный шоколад.',
                products: 1
            },
            {
                id: 129,
                name: 'Чипсы',
                description: 'Картофельные чипсы.',
                products: 4
            },
            {
                id: 126,
                name: 'Гамбургер',
                description: 'Гамбургер с котлетой из говядины.',
                products: 6
            },
            {
                id: 127,
                name: 'Хотдог',
                description: 'Вкусный хотдог с охотничьей колбаской.',
                products: 6
            },

        ],
        "other": [
            {
                id: 56,
                name: 'Канистра',
                description: 'Канистрой можно заправлять автомобили. Она пополняется на АЗС.',
                products: 10
            },
            {
                id: 13,
                name: 'Сумка',
                description: 'Сумка для переноса предметов.',
                products: 30
            },
            {
                id: 55,
                name: 'Мешок',
                description: 'Этот мешок можно надеть кому-нибудь на голову.',
                products: 7
            },
            {
                id: 54,
                name: 'Веревка',
                description: 'Ей можно связывать предметы.',
                products: 5
            },
            {
                id: 146,
                name: 'Ремкомплект',
                description: 'Позволяет отремонтировать транспортное средство.',
                products: 10
            },
        ]
    },
    async init() {
        bizes = call('bizes');
        await this.loadSupermarketsFromDB();
    },
    async loadSupermarketsFromDB() {
        shops = await db.Models.Supermarket.findAll();
        for (var i = 0; i < shops.length; i++) {
            this.createSupermarket(shops[i]);
        }
        console.log(`[SUPERMARKET] Загружено супермаркетов: ${i}`);
    },
    createSupermarket(shop) {
        mp.blips.new(52, new mp.Vector3(shop.x, shop.y, shop.z),
            {
                name: 'Супермаркет',
                color: 0,
                shortRange: true,
            });

        mp.markers.new(1, new mp.Vector3(shop.x, shop.y, shop.z - 0.1), 0.8,
            {
                color: shop.bType ? [69, 140, 255, 128] : [50, 168, 82, 128],
                visible: true,
                dimension: 0
            });

        let shape = mp.colshapes.newSphere(shop.x, shop.y, shop.z, 1.8);
        shape.isSupermarket = true;
        shape.supermarketId = shop.id;
    },
    getRawShopData(id) {
        let shop = shops.find(x => x.id == id);
        return {
            bType: shop.bType,
            priceMultiplier: shop.priceMultiplier,
            productPrice: this.productPrice,
            items: this.items
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
    getItemById(id) {
        let item = null;
        for (let key in this.items) {
            item = this.items[key].find(x => x.id == id);
            if (item) return item;
        }
    }
}
