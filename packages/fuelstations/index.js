"use strict";

let dbFuelStations;
let bizes;

module.exports = {
    business: {
        type: 0,
        name: "АЗС",
        productName: "Топливо",
    },
    productPrice: 1,
    rentPerDayMultiplier: 0.01,
    minFuelPrice: 1,
    maxFuelPrice: 8,
    async init() {
        bizes = call('bizes');
        await this.loadFuelStationsFromDB();
    },
    async loadFuelStationsFromDB() {
        dbFuelStations = await db.Models.FuelStation.findAll();

        for (var i = 0; i < dbFuelStations.length; i++) {
            this.createFuelStation(dbFuelStations[i]);
        }
        console.log(`[FUELSTATIONS] Загружено АЗС: ${i}`);
    },
    createFuelStation(station) {
        mp.blips.new(361, new mp.Vector3(station.x, station.y, station.z),
            {
                name: "Заправка",
                shortRange: true,
            });

        let shape = mp.colshapes.newSphere(station.x, station.y, station.z, 10);
        shape.isFuelStation = true;
        shape.fuelStationId = station.id;

        let label = mp.labels.new(`~y~${station.name}\n~g~$${station.fuelPrice} ~w~за литр\nНажмите ~b~E~w~`, new mp.Vector3(station.x, station.y, station.z),
            {
                los: false,
                font: 0,
                drawDistance: 20,
            });
        label.isFuelStation = true;
        label.fuelStationId = station.id;
    },
    parseFuelStations() {
        st.forEach((current) => {
            db.Models.FuelStation.create({
                name: current.name,
                x: current.pos[0],
                y: current.pos[1],
                z: current.pos[2]
            });
        });
    },
    setFuelPrice(id, price) {
        for (let i = 0; i < dbFuelStations.length; i++) {
            if (dbFuelStations[i].id == id) {
                dbFuelStations[i].fuelPrice = price;
                dbFuelStations[i].save();
                this.updateLabel(id);
                return;
            }
        }
        throw new Error('АЗС не найдена');
    },
    updateLabel(id) {
        mp.labels.forEach((current) => {
            if (current.isFuelStation && current.fuelStationId == id) {
                let station = this.getFuelStationById(id);
                current.text = `~y~${station.name}\n~g~$${station.fuelPrice} ~w~за литр\nНажмите ~b~E~w~`;
            }
        });
    },
    getFuelStationById(id) {
        for (let i = 0; i < dbFuelStations.length; i++) {
            if (dbFuelStations[i].id == id) {
                return dbFuelStations[i]
            }
        }
        return null;
    },
    getBizParamsById(id) {
        let station = dbFuelStations.find(x => x.bizId == id);
        if (!station) return;
        return [
            {
                key: 'fuelPrice',
                name: 'Цена топлива',
                max: this.maxFuelPrice,
                min: this.minFuelPrice,
                current: station.fuelPrice,
                isInteger: true
            }
        ];
    },
    setBizParam(id, key, value) {
        let station = dbFuelStations.find(x => x.bizId == id);
        if (!station) return;
        station[key] = value;
        station.save();
        if (key == 'fuelPrice') this.updateLabel(station.id);
    },
    getProductsAmount(id) {
        let station = dbFuelStations.find(x => x.id == id);
        let bizId = station.bizId;
        let products = bizes.getProductsAmount(bizId);
        return products;
    },
    removeProducts(id, products) {
        let station = dbFuelStations.find(x => x.id == id);
        let bizId = station.bizId;
        bizes.removeProducts(bizId, products);
    },
    getFuelPriceById(id) {
        for (let i = 0; i < dbFuelStations.length; i++) {
            if (dbFuelStations[i].id == id) {
                return dbFuelStations[i].fuelPrice;
            }
        }
    },
    updateCashbox(id, money) {
        let station = dbFuelStations.find(x => x.id == id);
        let bizId = station.bizId;
        bizes.bizUpdateCashBox(bizId, money);
    }
}