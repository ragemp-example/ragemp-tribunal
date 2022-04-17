var vehicles = call('vehicles');
var parkings = call('parkings');
var money = call('money');
var houses = call('houses');
var inventory = call('inventory');
let timer = call('timer');
var dbCarList;
var dbCarShow;
var carShow = [];
var carList = [];

const CARLIST_UPDATE_INTERVAL = 60 * 60 * 1000; /// Интервал заполнения автосалона автомобилями (в секундах)

module.exports = {
    testDrivePos: [-93.55802917480469, -1140.9552001953125, 25.179927825927734, 342.68597412109375],
    async init() {
        await this.loadCarShowsFromDB();
        await this.loadCarListsFromDB();
    },
    async loadCarShowsFromDB() { /// Загрузка автосалонов из БД
        dbCarShow = await db.Models.CarShow.findAll();
        for (var i = 0; i < dbCarShow.length; i++) {
            carShow.push({
                sqlId: dbCarShow[i].id,
                name: dbCarShow[i].name,
                x: dbCarShow[i].x,
                y: dbCarShow[i].y,
                z: dbCarShow[i].z,
                cameraX: dbCarShow[i].cameraX,
                cameraY: dbCarShow[i].cameraY,
                cameraZ: dbCarShow[i].cameraZ,
                toX: dbCarShow[i].toX,
                toY: dbCarShow[i].toY,
                toZ: dbCarShow[i].toZ,
                toH: dbCarShow[i].toH,
                returnX: dbCarShow[i].returnX,
                returnY: dbCarShow[i].returnY,
                returnZ: dbCarShow[i].returnZ,
                returnH: dbCarShow[i].returnH,
                blipId: dbCarShow[i].blipId,
                blipColor: dbCarShow[i].blipColor
            });
        }
        for (var i = 0; i < dbCarShow.length; i++) {
            this.createCarShow(dbCarShow[i]);
        }
        console.log(`[CARSHOW] Загружено автосалонов: ${i}`);
    },
    createCarShow(carShow) {
        mp.blips.new(carShow.blipId, new mp.Vector3(carShow.x, carShow.y, carShow.z), {
            name: carShow.name,
            color: carShow.blipColor,
            shortRange: true,
        });
        mp.markers.new(1, new mp.Vector3(carShow.x, carShow.y, carShow.z), 1.6, {
            direction: new mp.Vector3(carShow.x, carShow.y, carShow.z),
            rotation: 0,
            color: [255, 255, 125, 128],
            visible: true,
            dimension: 0
        });
        let shape = mp.colshapes.newSphere(carShow.x, carShow.y, carShow.z + 0.5, 2);
        shape.isCarShow = true;
        shape.carShowId = carShow.id;

        let shortName = carShow.name.split(' ')[0];
        let label = mp.labels.new(`${shortName}`, new mp.Vector3(carShow.x, carShow.y, carShow.z + 1.7), {
            los: false,
            font: 0,
            drawDistance: 10,
        });
        label.isCarShow = true;
        label.carShowId = carShow.id;
    },
    async loadCarListsFromDB() {
        dbCarList = await db.Models.CarList.findAll();

        for (var i = 0; i < dbCarList.length; i++) {
            carList.push({
                sqlId: dbCarList[i].id,
                carShowId: dbCarList[i].carShowId,
                count: dbCarList[i].count,
                vehiclePropertyModel: dbCarList[i].vehiclePropertyModel,
                percentage: dbCarList[i].percentage,
                db: dbCarList[i]
            });
        }

        for (var i = 0; i < carList.length; i++) { /// Устанавливаем характеристики для каждого автомобиля, расположенного в автосалоне
            carList[i] = this.setCarListProperties(carList[i]);
        }
        carList.sort((a, b) => { 
            return a.properties.price - b.properties.price;
        });
        console.log(`[CARSHOW] Загружено моделей авто для автосалонов: ${i}`);
    },
    getCarShowList(carShowId) {
        var list = [];
        for (var i = 0; i < carList.length; i++) {
            if (carList[i].carShowId == carShowId) {
                list.push(carList[i]);
            }
        }
        return list;
    },
    setCarListProperties(veh) {
        let properties = vehicles.getVehiclePropertiesByModel(veh.vehiclePropertyModel);
        veh.properties = properties;
        return veh;
    },
    generateRandomInt() {
        return Math.floor(Math.random() * 1000);
    },
    getCarShowPropertyBySqlId(prop, sqlId) {
        for (var i = 0; i < carShow.length; i++) {
            if (carShow[i].sqlId == sqlId) {
                return carShow[i][prop];
            }
        }
    },
    async buyCarFromCarList(player, carId, primaryColor, secondaryColor) {
        for (var i = 0; i < carList.length; i++) {
            if (carList[i].sqlId == carId) {
                if (player.character.cash < carList[i].properties.price) return player.call('carshow.car.buy.ans', [2]);
                let hasHouse = houses.isHaveHouse(player.character.id);
                if (!vehicles.isAbleToBuyVehicle(player)) return player.call('carshow.car.buy.ans', [5]);

                var cant = inventory.cantAdd(player, 33, {});
                if (cant) return player.call('carshow.car.buy.ans', [7, {
                    text: cant
                }]);

                let carToBuy = carList[i];
                money.removeCash(player, carList[i].properties.price, async function(result) {
                    if (result) {
                        try {
                            var carPlate = vehicles.generateVehiclePlate();
                            let parking = parkings.getClosestParkingId(player);
                            let parkingInfo = parkings.getParkingInfoById(parking);

                            let now = new Date();

                            var data = await db.Models.Vehicle.create({
                                key: "private",
                                owner: player.character.id,
                                modelName: carToBuy.vehiclePropertyModel,
                                color1: primaryColor,
                                color2: secondaryColor,
                                x: 0,
                                y: 0,
                                z: 0,
                                h: 0,
                                parkingDate: hasHouse ? null : now,
                                parkingId: parking,
                                plate: carPlate,
                                owners: 1,
                                regDate: now
                            });
                            var veh = {
                                key: "private",
                                owner: player.character.id,
                                modelName: carToBuy.vehiclePropertyModel,
                                color1: primaryColor,
                                color2: secondaryColor,
                                x: 0,
                                y: 0,
                                z: 0,
                                h: 0,
                                parkingId: parking,
                                parkingDate: hasHouse ? null : now,
                                fuel: 50,
                                mileage: 0,
                                plate: carPlate,
                                engineState: 0,
                                fuelState: 0,
                                steeringState: 0,
                                brakeState: 0,
                                destroys: 0,
                                owners: 1,
                                regDate: now
                            }
                            veh.sqlId = data.id;
                            veh.db = data;
                            if (!hasHouse) {
                                mp.events.call('parkings.vehicle.add', veh);
                            } else {
                                vehicles.spawnHomeVehicle(player, veh);
                            }

                            carToBuy.count = carToBuy.count - 1;
                            let props = vehicles.getVehiclePropertiesByModel(data.modelName);
                            player.vehicleList.push({
                                id: data.id,
                                name: props.name,
                                plate: data.plate,
                                regDate: data.regDate,
                                owners: data.owners,
                                vehType: props.vehType,
                                price: props.price,
                                parkingDate: data.parkingDate,
                                dbInstance: data
                            });

                            if (!hasHouse) {
                                player.call('carshow.car.buy.ans', [1, carToBuy, parkingInfo]);
                            } else {
                                player.call('carshow.car.buy.ans', [6, carToBuy]);
                            }

                            inventory.fullDeleteItemsByParams(33, 'vehId', veh.db.id);
                            // выдача ключей в инвентарь
                            inventory.addItem(player, 33, {
                                owner: player.character.id,
                                vehId: veh.db.id,
                                vehName: carToBuy.properties.name
                            }, (e) => {
                                if (e) return player.call('carmarket.car.buy.ans', [7, {
                                    text: e
                                }]);
                            });

                        } catch (err) {
                            console.log(err);
                            player.call('carshow.car.buy.ans', [2]);
                        }
                    } else {

                        player.call('carshow.car.buy.ans', [3]);

                    }
                }, `Покупка в автосалоне т/с ${carToBuy.vehiclePropertyModel}`);

            }
        }
    },
    getCarShowInfoById(sqlId) {
        for (var i = 0; i < carShow.length; i++) {
            if (carShow[i].sqlId == sqlId) {
                return carShow[i];
            }
        }
    },
    parseProps() {
        for (let key in carshowdata) {
            db.Models.VehicleProperties.create({
                model: key,
                name: carshowdata[key].name,
                vehType: 0,
                price: carshowdata[key].price,
                maxFuel: 50,
                consumption: 2
            });
        }
    },
    parseCarList() {
        for (let key in carshowdata) {
            db.Models.CarList.create({
                carShowId: 1,
                vehiclePropertyModel: key
            });
        }
    }
}
