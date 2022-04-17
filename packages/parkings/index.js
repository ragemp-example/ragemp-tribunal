var dbParkings;
var parkings = [];
var parkingVehicles = []; /// автомобили на парковке
var vehicles = call("vehicles");
var houses = call("houses");
let money = call('money');
let timer = call('timer');

const PARKING_PRICE = 7; /// цена парковки за час

module.exports = {
    parkingBlips: [],
    async init() {
        await this.loadParkingsFromDB();
    },
    async loadParkingsFromDB() {
        dbParkings = await db.Models.Parking.findAll();
        for (var i = 0; i < dbParkings.length; i++) {
            parkings.push({
                sqlId: dbParkings[i].id,
                name: dbParkings[i].name,
                x: dbParkings[i].x,
                y: dbParkings[i].y,
                z: dbParkings[i].z,
                carX: dbParkings[i].carX,
                carY: dbParkings[i].carY,
                carZ: dbParkings[i].carZ,
                carH: dbParkings[i].carH
            });
        }
        for (var i = 0; i < dbParkings.length; i++) {
            this.createParking(dbParkings[i]);
            this.parkingBlips.push({
                id: dbParkings[i].id,
                x: dbParkings[i].x,
                y: dbParkings[i].y,
                z: dbParkings[i].z,
            });
        }
        mp.players.forEach((current) => {
            current.call('parkings.blips.init', [this.parkingBlips]);
        });
        console.log(`[PARKINGS] Загружено парковок: ${i}`);
    },
    createParking(parking) {
        mp.markers.new(1, new mp.Vector3(parking.x, parking.y, parking.z - 0.5), 2,
            {
                direction: new mp.Vector3(parking.x, parking.y, parking.z),
                rotation: 0,
                color: [4, 100, 217, 200],
                visible: true,
                dimension: 0
            });
        let shape = mp.colshapes.newSphere(parking.x, parking.y, parking.z, 2);
        shape.pos = new mp.Vector3(parking.x, parking.y, parking.z);
        shape.isParking = true;
        shape.parkingId = parking.id;

        let label = mp.labels.new(`Парковка \n ~b~${parking.name}\n~g~$${PARKING_PRICE} ~w~в час`, new mp.Vector3(parking.x, parking.y, parking.z + 1.6),
            {
                los: false,
                font: 0,
                drawDistance: 10,
            });
        label.isParking = true;
        label.parkingId = parking.id;
    },
    addVehicleToParking(veh) {
        let owner = mp.players.toArray().find(x => x.character && x.character.id == veh.owner);
        if (!owner) return;
        owner.call('parkings.blips.private.set', [veh.parkingId]);
        if (!veh.parkingDate) {
            let now = new Date();
            veh.parkingDate = now;
            if (veh.db) {
                veh.db.update({ parkingDate: now });
            } else {
                veh.update({ parkingDate: now });
            }
        }
        parkingVehicles.push(veh);
    },
    spawnParkingVehicle(player, parkingId) {
        let vehicleFound;
        let foundIndex;
        for (var i = 0; i < parkingVehicles.length; i++) {
            if ((parkingVehicles[i].owner == player.character.id) && (parkingId == parkingVehicles[i].parkingId)) {
                vehicleFound = parkingVehicles[i];
                foundIndex = i;
            }
        }

        if (!vehicleFound) return player.call('notifications.push.error', ["На парковке нет вашего т/c", "Ошибка"]);

        let checkId;
        if (!vehicleFound.sqlId) {
            checkId = vehicleFound.id;
        } else {
            checkId = vehicleFound.sqlId;
        }
        let checkedVeh = mp.vehicles.getBySqlId(checkId);
        if (checkedVeh) return player.call('notifications.push.error', ["Сработала анти-дюп система", "Ошибка"]);

        let index = this.findParkingIndexById(vehicleFound.parkingId);
        let date = vehicleFound.parkingDate;
        let now = new Date();
        let hours = parseInt((now - date) / (1000 * 60 * 60));
        let price = hours * PARKING_PRICE;
        if (player.character.cash < price) return player.call('notifications.push.error', [`Требуется $${price}`, "Ошибка"]);

        money.removeCash(player, price, function(result) {
            if (result) {
                player.call('chat.message.push', [`!{#80c102} Вы забрали транспорт с парковки за !{#009eec}$${price}`]);
                player.call('notifications.push.success', ["Вы забрали т/с с парковки", "Успешно"]);
                vehicleFound.x = parkings[index].carX;
                vehicleFound.y = parkings[index].carY;
                vehicleFound.z = parkings[index].carZ;
                vehicleFound.h = parkings[index].carH;

                vehicleFound.isLocked = true;

                player.call('parkings.blips.private.clear');

                vehicleFound.parkingDate = null;
                if (vehicleFound.db) {
                    vehicleFound.db.update({
                        parkingDate: null
                    });
                } else {
                    vehicleFound.update({
                        parkingDate: null
                    });
                }
                if (!vehicleFound.sqlId) {
                    vehicles.spawnVehicle(vehicleFound, 0);
                } else {
                    vehicles.spawnVehicle(vehicleFound, 1);
                }
                parkingVehicles.splice(foundIndex, 1);

                let vehId;
                if (!vehicleFound.sqlId) {
                    vehId = vehicleFound.id;
                } else {
                    vehId = vehicleFound.sqlId;
                }

                for (let i = 0; i < player.vehicleList.length; i++) {
                    if (player.vehicleList[i].id == vehId) {
                        player.vehicleList[i].parkingDate = null;
                    }
                }
            } else {
                player.call('notifications.push.error', [`Не удалось забрать т/с`, "Ошибка"]);
            }
        }, `Взятие т/с ${vehicleFound.modelName} с парковки`);
    },
    findParkingIndexById(id) {
        for (var i = 0; i < parkings.length; i++) {
            if (parkings[i].sqlId == id) {
                return i;
            }
        }
    },
    getClosestParkingId(entity) {
        var minId = 1;
        var minDist = 10000;
        mp.colshapes.forEach((shape) => {
            if (shape.isParking) {
                let dist = entity.dist(shape.pos);
                if (dist < minDist) {
                    minDist = dist;
                    minId = shape.parkingId;
                }
            }
        });
        return minId;
    },
    addNewParking(parking) {
        parkings.push(parking);
        this.createParking(parking);
    },
    savePlayerVehicles(player) {
        if (!player.character) return;
        this.deletePlayerParkingVehicles(player.character.id);
        let hasHouse = houses.isHaveHouse(player.character.id);
        mp.vehicles.forEach((current) => {
            if (current.key == "private" && current.owner == player.character.id) {
                if (!hasHouse) {
                    let now = new Date();
                    current.db.update({
                        parkingId: this.getClosestParkingId(player),
                        parkingDate: now
                    });
                }
                timer.remove(current.fuelTimer);
                current.destroy();
            }
        });
    },
    getParkingInfoById(id) {
        for (let i = 0; i < parkings.length; i++) {
            if (parkings[i].sqlId == id) {
                return parkings[i];
            }
        }
    },
    deletePlayerParkingVehicles(id) {
        parkingVehicles = parkingVehicles.filter(x => x.owner != id);
    }
}
