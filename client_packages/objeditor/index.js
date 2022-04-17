"use strict";

let dimensionsNumber = 1000;

let objectsPool = [];
let tempObjectsPool = [];

let moveValue = 0.1;
let currentCreateObjectIndex = null;

mp.events.add('characterInit.done', () => {
    mp.keys.bind(0x57, true, () => { // W
        if (currentCreateObjectIndex == null) return;
        if (mp.busy.includes() !== 0) return;
        if (mp.keys.isDown(16)){
            move(1, 0, moveValue * 100);
        } else {
            move(0, 0, moveValue);
        }
    });
    mp.keys.bind(0x53, true, () => { // S
        if (currentCreateObjectIndex == null) return;
        if (mp.busy.includes() !== 0) return;
        if (mp.keys.isDown(16)){
            move(1, 0, -moveValue * 100);
        } else {
            move(0, 0, -moveValue);
        }
    });
    mp.keys.bind(0x41, true, () => { // A
        if (currentCreateObjectIndex == null) return;
        if (mp.busy.includes() !== 0) return;
        if (mp.keys.isDown(16)){
            move(1, 1, moveValue * 100);
        } else {
            move(0, 1, moveValue);
        }
    });
    mp.keys.bind(0x44, true, () => { // D
        if (currentCreateObjectIndex == null) return;
        if (mp.busy.includes() !== 0) return;
        if (mp.keys.isDown(16)){
            move(1, 1, -moveValue * 100);
        } else {
            move(0, 1, -moveValue);
        }
    });
    mp.keys.bind(0x5A, true, () => { // Z
        if (currentCreateObjectIndex == null) return;
        if (mp.busy.includes() !== 0) return;
        if (mp.keys.isDown(16)){
            move(1, 2, moveValue * 100);
        } else {
            move(0, 2, moveValue);
        }
    });
    mp.keys.bind(0x58, true, () => { // X
        if (currentCreateObjectIndex == null) return;
        if (mp.busy.includes() !== 0) return;
        if (mp.keys.isDown(16)){
            move(1, 2, -moveValue * 100);
        } else {
            move(0, 2, -moveValue);
        }
    });
});

mp.events.add('objeditor.create', (objInfo, isTemp = false, isCreateMode = false) => {
    if (objInfo == null) return;
    if (isCreateMode && !isTemp) return;

    let currentPool = isTemp || isCreateMode ? tempObjectsPool : objectsPool;

    currentPool.push({
        info: objInfo,
        objs: [],
    });

    if (isCreateMode) {
        currentCreateObjectIndex = currentPool.findIndex(object => object.info.id === objInfo.id);
        mp.utils.disablePlayerMoving(true);
    }

    if (objInfo.dimension == null) {
        let object = currentPool.find(object => object.info.id === objInfo.id);
        for (let i = 0; i < dimensionsNumber; i++) {
            object.objs.push(
                mp.objects.new(mp.game.joaat(objInfo.model), new mp.Vector3(objInfo.x, objInfo.y, objInfo.z),
                    {
                        rotation: new mp.Vector3(objInfo.rotX, objInfo.rotY, objInfo.rotZ),
                        alpha: objInfo.alpha,
                        dimension: i
                    })
            );
        }
    } else {
        currentPool.find(object => object.info.id === objInfo.id).objs.push(
            mp.objects.new(mp.game.joaat(objInfo.model), new mp.Vector3(objInfo.x, objInfo.y, objInfo.z),
                {
                    rotation: new mp.Vector3(objInfo.rotX, objInfo.rotY, objInfo.rotZ),
                    alpha: objInfo.alpha,
                    dimension: objInfo.dimension
                }));
    }
});

mp.events.add("objeditor.destroy", (id, isTemp = false) => {
    let currentPool = isTemp ? tempObjectsPool : objectsPool;
    let objectIndex = currentPool.findIndex(object => object.info.id === id);
    if (objectIndex === -1) return;
    currentPool[objectIndex].objs.forEach(obj => {
        if (mp.objects.exists(obj)) obj.destroy();
    });
    currentPool.splice(objectIndex, 1);
    if (isTemp && objectIndex === currentCreateObjectIndex) {
        currentCreateObjectIndex = null;
        mp.utils.disablePlayerMoving(false);
    }
});

let move = (type, axis, value) => {
    let obj = tempObjectsPool[currentCreateObjectIndex];
    if (obj == null) {
        currentCreateObjectIndex = null;
        return;
    }

    if (type === 0) {
        if (axis === 0) {
            obj.info.x = obj.info.x + value;
        } else if (axis === 1) {
            obj.info.y = obj.info.y + value;
        } else if (axis === 2) {
            obj.info.z = obj.info.z + value;
        }
    } else if (type === 1) {
        if (axis === 0) {
            obj.info.rotX = obj.info.rotX + value;
        } else if (axis === 1) {
            obj.info.rotY = obj.info.rotY + value;
        } else if (axis === 2) {
            obj.info.rotZ = obj.info.rotZ + value;
        }
    }

    obj.objs.forEach(obj => {
        if (mp.objects.exists(obj)) obj.destroy();
    });
    obj.objs = [
        mp.objects.new(mp.game.joaat(obj.info.model), new mp.Vector3(obj.info.x, obj.info.y, obj.info.z),
            {
                rotation: new mp.Vector3(obj.info.rotX, obj.info.rotY, obj.info.rotZ),
                alpha: obj.info.alpha,
                dimension: mp.players.local.dimension
            })];

    mp.events.callRemote('objeditor.move', type, axis, value);
}