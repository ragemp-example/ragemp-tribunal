var carmarket = require('./index.js');
module.exports = {
    "/mr": {
        access: 6,
        handler: (player, args) => {
            player.position = new mp.Vector3(39.54726791381836, -1716.88525390625, 28.982471466064453);
        }
    },
    "/mark": {
        access: 6,
        handler: (player, args) => {
            if (!player.vehicle) return;
            db.Models.CarMarketData.create({
                x: player.vehicle.position.x,
                y: player.vehicle.position.y,
                z: player.vehicle.position.z,
                h: player.vehicle.heading
            });
        }
    },
    "/sellall": {
        access: 6,
        handler: (player, args) => {
            carmarket.sellAllCharacterVehicles(player.character.id);
        }
    },
}