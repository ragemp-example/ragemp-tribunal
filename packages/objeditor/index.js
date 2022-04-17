"use strict";

let notifs;
let timer;

let objects = [];
let labels = [];
let tempObjs = [];
let currentTempObjId = 1;

module.exports = {
    async init() {
        notifs = call("notifications");
        timer = call("timer");

        let objInfo = await db.Models.GameObject.findAll();
        for (let i = 0; i < objInfo.length; i++) {
            let obj = this.initObj(objInfo[i]);
            objects.push({
                info: objInfo[i],
                obj: obj
            });
        }
    },
    async create(objInfo) {
        objInfo.obj.destroy();

        let object = await db.Models.GameObject.create({
            model: objInfo.model,
            x: objInfo.x,
            y: objInfo.y,
            z: objInfo.z,
            rotX: objInfo.rotX,
            rotY: objInfo.rotY,
            rotZ: objInfo.rotZ,
            alpha: objInfo.alpha,
            dimension: objInfo.dimension,
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

            // if (labels.length !== 0) {
            //     this.hideObjects();
            //     this.showObjects();
            // }

            return true;
        } else {
            return false;
        }
    },
    initAll(player) {
        objects.forEach(object => player.call('objeditor.create', [object.info, false, false]));
        tempObjs.forEach(tempObj => player.call('objeditor.create', [tempObj.info, true, false]));
    },
    initObj(objInfo, isTemp = false, creator) {
        if (creator != null) {
            objInfo.id = currentTempObjId;
            currentTempObjId++;
        }
        if (creator == null) {
            mp.players.forEach(player => player.call('objeditor.create', [objInfo, isTemp, false]));
            return {destroy: () => {
                    mp.players.forEach(player => player.call('objeditor.destroy', [objInfo.id, isTemp]));
                }};
        } else {
            creator.call('objeditor.create', [objInfo, isTemp, true]);
            return {destroy: () => {
                    creator.call('objeditor.destroy', [objInfo.id, isTemp]);
                }};
        }

        // if (labels.length !== 0) {
        //     this.hideObjects();
        //     this.showObjects();
        // }
    },
    initTempObj(objInfo, timeout, timeoutFunc) {
        objInfo.id = currentTempObjId;
        currentTempObjId++;

        let obj = this.initObj(objInfo, true);
        let currentTimer = timer.add(async () => {
            obj.destroy();

            if (timeoutFunc) timeoutFunc();
        }, timeout);
        tempObjs.push({
            timer: currentTimer,
            obj: obj
        });
        return currentTimer;
    },
    destroyTempObj(currentTimer) {
        let tempObjIndex = tempObjs.findIndex((tempObj) => tempObj.timer === currentTimer);
        if (tempObjIndex === -1) return;
        timer.remove(tempObjs[tempObjIndex].timer);
        tempObjs[tempObjIndex].obj.destroy();
        tempObjs.splice(tempObjIndex, 1);
    },
    move(objInfo, type, axis, value) {
        if (type === 0) {
            if (axis === 0) {
                objInfo.x = objInfo.x + value;
            } else if (axis === 1) {
                objInfo.y = objInfo.y + value;
            } else if (axis === 2) {
                objInfo.z = objInfo.z + value;
            }
        } else if (type === 1) {
            if (axis === 0) {
                objInfo.rotX = objInfo.rotX + value;
            } else if (axis === 1) {
                objInfo.rotY = objInfo.rotY + value;
            } else if (axis === 2) {
                objInfo.rotZ = objInfo.rotZ + value;
            }
        }
    },
    showObjects(player) {
        if (labels.length !== 0) {
            this.hideObjects();
            player.objeditorlabelheight += 1;
        } else {
            player.objeditorlabelheight = 1;
        }
        for (let i = 0; i < objects.length; i++) {
            let label = mp.labels.new("ID: " + objects[i].info.id, new mp.Vector3(
                objects[i].info.x,
                objects[i].info.y,
                objects[i].info.z + player.objeditorlabelheight
            ), {
                los: false,
                font: 2,
                drawDistance: 100,
                color: [255, 0, 255, 255],
                dimension: objects[i].info.dimension != null ? objects[i].info.dimension : mp.players.local.dimension
            });
            labels.push(label);
        }
    },
    hideObjects(player) {
        if (player != null) {
            player.objeditorlabelheight = null;
        }
        for (let i = 0; i < labels.length; i++) {
            labels[i].destroy();
        }
        labels = [];
    },
    goto(player, id) {
        let objectIndex = objects.findIndex((object) => object.info.id === id);
        if (objectIndex === -1) return;
        player.position = new mp.Vector3(objects[objectIndex].info.x, objects[objectIndex].info.y, objects[objectIndex].info.z + 2);
    }
};