"use strict";

let notifs;

let microphones = [];

module.exports = {
    async init() {
        notifs = call("notifications");

        let microphonesInfo = await db.Models.Microphone.findAll();
        for (let i = 0; i < microphonesInfo.length; i++) {
            let microphone = this.add(microphonesInfo[i]);
            microphones.push(microphone);
        }
    },
    add(microphoneInfo) {
        let microphone = {
            info: microphoneInfo
        };

        microphone.colshape = mp.colshapes.newSphere(microphone.info.x, microphone.info.y, microphone.info.z, 2, microphone.info.dimension);
        microphone.colshape.isMicrophone = true;

        microphone.marker = mp.markers.new(1, new mp.Vector3(microphone.info.x, microphone.info.y, microphone.info.z), 1,
            {
                rotation: 0,
                color: [255, 255, 0, 125],
                visible: true,
                dimension: microphone.info.dimension
            });
        microphone.label = mp.labels.new(`B`, new mp.Vector3(microphone.info.x, microphone.info.y, microphone.info.z + 1),
            {
                los: false,
                font: 0,
                drawDistance: 15,
                dimension: microphone.info.dimension
            });

        return microphone;
    },
    async create(player) {
        let microphoneInfo = await db.Models.Microphone.create({
            x: player.position.x,
            y: player.position.y,
            z: player.position.z - 1,
            dimension: player.dimension
        });

        let microphone = this.add(microphoneInfo);
        microphones.push(microphone);
    },
    async remove(player) {
        let microphoneIndex = microphones.findIndex(microphone => {
            return player.dist(new mp.Vector3(microphone.info.x, microphone.info.y, microphone.info.z)) < 2
                && player.dimension === microphone.info.dimension;
        });
        if (microphoneIndex !== -1) {
            microphones[microphoneIndex].colshape.destroy();
            microphones[microphoneIndex].marker.destroy();
            microphones[microphoneIndex].label.destroy();
            await microphones[microphoneIndex].info.destroy();
            microphones.splice(microphoneIndex, 1);

            return true;
        } else {
            return false;
        }
    },
};