var parkings = require('./index.js');
var newPark = {};
module.exports = {
    "/newpark": {
        access: 6,
        handler: (player, args) => {
            if (args[0] == 0) {
                args.splice(0, 1);
                newPark.name = args.join(' ');
                player.call('chat.message.push', [`!{#ffffff} Название новой парковки: ${newPark.name}`]);
            }
            if (args[0] == 1) {
                newPark.x = player.position.x;
                newPark.y = player.position.y;
                newPark.z = player.position.z - 1;
                player.call('chat.message.push', [`!{#ffffff} Координаты новой парковки: ${newPark.x} ${newPark.y} ${newPark.z}`]);
            }
            if (args[0] == 2) {
                if (!player.vehicle) return player.call('chat.message.push', [`!{#ffffff} Вы не в т/с`]);
                newPark.carX = player.vehicle.position.x;
                newPark.carY = player.vehicle.position.y;
                newPark.carZ = player.vehicle.position.z;
                newPark.carH = player.vehicle.heading;
                player.call('chat.message.push', [`!{#ffffff} Координаты спавна авто парковки: ${newPark.carX} ${newPark.carY} ${newPark.carZ} ${newPark.carH}`]);
            }
            if (args[0] == 3) {
                db.Models.Parking.create({
                    name: newPark.name,
                    x: newPark.x,
                    y: newPark.y,
                    z: newPark.z,
                    carX: newPark.carX,
                    carY: newPark.carY,
                    carZ: newPark.carZ,
                    carH: newPark.carH
                }).then((data) => {
                    console.log(data);
                    newPark.id = data.id;
                    newPark.sqlId = data.id;
                    parkings.addNewParking(newPark);
                    player.call('chat.message.push', [`!{#ffffff} Парковка создана`]);
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    }
}