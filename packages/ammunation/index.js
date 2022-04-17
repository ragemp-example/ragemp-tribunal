let shops;
let bizes;
let weapons;

module.exports = {
    business: {
        type: 5,
        name: "Магазин оружия",
        productName: "Боеприпасы",
    },
    rentPerDayMultiplier: 0.01,
    minPriceMultiplier: 1.0,
    maxPriceMultiplier: 2.0,
    productPrice: 10,
    ammoProducts: 1,
    weaponsConfig: {
        1: {
            name: 'Combat Pistol',
            itemId: 20,
            gameId: 'weapon_combatpistol',
            products: 95,
            type: 'pistols'
        },
        2: {
            name: 'SMG',
            itemId: 48,
            gameId: 'weapon_smg',
            products: 260,
            type: 'rifles'
        },
        3: {
            name: 'Pump Shotgun',
            itemId: 21,
            gameId: 'weapon_pumpshotgun',
            products: 270,
            type: 'shotguns'
        },
        4: {
            name: 'Carbine Rifle',
            itemId: 22,
            gameId: 'weapon_carbinerifle',
            products: 320,
            type: 'rifles'
        },
        // 5: {
        //     name: 'Micro SMG',
        //     itemId: 47,
        //     gameId: 'weapon_microsmg',
        //     products: 235,
        //     type: 'rifles'
        // },
        6: {
            name: 'Machine Pistol',
            itemId: 89,
            gameId: 'weapon_machinepistol',
            products: 245,
            type: 'pistols'
        },
        7: {
            name: 'Compact Rifle',
            itemId: 52,
            gameId: 'weapon_compactrifle',
            products: 305,
            type: 'rifles'
        },
        9: {
            name: 'Carbine Rifle Mk II',
            itemId: 99,
            gameId: 'weapon_carbinerifle_mk2',
            products: 355
        },
        // 10: {
        //     name: 'Combat PDW',
        //     itemId: 88,
        //     gameId: 'weapon_combatpdw',
        //     products: 355,
        //     type: 'rifles'
        // },
        11: {
            name: 'Pump Shotgun Mk II',
            itemId: 91,
            gameId: 'weapon_pumpshotgun_mk2',
            products: 290,
            type: 'shotguns'
        },
        12: {
            name: 'Heavy Pistol',
            itemId: 80,
            gameId: 'weapon_heavypistol',
            products: 175,
            type: 'pistols'
        },
        13: {
            name: 'Advanced Rifle',
            itemId: 100,
            gameId: 'weapon_advancedrifle',
            products: 390,
            type: 'rifles'
        },
        14: {
            name: 'Assault SMG',
            itemId: 87,
            gameId: 'weapon_assaultsmg',
            products: 375,
            type: 'rifles'
        },
        15: {
            name: 'Серый',
            itemId: 3,
            texture: 0,
            products: 100,
            type: 'armour'
        },
        16: {
            name: 'Черный',
            itemId: 3,
            texture: 1,
            products: 200,
            type: 'armour'
        },
        17: {
            name: 'Зеленый',
            itemId: 3,
            texture: 2,
            products: 200,
            type: 'armour'
        },
        18: {
            name: 'Камуфляжный',
            itemId: 3,
            texture: 3,
            products: 200,
            type: 'armour'
        },
    },
    async init() {
        bizes = call('bizes');
        weapons = call('weapons');
        await this.loadAmmunationsFromDB();

        for (let key in this.weaponsConfig) {
            let gun = this.weaponsConfig[key];
            gun.caliber = weapons.getAmmoTypeByItemId(gun.itemId);
        }
    },
    async loadAmmunationsFromDB() {
        shops = await db.Models.Ammunation.findAll();
        for (var i = 0; i < shops.length; i++) {
            this.createAmmunation(shops[i]);
        }
        console.log(`[AMMUNATION] Загружено магазинов оружия: ${i}`);
    },
    createAmmunation(shop) {
        mp.blips.new(110, new mp.Vector3(shop.x, shop.y, shop.z),
            {
                name: 'Магазин оружия',
                color: 0,
                shortRange: true,
            });
        
        mp.markers.new(1, new mp.Vector3(shop.x, shop.y, shop.z), 0.8,
        {
            color: [232, 46, 46, 128],
            visible: true,
            dimension: 0
        });

        let shape = mp.colshapes.newSphere(shop.x, shop.y, shop.z, 1.8);
        shape.isAmmunation = true;
        shape.ammunationId = shop.id;
    },
    getRawShopData(id) {
        let shop = shops.find(x => x.id == id);
        return {
            priceMultiplier: shop.priceMultiplier,
            productPrice: this.productPrice,
            ammoProducts: this.ammoProducts
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
    getWeaponsConfig() {
        return this.weaponsConfig;
    }
}