var parkings = require('./index.js');
var vehicles = call('vehicles');
module.exports = {
    "init": async () => {
        await parkings.init();
        inited(__dirname);
    },
    "vehicleDeath": (vehicle) => {
        if (vehicle.key == "private") vehicle.parkingId = parkings.getClosestParkingId(vehicle);
    },
    "playerEnterColshape": (player, shape) => {
        if (shape.isParking) {
            if (player.vehicle) return;
            player.call('parkings.menu.show', [shape.parkingId]);
        }
    },
    "playerExitColshape": (player, shape) => {
        if (shape.isParking) {
            player.call('parkings.menu.close');
        }
    },
    "parkings.vehicle.add": (veh) => {
        parkings.addVehicleToParking(veh);
    },
    "parkings.vehicle.get": (player, parkingId) => {
        parkings.spawnParkingVehicle(player, parkingId);
    },
    "playerQuit": (player) => {
        parkings.savePlayerVehicles(player);
    },
    "parkings.notify": (player, vehicle, type) => {
        if (!player) return;
        if (!vehicle) return;

        let props = vehicles.getVehiclePropertiesByModel(vehicle.modelName);
        let parking = parkings.getParkingInfoById(vehicle.parkingId);
        
        switch (type) {
            case 0:
                player.call('chat.message.push', [`!{#e485e6}Транспорт !{#009eec}${props.name} !{#e485e6}доставлен на парковку`]);
                player.call('chat.message.push', [`!{#e485e6} Парковка отмечена на карте !{#009eec}синим`]);
                break;
        }
    },
    "auth.done": (player) => {
        if (!parkings.parkingBlips) return;
        player.call('parkings.blips.init', [parkings.parkingBlips]);
    }
}