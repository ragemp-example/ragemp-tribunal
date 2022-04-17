"use strict";

let notifs;
let timer;
let chat;

let objects = [];

module.exports = {
    async init() {
        notifs = call("notifications");
        timer = call("timer");
        chat = call("chat");

        let objInfo = await db.Models.BlipObject.findAll();
        for (let i = 0; i < objInfo.length; i++) {
            let obj = this.initObj(objInfo[i]);
            objects.push({
                info: objInfo[i],
                obj: obj
            });
        }
    },
    async create(objInfo) {
        let object = await db.Models.BlipObject.create({
            name: objInfo.name,
            sprite: objInfo.sprite,
            x: objInfo.x,
            y: objInfo.y,
            color: objInfo.color,
            dimension: objInfo.dimension,
            scale: objInfo.scale,
        });

        let obj = this.initObj(object);
        objects.push({
            info: object,
            obj: obj
        });
    },
    async remove(id) {
        let objectIndex = objects.findIndex(object => object.info.id === id);
        if (objectIndex !== -1) {
            objects[objectIndex].obj.destroy();
            await objects[objectIndex].info.destroy();
            objects.splice(objectIndex, 1);

            return true;
        } else {
            return false;
        }
    },
    initAll(player) {
        objects.forEach(object => player.call('blipeditor.create', [object.info]));
    },
    initObj(objInfo) {
        mp.players.forEach(player => player.call('blipeditor.create', [objInfo]));
        return {destroy: () => {
                mp.players.forEach(player => player.call('blipeditor.destroy', [objInfo.id]));
            }};
    },
    show(player) {
        objects.forEach(object => chat.push(player, `id: ${object.info.id} | sprite: ${object.info.sprite} | name: ${object.info.name}`));
    }
};