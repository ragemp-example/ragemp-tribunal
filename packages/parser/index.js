"use strict";

let houses = require('./files/houses.json');
let interiors = require('./files/interiors.json');
let garages = require('./files/garages.json');

let bizes = require('./files/biz.json');

/// Функции модуля парсера JSON в БД
module.exports = {
    async init() {
        console.log("[PARSE] start");
        let garagesDB = await db.Models.Garage.findAll();
        if (garagesDB.length == 0) {
            for (let i = 0; i < garages.length; i++) {
                await db.Models.Garage.create({
                    id: garages[i].id,
                    carPlaces: garages[i].carPlaces,
                    x: garages[i].x,  
                    y: garages[i].y,
                    z: garages[i].z,
                    rotation: garages[i].rotation,
                    exitX: garages[i].exitX,  
                    exitY: garages[i].exitY,
                    exitZ: garages[i].exitZ
                }, {});
            }
            console.log("[PARSE] garages loaded");
        }

        let interiorsDB = await db.Models.Interior.findAll();
        if (interiorsDB.length == 0) {
            for (let i = 0; i < interiors.length; i++) {
                await db.Models.Interior.create({
                    id: interiors[i].id + 1,
                    garageId: interiors[i].garageId,
                    class: interiors[i].class,
                    numRooms: interiors[i].numRooms,
                    rent: 0.1,
                    x: interiors[i].x,  
                    y: interiors[i].y,
                    z: interiors[i].z,
                    rotation: interiors[i].rotation,
                    exitX: interiors[i].exitX,  
                    exitY: interiors[i].exitY,
                    exitZ: interiors[i].exitZ,
                    hX: 0,
                    hY: 0,
                    hZ: 0
                }, {});
            }
            console.log("[PARSE] interiors loaded");
        }

        let housesDB = await db.Models.House.findAll();
        interiorsDB = await db.Models.Interior.findAll({raw:true});
        if (housesDB.length == 0 && interiorsDB.length != 0) {
            for (let i = 0; i < houses.length; i++) {
                if (interiorsDB.findIndex( x => x.id == houses[i].interior + 1) == -1) continue;
                db.Models.House.create({
                    characterId: null,
                    interiorId: houses[i].interior + 1,
                    isOpened: true,
                    date: null,
                    pickupX: houses[i].pickup[0],
                    pickupY: houses[i].pickup[1],
                    pickupZ: houses[i].pickup[2],
                    spawnX: houses[i].spawn[0],
                    spawnY: houses[i].spawn[1],
                    spawnZ: houses[i].spawn[2],
                    angle: houses[i].angle,
                    price: houses[i].price,
                    carX: houses[i].carpos[0],
                    carY: houses[i].carpos[1],
                    carZ: houses[i].carpos[2],
                    carAngle: houses[i].carangle
                }, {});
            }
            console.log("[PARSE] houses loaded");
        }

        let bizesDB = await db.Models.Biz.findAll();
        if (bizesDB.length == 0) {
            for (let i = 0; i < bizes.length; i++) {
                if (bizes[i].type == 2) continue;
                db.Models.Biz.create({
                    name: bizes[i].name,
                    price: bizes[i].price,
                    type: bizes[i].type,
                    cashBox: 0,
                    productsCount: 0,
                    productsMaxCount: 100,
                    x: bizes[i].pos[0],
                    y: bizes[i].pos[1],
                    z: bizes[i].pos[2]
                }, {});
            }
            console.log("[PARSE] bizes loaded");
        }
        console.log("[PARSE] end");
    },
}