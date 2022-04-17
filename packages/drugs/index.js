let notify;
let money;
let inventory;
let utils;
let factions;

const dealer = {
    x: -1451.723022,
    y: -647.001708,
    z: 29.638513,
    marker: {
        x: -1452.050781,
        y: -646.211425,
        z: 28.638513,
        color: [255, 255, 125, 200]
    }
};

const sellPoint = {
    x: 2443.212402,
    y: 4975.077636,
    z: 46.810592,
};

const DRUG_ID = 149;

module.exports = {
    coordinates: [],
    coordinatePrice: 100,
    drugsPricePerKg: 5000,
    resourcesPerGr: 1,
    minDrugsWeight: 0.1,
    maxDrugsWeight: 0.7,
    // Наркопритон
    drugsStash: null,
    drugsStashLabel: null,

    async init() {
        notify = call('notifications');
        money = call('money');
        inventory = call('inventory');
        utils = call('utils');
        factions = call('factions');

        await this.loadCoordinatesFromDB();
        await this.loadDrugsStashFromDB();
        this.createBlip();
        this.createColshape();
        this.createMarker();

        this.createSellBlip();
        this.createSellColshape();
        this.createSellMarker();

        inited(__dirname);
    },
    async loadCoordinatesFromDB() {
        this.coordinates = await db.Models.DrugsCoordinates.findAll();
        console.log('[DRUGS] Загружено точек закладок:', this.coordinates.length);
    },
    async loadDrugsStashFromDB() {
        this.drugsStash = await db.Models.DrugsStash.findOne({ where: { id: 1 } });
    },
    async createCoordinate(player) {
        const {x, y, z} = player.position;
        const coordinate = await db.Models.DrugsCoordinates.create({x, y, z});
        this.coordinates.push(coordinate);
    },
    async destroyCoordinate(player) {
        let index = this.coordinates.findIndex(c => player.dist(new mp.Vector3(c.x, c.y, c.z)) <= 10);
        if (index === -1) return false;
        await this.coordinates[index].destroy();
        this.coordinates.splice(index, 1);
        return true;
    },
    createBlip() {
        mp.blips.new(496, new mp.Vector3(dealer.x, dealer.y, dealer.z),
            {
                name: `Наркотики`,
                shortRange: true,
                color: 69
            });
    },
    createSellBlip() {
        mp.blips.new(501, new mp.Vector3(sellPoint.x, sellPoint.y, sellPoint.z),
            {
                name: `Сбыт наркотиков`,
                shortRange: true,
                color: 69
            });
    },
    createColshape() {
        const shape = mp.colshapes.newSphere(dealer.marker.x, dealer.marker.y, dealer.marker.z + 1, 1.2);
        shape.pos = new mp.Vector3(dealer.marker.x, dealer.marker.y, dealer.marker.z);
        shape.isDrugsCoordinates = true;
    },
    createSellColshape() {
        const shape = mp.colshapes.newSphere(sellPoint.x, sellPoint.y, sellPoint.z, 1.2);
        shape.pos = new mp.Vector3(sellPoint.x, sellPoint.y, sellPoint.z - 1);
        shape.isDrugsSell = true;
    },
    createMarker() {
        mp.markers.new(1, new mp.Vector3(dealer.marker.x, dealer.marker.y, dealer.marker.z), 0.4,
            {
                direction: new mp.Vector3(dealer.marker.x, dealer.marker.y, dealer.marker.z),
                rotation: 0,
                color: dealer.marker.color,
                visible: true,
                dimension: 0
            });
    },
    createSellMarker() {
        const marker = mp.markers.new(1, new mp.Vector3(sellPoint.x, sellPoint.y, sellPoint.z - 1), 0.4,
            {
                direction: new mp.Vector3(sellPoint.x, sellPoint.y, sellPoint.z - 1),
                rotation: 0,
                color: dealer.marker.color,
                visible: true,
                dimension: 0
            });

        this.drugsStashLabel = mp.labels.new('',
            new mp.Vector3(sellPoint.x, sellPoint.y, sellPoint.z), {
                los: false,
                font: 0,
                drawDistance: 10,
                dimension: marker.dimension
            });

        this.drugsStashLabelUpdate();
    },
    buyCoordinate(player) {
        if (factions.isStateFaction(player.character.factionId)) return player.call('drugs.coordinates.buy.ans', [5]);
        if (this.coordinates.length === 0) return player.call('drugs.coordinates.buy.ans', [4]);
        if (player.character.cash < this.coordinatePrice) return player.call('drugs.coordinates.buy.ans', [2]);
        if (player.drugsCheckpoint) return player.call('drugs.coordinates.buy.ans', [3]);

        money.removeCash(player, this.coordinatePrice, (result) => {
            if (result) {
                if (player.drugsCheckpoint) return;
                this.createCheckpoint(player);
                notify.info(player, 'Точка с местоположением наркотиков отмечена в GPS');
                player.call('drugs.coordinates.buy.ans', [1]);
            } else {
                player.call('drugs.coordinates.buy.ans', [0]);
            }
        }, `Buy drugs coordinate by player with id ${player.id}`);
    },
    createCheckpoint(player) {
        if (player.drugsCheckpoint) return;
        const index = utils.randomInteger(0, this.coordinates.length - 1);
        const checkpoint = this.coordinates[index];
        player.drugsCheckpoint = true;
        player.call('drugs.checkpoint.add', [checkpoint]);
    },
    onEnterCheckpoint(player) {
        const weight = parseFloat((this.minDrugsWeight + Math.random() * (this.maxDrugsWeight - this.minDrugsWeight)).toFixed(2));
        inventory.addItem(player, DRUG_ID, {weight: weight}, e => {
            if (e) return notify.error(player, e, 'Ошибка');
            player.drugsCheckpoint = false;
            notify.success(player, 'Вы подобрали груз. Теперь вы можете продать его в наркопритоне.');
        })
    },
    sellDrugs(player) {
        if (factions.isStateFaction(player.character.factionId)) return player.call('drugs.sell.ans', [3]);
        const playerDrugs = inventory.getArrayByItemId(player, DRUG_ID);
        if (!playerDrugs || playerDrugs.length === 0) return player.call('drugs.sell.ans', [2]);

        let totalSum = 0;
        let totalWeight = 0;
        playerDrugs.forEach(drug => {
            const weight = inventory.getParam(drug, 'weight').value;
            totalSum += weight * this.drugsPricePerKg;
            totalWeight += weight;
        });

        money.addCash(player, parseInt(totalSum), async (result) => {
            if (!result) return player.call('drugs.sell.ans', [0]);

            playerDrugs.forEach(drug => inventory.deleteItem(player, drug.id));
            player.call('drugs.sell.ans', [1]);
            notify.success(player, `Вы продали ${totalWeight} кг наркотиков на $${parseInt(totalSum)}`);
            const countResources = Math.clamp(totalWeight * 1000 * this.resourcesPerGr + this.drugsStash.resources, 0, this.drugsStash.resourcesMax);
            await this.setDrugsStashResources(countResources);
            this.drugsStashLabelUpdate();
        }, `Продажа нарко в накопритоне`);
    },
    async setDrugsStashResources(count) {
        this.drugsStash.resources = parseInt(count);
        await this.drugsStash.save();
    },
    drugsStashLabelUpdate() {
        this.drugsStashLabel.text = `\n~b~Ресурсы:\n~w~${this.drugsStash.resources} из ${this.drugsStash.resourcesMax}`
    }
};