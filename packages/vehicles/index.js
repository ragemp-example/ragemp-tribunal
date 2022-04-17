"use strict";

var dbVehicleProperties;
var plates = [];
let inventory = call('inventory');
let utils = call('utils');
let timer = call('timer');
let tuning = call('tuning');

const MAX_BREAK_LEVEL = 2;
const NO_BREAK_DAYS = 2;

let breakdownConfig = {
    engineState: 0.001,
    fuelState: 0.004,
    steeringState: 0.003,
    brakeState: 0.001
};

let houses;

// vehtypes:
// 0 - автомобиль
// 1 - мотоцикл
// 2 - велосипед
// 3 - электромобиль

module.exports = {
    // Время простоя авто, после которого оно будет заспавнено (ms) - точность ~0-5 мин
    vehWaitSpawn: 20 * 60 * 1000,
    // Кол-во топлива при респавне авто (кроме рабочих - в них всегда полный бак)
    respawnFuel: 10,
    ownVehicleRespawnPrice: 300,
    robberyModels: ['burrito3'],
    newbieRentPlaces: [
        {
            id: 1,
            x: -1008.1200561523438,
            y: -2749.07421875,
            z: 20.171293258666992,
            spawnX: -1002.699951171875,
            spawnY: -2746.0615234375,
            spawnZ: 19.529956817626953,
            spawnH: 252.07958984375,
        },
        {
            id: 2,
            x: -704.5629272460938,
            y: -2314.715576171875,
            z: 13.06032657623291,
            spawnX: -695.9625244140625,
            spawnY: -2319.55224609375,
            spawnZ: 12.468650817871094,
            spawnH: 192.3975372314453,
        },
        {
            id: 3,
            x: 1757.278564453125,
            y: 3295.709716796875,
            z: 41.145816802978516,
            spawnX: 1770.5416259765625,
            spawnY: 3293.135498046875,
            spawnZ: 40.744441986083984,
            spawnH: 307.3987731933594,
        },
        {
            id: 4,
            x: 2153.88037109375,
            y: 4796.80419921875,
            z: 41.18502426147461,
            spawnX: 2163.950927734375,
            spawnY: 4805.53369140625,
            spawnZ: 40.68067932128906,
            spawnH: 234.8848876953125,
        },
        {
            id: 5,
            x: -515.0706176757812,
            y: -296.3483581542969,
            z: 35.240013122558594,
            spawnX: -523.2766723632812,
            spawnY: -298.02764892578125,
            spawnZ: 34.75007629394531,
            spawnH: 112.14364624023438,
        },
    ],
    rentBoatsPlaces: [
        {
            id: 1,
            x: -822.888427734375,
            y: -1360.9320068359375,
            z: 5.150261878967285,
            spawnX: -872.2633056640625,
            spawnY: -1371.9100341796875,
            spawnZ: 0.2960909903049469,
            spawnH: 198.19,
        }
    ],
    rentBoats: {
        'suntrap': {
            price: 500,
            name: 'Suntrap'
        },
        'tropic': {
            price: 1500,
            name: 'Tropic'
        },
        'speeder': {
            price: 2200,
            name: 'Speeder'
        },
        'jetmax': {
            price: 3000,
            name: 'Jetmax'
        },
        'marquis': {
            price: 30000,
            name: 'Marquis'
        },
    },
    async init() {
        houses = call('houses');
        await this.loadVehiclePropertiesFromDB();
        await this.loadVehiclesFromDB();
        await this.loadCarPlates();
        this.createNewbieRentColshapes();
        this.createBoatsRentColshapes();
        mp.events.call('vehicles.loaded');
    },
    async spawnVehicle(veh, source) { /// source: 0 - спавн автомобиля из БД, 1 - респавн любого автомобиля, null - спавн админского авто и т. д.
        let vehicle = mp.vehicles.new(veh.modelName, new mp.Vector3(veh.x, veh.y, veh.z), {
            heading: veh.h,
            engine: false,
            locked: veh.isLocked
        });
        vehicle.engineStatus = false;
        vehicle.setColor(veh.color1, veh.color2);
        vehicle.modelName = veh.modelName;
        vehicle.color1 = veh.color1;
        vehicle.color2 = veh.color2;
        vehicle.x = veh.x;
        vehicle.y = veh.y;
        vehicle.z = veh.z;
        vehicle.h = veh.h;
        vehicle.d = veh.d;
        vehicle.key = veh.key; /// ключ показывает тип авто: faction, job, private, newbie
        vehicle.owner = veh.owner;
        vehicle.fuel = veh.fuel;
        vehicle.mileage = veh.mileage;
        vehicle.parkingId = veh.parkingId;
        vehicle.parkingDate = veh.parkingDate;
        vehicle.lastMileage = veh.mileage; /// Последний сохраненный пробег
        vehicle.marketSpot = veh.marketSpot;
        vehicle.plate = veh.plate;
        vehicle.engineState = veh.engineState;
        vehicle.steeringState = veh.steeringState;
        vehicle.fuelState = veh.fuelState;
        vehicle.brakeState = veh.brakeState;
        vehicle.destroys = veh.destroys;
        vehicle.regDate = veh.regDate;
        vehicle.owners = veh.owners;

        vehicle.multiplier = this.initMultiplier(veh);
        vehicle.setVariable("engine", false);

        vehicle.numberPlate = veh.plate; /// устанавливаем номер

        vehicle.setVariable('isValid', true);

        veh.d ? vehicle.dimension = veh.d : vehicle.dimension = 0; /// устанавливаем измерение

        veh.isInGarage ? vehicle.isInGarage = veh.isInGarage : vehicle.isInGarage = false;

        veh.carPlaceIndex ? vehicle.carPlaceIndex = veh.carPlaceIndex : vehicle.carPlaceIndex = null;

        if (source == 0) { /// Если авто спавнится из БД
            vehicle.sqlId = veh.id;
            vehicle.db = veh;
            inventory.initVehicleInventory(vehicle);
        }
        if (source == 1 && veh.sqlId) { /// Если авто респавнится (есть в БД)
            vehicle.sqlId = veh.sqlId;
            vehicle.db = veh.db;
            if (!veh.inventory) {
                inventory.initVehicleInventory(vehicle);
            } else {
                vehicle.inventory = veh.inventory;
            }
        }
        if (!veh.properties) {
            vehicle.properties = this.getVehiclePropertiesByModel(veh.modelName);
        } else {
            vehicle.properties = veh.properties;
        }

        if (veh.key == 'job' || veh.key == 'newbie') {
            vehicle.fuel = vehicle.properties.maxFuel;
        }

        if (veh.key == 'rent') {
            vehicle.fuel = parseInt(vehicle.properties.maxFuel / 2);
        }

        if (veh.key == 'private' || veh.key == 'market') {
            if (!veh.tuning) {
                await this.initTuning(vehicle);
            } else {
                vehicle.tuning = veh.tuning;
            }
            tuning.setTuning(vehicle);
        }

        if (veh.key == 'faction' && this.robberyModels.includes(veh.modelName)) {
            vehicle.setVariable('robberyVehicle', true);
            vehicle.setVariable('label', 'Предметы: ~y~0 шт.');
        }

        let multiplier = vehicle.multiplier;
        // if (vehicle.fuelState) {
        //     if (vehicle.fuelState == 1) {
        //         multiplier = multiplier * 2;
        //     }
        //     if (vehicle.fuelState == 2) {
        //         multiplier = multiplier * 4;
        //     }
        // }

        vehicle.consumption = vehicle.properties.consumption * multiplier;
        vehicle.fuelTick = 60000 / vehicle.consumption;
        if (!vehicle.fuelTick || isNaN(vehicle.fuelTick)) vehicle.fuelTick = 60000;

        vehicle.fuelTimer = timer.addInterval(() => {
            try {
                if (!mp.vehicles.exists(vehicle)) return timer.remove(vehicle.fuelTimer);
                if (vehicle.engineStatus) {
                    vehicle.fuel = vehicle.fuel - 1;
                    if (vehicle.fuel <= 0) {
                        vehicle.engineStatus = false;
                        vehicle.engine = false;
                        vehicle.setVariable("engine", false);
                        vehicle.fuel = 0;
                        return;
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }, vehicle.fuelTick);
        return vehicle;
    },
    getDriver(vehicle) {
        return this.getOccupants(vehicle).find(x => x.seat == 0);
    },
    respawnVehicle(veh) {
        if (!mp.vehicles.exists(veh)) return;
        timer.remove(veh.fuelTimer);
        if (veh.key == "admin" || veh.key == 'testdrive' || veh.key == 'newbierent') { /// Если админская, не респавним
            veh.destroy();
            return;
        }

        if (veh.key == "private") {

            let owner = mp.players.toArray().find(x => {
                if (!x.character) return;
                if (x.character.id == veh.owner) return true;
            });

            if (!houses.isHaveHouse(owner.character.id)) {
                mp.events.call('parkings.vehicle.add', veh);
                veh.destroy();
                owner.call('chat.message.push', ['!{#ffcb5c}Транспорт доставлен на парковку, отмеченную на карте !{#38afff}синим']);
                return;
            }
            if (veh.carPlaceIndex == null || !veh.hasOwnProperty('carPlaceIndex')) {
                let index = owner.carPlaces.findIndex(x => x.veh == null && x.d != 0);

                if (owner.carPlaces.length == 1 && owner.carPlaces[0].d == 0) {
                    index = 0;
                }

                let place = owner.carPlaces[index];
                veh.carPlaceIndex = index;
                veh.x = place.x;
                veh.y = place.y;
                veh.z = place.z;
                veh.h = place.h;
                veh.d = place.d;
                place.veh = veh;
                veh.isInGarage = true;
            }
            if (veh.hasOwnProperty('carPlaceIndex')) {
                veh.isInGarage = true;
            }
            if (owner.carPlaces.length == 1 && owner.carPlaces[0].d == 0) {
                veh.isInGarage = false;
            }
        }
        mp.events.call('vehicles.respawn.full', veh);
        this.spawnVehicle(veh, 1);
        veh.destroy();
    },
    async loadVehiclesFromDB() { /// Загрузка автомобилей фракций/работ из БД
        var dbVehicles = await db.Models.Vehicle.findAll({
            where: {
                key: {
                    [Op.or]: ["newbie", "faction", "job", "farm"]
                }
            },
            include: {
                as: "minRank",
                model: db.Models.FactionVehicleRank
            }
        });
        for (var i = 0; i < dbVehicles.length; i++) {
            var veh = dbVehicles[i];
            this.spawnVehicle(veh, 0);
        }
        console.log(`[VEHICLES] Загружено транспортных средств: ${i}`);
    },
    async loadVehiclePropertiesFromDB() {
        dbVehicleProperties = await db.Models.VehicleProperties.findAll();
        console.log(`[VEHICLES] Загружено характеристик моделей транспорта: ${dbVehicleProperties.length}`);
    },
    setFuel(vehicle, litres) {
        if (litres < 1) return;
        vehicle.fuel = litres;
        if (vehicle.db) {
            vehicle.db.fuel = litres;
            vehicle.db.save();
        }
    },
    addFuel(vehicle, litres) {
        if (litres < 1) return;
        if (vehicle.db) {
            vehicle.db.fuel = vehicle.fuel + litres;
            vehicle.db.save();
        }
        vehicle.fuel = vehicle.fuel + litres;
    },
    getVehiclePropertiesByModel(modelName) {
        for (let i = 0; i < dbVehicleProperties.length; i++) {
            if (dbVehicleProperties[i].model == modelName) {
                var properties = {
                    name: dbVehicleProperties[i].name,
                    maxFuel: dbVehicleProperties[i].maxFuel,
                    consumption: dbVehicleProperties[i].consumption,
                    license: dbVehicleProperties[i].license,
                    price: dbVehicleProperties[i].price,
                    vehType: dbVehicleProperties[i].vehType,
                    isElectric: dbVehicleProperties[i].isElectric,
                    trunkType: dbVehicleProperties[i].trunkType,
                }
                if (properties.name == null) properties.name = modelName;
                return properties;
            }
        }

        var properties = {
            name: modelName,
            maxFuel: 80,
            consumption: 1.5,
            license: 1,
            price: 100000,
            vehType: 0,
            isElectric: 0,
            trunkType: 1
        }

        return properties;
    },
    async updateMileage(player) {
        if (!player.vehicle) return;
        let veh = player.vehicle;

        if (veh.sqlId) {
            try {
                var value = parseInt(veh.mileage);
                if ((veh.lastMileage - value) == 0) return;
                veh.lastMileage = value;
                await veh.db.update({
                    mileage: value,
                    fuel: Math.ceil(veh.fuel)
                });
            } catch (err) {
                console.log(err);
            }
        }
    },
    async loadPrivateVehicles(player) {
        var dbPrivate = await db.Models.Vehicle.findAll({
            where: {
                key: "private",
                owner: player.character.id
            },
        });
        player.vehicleList = [];
        dbPrivate.forEach((current) => {
            let props = this.getVehiclePropertiesByModel(current.modelName);
            player.vehicleList.push({
                id: current.id,
                name: props.name,
                plate: current.plate,
                regDate: current.regDate,
                owners: current.owners,
                vehType: props.vehType,
                price: props.price,
                parkingDate: current.parkingDate,
                dbInstance: current
            });
        });
        console.log(`[VEHICLES] Для игрока ${player.character.name} загружено ${dbPrivate.length} авто`)
        let hasHouse = houses.isHaveHouse(player.character.id);
        if (hasHouse) {
            await this.setPlayerCarPlaces(player);
        }
        if (dbPrivate.length > 0) {

            if (hasHouse) {
                let parkingVeh = dbPrivate.find(x => x.parkingDate);

                if (parkingVeh) {
                    mp.events.call('parkings.vehicle.add', parkingVeh);
                    mp.events.call('parkings.notify', player, parkingVeh, 0);
                }

                // if (houses.isHaveHouse(player.character.id)) {
                let length = player.carPlaces.length != 1 ? player.carPlaces.length - 1 : player.carPlaces.length;
                for (let i = 0; i < length; i++) {
                    if (i >= dbPrivate.length) return;
                    if (!dbPrivate[i].parkingDate) {
                        this.spawnHomeVehicle(player, dbPrivate[i]);
                        //   }
                    }
                }
            } else {
                let veh = dbPrivate[0];
                if (dbPrivate[0].parkingDate == null) {
                    let now = new Date();
                    dbPrivate[0].update({
                        parkingDate: now
                    });
                }
                mp.events.call('parkings.vehicle.add', veh);
                mp.events.call('parkings.notify', player, veh, 0);
            }

        }
    },
    async loadCarPlates() {
        let carPlatesDB = await db.Models.Vehicle.findAll({
            attributes: ['plate'],
            raw: true
        });
        for (var i = 0; i < carPlatesDB.length; i++) {
            plates.push(carPlatesDB[i].plate);
        }
        console.log(`[VEHICLES] Гос. номеров загружено: ${i}`);
    },

    generateVehiclePlate() {
        let abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let letters = "";
        while (letters.length < 3) {
            letters += abc[Math.floor(Math.random() * abc.length)];
        }
        let number = utils.randomInteger(100, 999);
        let plate = letters + number.toString();

        if (plates.includes(plate)) return this.generateVehiclePlate();
        plates.push(plate);
        return plate;
    },
    initMultiplier(veh) {
        if (veh.key == 'admin') return 1;
        let multiplier = 1;
        let mileage = veh.mileage;
        let destroys = veh.destroys ? veh.destroys : 0;
        if (mileage < 10) multiplier += 0.01;
        if (mileage >= 10 && mileage < 100) multiplier += 0.05;
        if (mileage >= 100 && mileage < 300) multiplier += 0.1;
        if (mileage >= 300 && mileage < 500) multiplier += 0.2;
        if (mileage >= 500 && mileage < 1000) multiplier += 0.4;
        if (mileage >= 1000 && mileage < 2000) multiplier += 0.5;
        if (mileage >= 2000 && mileage < 4000) multiplier += 0.7;
        if (mileage >= 4000 && mileage < 10000) multiplier += 1;
        if (mileage >= 10000) multiplier += 1.2;

        multiplier += 0.01 * destroys;
        return multiplier;
    },
    generateBreakdowns(veh) {
        if (!veh) return;
        let multiplier = veh.multiplier;
        if (veh.properties.isElectric) return;
        if (veh.regDate) {
            let date = veh.regDate;
            let now = new Date();
            let diff = (now - date) / (1000 * 60 * 60 * 24);
            if (diff < NO_BREAK_DAYS) return;
        }
        if (veh.mileage < 4000) return;
        if (veh.properties.price > 100000 && veh.mileage < 8000) return;
        if (veh.properties.price > 1000000 && veh.mileage < 12000) return;

        let toUpdate = false;
        for (let key in breakdownConfig) {
            if (veh[key] < MAX_BREAK_LEVEL) {
                //console.log(`[DEBUG] Пытаемся сломать ${key} у ${veh.properties.name}`);
                let random = Math.random();
                if (random < breakdownConfig[key] * multiplier) {
                    veh[key]++;
                    toUpdate = true;
                    //console.log(`[DEBUG] сломали ${key}`);
                }
            }
        }
        if (toUpdate) {
            if (veh.db) {
                veh.db.update({
                    engineState: veh.engineState,
                    fuelState: veh.fuelState,
                    steeringState: veh.steeringState,
                    brakeState: veh.brakeState
                });
            }
        }
    },
    getVehicleBySqlId(sqlId) {
        if (!sqlId) return null;
        var result;
        mp.vehicles.forEach((veh) => {
            if (veh.sqlId == sqlId) {
                result = veh;
                return;
            }
        });
        return result;
    },
    updateConsumption(vehicle) {
        if (!vehicle) return;
        try {
            timer.remove(vehicle.fuelTimer);

            let multiplier = vehicle.multiplier;
            vehicle.consumption = vehicle.properties.consumption * multiplier;
            vehicle.fuelTick = 60000 / vehicle.consumption;

            vehicle.fuelTimer = timer.addInterval(() => {
                try {
                    if (vehicle.engineStatus) {

                        vehicle.fuel = vehicle.fuel - 1;
                        if (vehicle.fuel <= 0) {
                            vehicle.engineStatus = false;
                            vehicle.engine = false;
                            vehicle.setVariable("engine", false);
                            vehicle.fuel = 0;
                            return;
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            }, vehicle.fuelTick);
        } catch (err) {
            console.log(err);
        }
    },
    getVehiclePosition(vehicle) {
        let data = {
            x: vehicle.position.x,
            y: vehicle.position.y,
            z: vehicle.position.z,
            h: vehicle.heading
        }
        return data;
    },
    removeVehicleFromPlayerVehicleList(player, vehId) {
        if (!player) return;

        for (let i = 0; i < player.vehicleList.length; i++) {
            if (player.vehicleList[i].id == vehId) {
                player.vehicleList.splice(i, 1);
                return;
            }
        }
    },
    setPlayerCarPlaces(player) {
        if (!houses.isHaveHouse(player.character.id)) player.carPlaces = null;


        let places = houses.getHouseCarPlaces(player.character.id);
        places.forEach((current) => {
            current.veh = null;
        });
        player.carPlaces = places;
    },
    spawnHomeVehicle(player, vehicle) {
        if (player.carPlaces.length == 1 && player.carPlaces[0].d == 0) { // TODO ПРОВЕРИТЬ С БИЧ ДОМОМ

            let place = player.carPlaces[0];
            vehicle.x = place.x;
            vehicle.y = place.y;
            vehicle.z = place.z;
            vehicle.h = place.h;
            vehicle.d = place.d;
            place.veh = vehicle;
            vehicle.isInGarage = false;

        } else {
            let index = player.carPlaces.findIndex(x => x.veh == null && x.d != 0);
            let place = player.carPlaces[index];
            vehicle.carPlaceIndex = index;
            vehicle.x = place.x;
            vehicle.y = place.y;
            vehicle.z = place.z;
            vehicle.h = place.h;
            vehicle.d = place.d;
            place.veh = vehicle;
            vehicle.isInGarage = true;
        }
        vehicle.isLocked = true;

        vehicle.db ? this.spawnVehicle(vehicle, 1) : this.spawnVehicle(vehicle, 0);
    },
    removeVehicleFromCarPlace(player, vehicle) {
        if (!vehicle) return;
        if (!player.carPlaces) return;
        if (vehicle.parkingDate) return;

        let place = player.carPlaces[vehicle.carPlaceIndex];

        if (!place) return;
        place.veh = null;
    },
    setVehicleHomeSpawnPlace(player) {
        if (!player) return;
        if (!player.vehicle) return;
        let vehicle = player.vehicle;

        let index = player.carPlaces.findIndex(x => x.veh == null && x.d != 0);

        if (player.carPlaces.length == 1 && player.carPlaces[0].d == 0) {
            index = 0;
        }

        let place = player.carPlaces[index];
        vehicle.carPlaceIndex = index;
        vehicle.x = place.x;
        vehicle.y = place.y;
        vehicle.z = place.z;
        vehicle.h = place.h;
        vehicle.d = place.d;
        place.veh = vehicle;
    },
    setVehicleHomeSpawnPlaceByVeh(player, vehicle) {
        if (!player) return;
        if (!vehicle) return;

        let index = player.carPlaces.findIndex(x => x.veh == null && x.d != 0);

        if (player.carPlaces.length == 1 && player.carPlaces[0].d == 0) {
            index = 0;
        }

        let place = player.carPlaces[index];
        vehicle.carPlaceIndex = index;
        vehicle.x = place.x;
        vehicle.y = place.y;
        vehicle.z = place.z;
        vehicle.h = place.h;
        vehicle.d = place.d;
        place.veh = vehicle;
    },
    isAbleToBuyVehicle(player) {
        let hasHouse = houses.isHaveHouse(player.character.id);
        if (!hasHouse) {
            if (player.vehicleList.length >= 1) return false;
        } else {
            if (player.carPlaces.length > 1 && player.vehicleList.length + 1 > player.carPlaces.length - 1) return false;
            if (player.carPlaces.length == 1 && player.vehicleList.length >= player.carPlaces.length) return false;
        }
        return true;
    },
    doesPlayerHaveHomeVehicles(player) {
        let list = player.vehicleList;
        let result = list.filter(x => x.parkingDate == null);
        if (result.length > 0) return true
        else return false;
    },
    async initTuning(vehicle) {
        let tuning = await db.Models.VehicleTuning.findOrCreate({
            where: {
                vehicleId: vehicle.sqlId
            }
        });
        vehicle.tuning = tuning[0];
    },
    async parseVehicles() {
        var dbVehicles = await db.Models.OldVeh.findAll({
            where: {
                key: {
                    [Op.or]: ["faction", "job", "farm", "market"]
                }
            }
        });
        for (var i = 0; i < dbVehicles.length; i++) {
            var veh = dbVehicles[i];
            await db.Models.Vehicle.create({
                key: veh.key,
                owner: veh.owner,
                modelName: veh.modelName,
                plate: veh.plate,
                regDate: veh.regDate,
                owners: veh.owners,
                color1: veh.color1,
                color2: veh.color2,
                x: veh.x,
                y: veh.y,
                z: veh.z,
                h: veh.h
            });
        }
    },
    // Имеет ли игрок ключи от авто
    haveKeys(player, vehicle) {
        var items = inventory.getItemsByParams(player.inventory.items, 33, ['vehId', 'owner'], [vehicle.db.id, vehicle.db.owner]);
        return items.length > 0;
    },
    // Получить всех игроков в авто
    getOccupants(vehicle) {
        var occupants = vehicle.getOccupants();
        mp.players.forEachInRange(vehicle.position, 10, rec => {
            if (!rec.vehicle) return;
            if (rec.vehicle.id != vehicle.id) return;
            if (occupants.find(x => x.id == rec.id)) return;
            occupants.push(rec);
        });
        // Обходим баги рейджа через проверку на player.vehicle в радиусе авто
        return occupants;
    },
    // Убито ли авто
    isDead(vehicle) {
        return !vehicle.engineHealth || !vehicle.bodyHealth || vehicle.dead;
    },
    getVehiclePropertiesList() {
        return dbVehicleProperties;
    },
    respawn(veh) {
        if (veh.getVariable("robbed")) veh.setVariable("robbed", null);
        var fuel = (veh.db.key == 'job' || veh.db.key == 'newbie') ? veh.properties.maxFuel : Math.max(veh.db.fuel, this.respawnFuel);

        veh.engine = false;
        veh.setVariable("engine", false);

        veh.repair();
        veh.position = new mp.Vector3(veh.db.x, veh.db.y, veh.db.z);
        veh.rotation = new mp.Vector3(0, 0, veh.db.h);
        veh.setVariable("heading", veh.db.h);
        this.setFuel(veh, fuel);
        delete veh.lastPlayerTime;
        mp.events.call("vehicle.respawned", veh);
    },
    // Вкл/откл управление авто игроку
    disableControl(player, enable) {
        if (enable) player.vehicleDisabledControl = true;
        else delete player.vehicleDisabledControl;
        player.call(`vehicles.disableControl`, [enable]);
    },
    createNewbieRentColshapes() {
        this.newbieRentPlaces.forEach(place => {
            mp.blips.new(226, new mp.Vector3(place.x, place.y, place.z), {
                name: 'Аренда скутеров',
                shortRange: true,
                color: 74
            });
            mp.markers.new(1, new mp.Vector3(place.x, place.y, place.z - 2.5), 2.8, {
                direction: new mp.Vector3(place.x, place.y, place.z),
                rotation: 0,
                color: [92, 141, 255, 180],
                visible: true,
                dimension: 0
            });

            mp.labels.new(`Аренда скутеров`, new mp.Vector3(place.x, place.y, place.z + 0.5), {
                los: false,
                font: 0,
                drawDistance: 10,
            });

            let shape = mp.colshapes.newSphere(place.x, place.y, place.z, 2.8);
            shape.isNewbieRent = true;

            shape.onEnter = (player) => {
                if (player.vehicle) return;
                player.newbieRentId = place.id;
                player.call('vehicles.rent.enter', [true]);
            };
            shape.onExit = (player) => {
                player.call('vehicles.rent.enter', [false]);
            };
        });
    },
    createBoatsRentColshapes() {
        this.rentBoatsPlaces.forEach(place => {
            mp.blips.new(427, new mp.Vector3(place.x, place.y, place.z), {
                name: 'Аренда лодок',
                shortRange: true,
                color: 38
            });
            mp.markers.new(1, new mp.Vector3(place.x, place.y, place.z - 2.5), 2.8, {
                direction: new mp.Vector3(place.x, place.y, place.z),
                rotation: 0,
                color: [92, 141, 255, 180],
                visible: true,
                dimension: 0
            });

            mp.labels.new(`Аренда лодок`, new mp.Vector3(place.x, place.y, place.z + 0.5), {
                los: false,
                font: 0,
                drawDistance: 10,
            });

            let shape = mp.colshapes.newSphere(place.x, place.y, place.z, 2.8);
            shape.isBoatsRent = true;

            shape.onEnter = (player) => {
                if (player.vehicle) return;
                player.boatsRentId = place.id;
                player.call('vehicles.boats.rent.enter', [true, this.rentBoats]);
            };
            shape.onExit = (player) => {
                player.call('vehicles.boats.rent.enter', [false]);
            };
        });
    },
    destroyCharacterVehicles(characterId) {
        mp.vehicles.forEach(x => {
            if (x.key === 'private' && x.owner === characterId) {
                x.destroy();
            }
        });
    },
    spawnStoredVehicles(player) {
        let vehicleList = player.vehicleList;
        let length = player.carPlaces.length != 1 ? player.carPlaces.length - 1 : player.carPlaces.length;
        for (let i = 0; i < length; i++) {
            if (i >= vehicleList.length) return;
            if (!vehicleList[i].dbInstance.parkingDate) {
                this.spawnHomeVehicle(player, vehicleList[i].dbInstance);
            }
        }
    }
};
