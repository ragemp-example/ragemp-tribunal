"use strict";

let dimensionsNumber = 1000;

let objectsPool = [];

mp.events.add('blipeditor.create', (objInfo) => {
    objectsPool.push({
        info: objInfo,
        objs: [],
    });

    if (objInfo.dimension == null) {
        let object = objectsPool.find(object => object.info.id === objInfo.id);
        for (let i = 0; i < dimensionsNumber; i++) {
            object.objs.push(
                mp.blips.new(objInfo.sprite, new mp.Vector3(objInfo.x, objInfo.y, 0),
                    {
                        name: objInfo.name,
                        color: objInfo.color,
                        dimension: i,
                        scale: objInfo.scale,
                        shortRange: true,
                    })
            );
        }
    } else {
        objectsPool.find(object => object.info.id === objInfo.id).objs.push(
            mp.blips.new(objInfo.sprite, new mp.Vector3(objInfo.x, objInfo.y, 0),
                {
                    name: objInfo.name,
                    color: objInfo.color,
                    dimension: objInfo.dimension,
                    scale: objInfo.scale,
                    shortRange: true,
                }));
    }
});

mp.events.add("blipeditor.destroy", (id) => {
    let objectIndex = objectsPool.findIndex(object => object.info.id === id);
    if (objectIndex === -1) return;
    objectsPool[objectIndex].objs.forEach(obj => {
        if (obj.doesExist()) obj.destroy();
    });
    objectsPool.splice(objectIndex, 1);
});