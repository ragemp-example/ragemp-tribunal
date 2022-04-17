const fs = require('fs');
let bizes;

let parseData = {};
let tattooList;

module.exports = {
    business: {
        type: 8,
        name: "Тату-салон",
        productName: "Материалы",
    },
    rentPerDayMultiplier: 0.01,
    minPriceMultiplier: 1.0,
    maxPriceMultiplier: 2.0,
    productPrice: 20,
    deleteTattooProducts: 20,
    async init() {
        bizes = call('bizes');
        await this.loadShopsFromDB();
        await this.loadTattoosFromDB();
        this.getRawTattooList();
    },
    parseTattoos() {
        fs.readdirSync("packages/tattoo/data/").forEach(file => {
            let collection = file.slice(0, file.length - 5);
            let data = require(`./data/${file}`);
            data.forEach((current) => {
                db.Models.Tattoo.create({
                    collection: collection,
                    name: current.Name,
                    hashNameMale: current.HashNameMale,
                    hashNameFemale: current.HashNameFemale,
                    zoneId: current.ZoneID,
                    price: current.Price
                });
            });
        });
    },
    async loadCharacterTattoos(player) {
        if (!player.character) return;
        let tattoos = await db.Models.CharacterTattoo.findAll({
            where: {
                characterId: player.character.id
            }
        });
        player.character.tattoos = tattoos;
        console.log(`[TATTOO] Для персонажа ${player.character.name} загружено ${tattoos.length} татуировок`);
    },
    setCharacterTattoos(player) {
        let tattoos = player.character.tattoos;
        tattoos.forEach((current) => {
            player.setDecoration(mp.joaat(current.collection), mp.joaat(current.hashName));
        });
    },
    async addCharacterTattoo(player, collection, hashName, zoneId, name) {
        if (!player.character) return;
        let tattoo = await db.Models.CharacterTattoo.create({
            characterId: player.character.id,
            name: name,
            collection: collection,
            hashName: hashName,
            zoneId: zoneId
        });
        player.character.tattoos.push(tattoo);
        player.setDecoration(mp.joaat(collection), mp.joaat(hashName));
        this.sendTattoosDataToClient(player, [tattoo]);
    },
    removeCharacterTattoo(player, tattooId) {
        if (!player.character) return;
        let tattoos = player.character.tattoos;
        let index = tattoos.findIndex(x => x.id == tattooId);
        let tat = tattoos[index];
        if (!tat) return;
        tat.destroy();
        tattoos.splice(index, 1);
        player.clearDecorations();
        this.setCharacterTattoos(player);
        //this.removeTattooFromClient(player, tattooId);
    },
    async loadTattoosFromDB() {
        tattooList = await db.Models.Tattoo.findAll();
        console.log(`[TATTOO] Загружено татуировок: ${tattooList.length}`);
    },
    async loadShopsFromDB() {
        shops = await db.Models.TattooParlor.findAll();
        for (var i = 0; i < shops.length; i++) {
            this.createShop(shops[i]);
        }
        console.log(`[TATTOO] Загружено тату-салонов: ${i}`);
    },
    createShop(shop) {
        mp.blips.new(75, new mp.Vector3(shop.x, shop.y, shop.z),
            {
                name: 'Тату-салон',
                color: 0,
                shortRange: true,
            });

        mp.markers.new(1, new mp.Vector3(shop.x, shop.y, shop.z - 0.05), 0.8,
            {
                color: [255, 104, 59, 200],
                visible: true,
                dimension: 0
            });

        let shape = mp.colshapes.newSphere(shop.x, shop.y, shop.z, 1.6);
        shape.isTattooParlor = true;
        shape.tattooParlorId = shop.id;
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
            priceMultiplier: shop.priceMultiplier
        }
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
    },
    getRawTattooList() {
        return tattooList.map(current => current.dataValues);
    },
    sendTattoosDataToClient(player, tattoos) {
        let data = tattoos.map(current => current.dataValues);
        player.call('tattoo.characterTattoos.add', [data]);
    },
    removeTattooFromClient(player, tattooId) {
        player.call('tattoo.characterTattoos.remove', [tattooId]);
    },
    calculateProductsNeeded(price) {
        let products = parseInt(price * 0.8 / this.productPrice);
        return products;
    }
}