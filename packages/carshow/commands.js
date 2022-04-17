var carshow = require('./index.js');
module.exports = {
    "/buy": {
        access: 6,
        handler: (player, args) => {
            mp.events.call('carshow.car.buy', player, args[0]);
        }
    },
    "/cs": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(-57.056705474853516, -1097.54443359375, 26.422353744506836));
        }
    },
    "/cs2": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(-212.266357421875, 6216.1689453125, 31.49127960205078));
        }
    },
    "/cs3": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(172.58201599121094, -30.282873153686523, 68.0706787109375));
        }
    },
    "/cs4": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(261.24310302734375, -1154.1524658203125, 29.291667938232422));
        }
    },
    "/cs5": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(310.61126708984375, -700.7601928710938, 29.319625854492188));
        }
    }
}

