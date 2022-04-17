let carshow = require('./index.js');
let vehicles = call('vehicles');
let utils = call('utils');

module.exports = {
    "init": () => {
        //carshow.init();
        inited(__dirname);
    },
    "vehicles.loaded": async () => {
        await carshow.init();
    },
    "playerEnterColshape": (player, shape) => {
        if (shape.isCarShow) {
            if (!player.character) return;
            if (player.vehicle) return;
            let isCuffed = player.getVariable('cuffs') || false;
            if (isCuffed) return;
            mp.events.call('carshow.list.show', player, shape.carShowId);
        }
    },
    "carshow.list.show": (player, carShowId) => {
        let list = carshow.getCarShowList(carShowId);
        player.dimension = player.id + 1;
        let info = carshow.getCarShowInfoById(carShowId);
        player.call('carshow.list.show', [list, info]);
        player.carShowId = carShowId;
    },
    "carshow.list.close": (player, carShowId) => {
        player.dimension = 0;
        let info = carshow.getCarShowInfoById(carShowId);
        utils.setPlayerPosition(player, new mp.Vector3(info.returnX, info.returnY, info.returnZ));
        player.heading = info.returnH;
    },
    "carshow.car.buy": (player, carId, primaryColor, secondaryColor) => {
        carshow.buyCarFromCarList(player, carId, primaryColor, secondaryColor);
    },
    "carshow.testdrive.start": async (player, carModel, primaryColor, secondaryColor) => {
        player.dimension = player.id + 1;
        let veh = {
            modelName: carModel,
            x: carshow.testDrivePos[0],
            y: carshow.testDrivePos[1],
            z: carshow.testDrivePos[2],
            h: carshow.testDrivePos[3],
            d: player.dimension,
            color1: primaryColor,
            color2: secondaryColor,
            license: 0,
            key: "testdrive",
            owner: 0,
            fuel: 40,
            mileage: 0,
            plate: "TEST",
            destroys: 0,
        };
        veh = await vehicles.spawnVehicle(veh);
        utils.createAnticheatException(player);
        player.putIntoVehicle(veh, 0);
        player.testDriveVehicle = veh;
        mp.events.call('playerEnterVehicle', player, veh, -1);
        player.call('prompt.show', ['Нажмите <span>Backspace</span> для окончания тест-драйва']);
        player.call('carshow.testdrive.started');
    },
    "carshow.testdrive.stop": (player) => {
        let vehicle = player.testDriveVehicle;
        mp.events.call('carshow.list.show', player, player.carShowId);
        if (vehicle && mp.vehicles.exists(vehicle)) {
            vehicle.destroy();
        }
        let info = carshow.getCarShowInfoById(player.carShowId);
        utils.setPlayerPosition(player, new mp.Vector3(info.x, info.y, info.z));
    }
}