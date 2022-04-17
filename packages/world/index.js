"use strict";

let utils = call('utils');

module.exports = {
    // Двери
    doors: [],
    // Объекты мира ГТА
    objects: {},
    // Колшейпы объектов (objId: colshape)
    colshapes: {},

    async init() {
        //this.loadDoorsFromDB();
        await this.loadWorldObjectsFromDB();
    },
    // async loadDoorsFromDB() {
    //     this.doors = await db.Models.Door.findAll();

    //     console.log(`[WORLD] Двери загружены (${this.doors.length} шт.)`);
    // },
    async loadWorldObjectsFromDB() {
        var objects = await db.Models.WorldObject.findAll();
        objects.forEach(obj => {
            if (!this.objects[obj.region]) this.objects[obj.region] = {};
            if (!this.objects[obj.region][obj.street]) this.objects[obj.region][obj.street] = {};
            if (!this.objects[obj.region][obj.street][obj.type]) this.objects[obj.region][obj.street][obj.type] = [];

            this.objects[obj.region][obj.street][obj.type].push(obj);
            this.createObjColshape(obj);
        });

        console.log(`[WORLD] Объекты мира загружены (${objects.length} шт.)`);
    },
    async addObject(data) {
        var obj = await db.Models.WorldObject.create({
            region: data.region,
            street: data.street,
            type: data.type,
            name: data.name,
            pos: JSON.stringify(data.pos),
            radius: data.radius,
            hash: parseInt(data.hash) || null,
        });

        if (!this.objects[obj.region]) this.objects[obj.region] = {};
        if (!this.objects[obj.region][obj.street]) this.objects[obj.region][obj.street] = {};
        if (!this.objects[obj.region][obj.street][obj.type]) this.objects[obj.region][obj.street][obj.type] = [];

        this.objects[obj.region][obj.street][obj.type].push(obj);
        this.createObjColshape(obj);
    },
    deleteObject(id) {
        if (!this.colshapes[id]) return;

        var colshape = this.colshapes[id];
        var obj = colshape.db;
        var list = this.objects[obj.region][obj.street][obj.type];

        var i = list.indexOf(obj);
        if (i != -1) list.splice(i, 1);
        colshape.destroy();
        obj.destroy();
        delete this.colshapes[id];
    },
    createObjColshape(obj) {
        var pos = obj.pos;

        var colshape = mp.colshapes.newCircle(pos.x, pos.y, obj.radius);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            mp.events.call('playerEnterWorldObject', player, colshape);
        };
        colshape.onExit = (player) => {
            mp.events.call('playerExitWorldObject', player, colshape);
        };
        colshape.db = obj;
        colshape.health = 100;

        this.colshapes[obj.id] = colshape;
    },
    setObjectPos(data) {
        if (!this.colshapes[data.id]) return;

        var colshape = this.colshapes[data.id];
        var obj = colshape.db;
        var list = this.objects[obj.region][obj.street][obj.type];

        var i = list.indexOf(obj);
        if (i != -1) list.splice(i, 1);
        colshape.destroy();
        delete this.colshapes[obj.id];

        obj.region = data.region;
        obj.street = data.street;
        obj.pos = data.pos;
        obj.save();

        if (!this.objects[obj.region]) this.objects[obj.region] = {};
        if (!this.objects[obj.region][obj.street]) this.objects[obj.region][obj.street] = {};
        if (!this.objects[obj.region][obj.street][obj.type]) this.objects[obj.region][obj.street][obj.type] = [];

        this.objects[obj.region][obj.street][obj.type].push(obj);
        this.createObjColshape(obj);
    },
    setObjectRadius(objId, radius) {
        if (!this.colshapes[objId]) return;

        var colshape = this.colshapes[objId];
        var obj = colshape.db;

        colshape.destroy();
        delete this.colshapes[obj.id];

        obj.radius = radius;
        obj.save();

        this.createObjColshape(obj);
    },
    // setDoorLocked(id, locked) {
    //     var door = this.doors.find(x => x.id == id);
    //     if (!door) return
    //     door.locked = locked;
    //     door.save();
    //     mp.players.forEach(rec => {
    //         if (!rec.character) return;
    //         rec.call(`world.doors.set`, [door.id, door.locked]);
    //     });
    // },
    // async createDoor(hash, pos) {
    //     var door = await db.Models.Door.create({
    //         hash: hash,
    //         pos: pos
    //     });
    //     this.doors.push(door);
    //     mp.players.forEach(rec => {
    //         if (!rec.character) return;
    //         rec.call(`world.doors.new`, [door]);
    //     });
    // },
    // getDoor(hash, pos) {
    //     var range = 2;
    //     var nearDoor = null;
    //     var minDist = Number.MAX_VALUE;
    //     for (var i = 0; i < this.doors.length; i++) {
    //         var door = this.doors[i];
    //         if (door.hash != hash) continue;
    //         var distance = utils.vdist(pos, door.pos);
    //         if (distance < minDist && distance < range) {
    //             nearDoor = door;
    //             minDist = distance;
    //         }
    //     }
    //     return nearDoor;
    // },
}
