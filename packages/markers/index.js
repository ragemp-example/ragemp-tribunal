"use strict";
let utils = call('utils');

module.exports = {

    async init() {
        await this.loadTpMarkersFromDB();
    },
    async loadTpMarkersFromDB() {
        var list = await db.Models.TpMarker.findAll();

        list.forEach(el => this.createTpMarker(el));

        console.log(`[MARKERS] ТП-маркеры загружены (${list.length} шт.)`);
    },
    createTpMarker(el) {
        var posA = new mp.Vector3(el.x, el.y, el.z);
        posA.h = el.h;
        posA.d = el.d;
        var posB = new mp.Vector3(el.tpX, el.tpY, el.tpZ);
        posB.h = el.tpH;
        posB.d = el.tpD;

        var markerA = mp.markers.new(1, posA, 0.5, {
            color: [255, 207, 13, 70],
            dimension: posA.d,
        });
        var markerB = mp.markers.new(1, posB, 0.5, {
            color: [255, 207, 13, 70],
            dimension: posB.d,
        });

        markerA.h = posA.h;
        markerA.db = el;
        markerA.target = markerB;

        markerB.h = posB.h;
        markerB.db = el;
        markerB.target = markerA;

        var colshapeA = mp.colshapes.newSphere(posA.x, posA.y, posA.z, 1.5, posA.d);
        var colshapeB = mp.colshapes.newSphere(posB.x, posB.y, posB.z, 1.5, posB.d);

        colshapeA.marker = markerA;
        colshapeB.marker = markerB;

        colshapeA.onEnter = (player) => {
            if (player.vehicle) return;
            if (player.lastTpMarkerId != null) return;
            var target = colshapeA.marker.target;
            var pos = target.position;
            pos.z++;

            mp.players.forEachInRange(player.position, 10, rec => {
                if (player.id == rec.id) return;
                rec.call(`markers.tp.player.teleported`, [player.id, pos, target.h, colshapeA.marker.id]);
            });

            utils.setPlayerPosition(player, pos);
            player.heading = target.h;
            player.dimension = target.dimension;

            player.lastTpMarkerId = colshapeA.marker.id;
        };
        colshapeA.onExit = (player) => {
            if (player.lastTpMarkerId == colshapeA.marker.id) return;
            delete player.lastTpMarkerId;
        };

        colshapeB.onEnter = (player) => {
            if (player.vehicle) return;
            if (player.lastTpMarkerId != null) return;
            var target = colshapeB.marker.target;
            var pos = target.position;
            pos.z++;

            mp.players.forEachInRange(player.position, 10, rec => {
                if (player.id == rec.id) return;
                rec.call(`markers.tp.player.teleported`, [player.id, pos, target.h, colshapeB.marker.id]);
            });

            utils.setPlayerPosition(player, pos);
            player.heading = target.h;
            player.dimension = target.dimension;

            player.lastTpMarkerId = colshapeB.marker.id;
        };
        colshapeB.onExit = (player) => {
            if (player.lastTpMarkerId == colshapeB.marker.id) return;
            delete player.lastTpMarkerId;
        };

        markerA.colshape = colshapeA;
        markerB.colshape = colshapeB;

        if (el.blip && el.blipColor) {
            markerA.blip = mp.blips.new(el.blip, posA, {
                name: el.name || "ТП",
                color: el.blipColor,
                shortRange: 10,
                scale: 1,
                dimension: markerA.dimension
            });
        }
        if (el.tpBlip && el.tpBlipColor) {
            markerB.blip = mp.blips.new(el.tpBlip, posB, {
                name: el.name || "ТП",
                color: el.tpBlipColor,
                shortRange: 10,
                scale: 1,
                dimension: markerB.dimension
            });
        }
    },
    async addTpMarker(posA, posB, name) {
        var el = await db.Models.TpMarker.create({
            name: name,
            x: posA.x,
            y: posA.y,
            z: posA.z,
            h: posA.h,
            d: posA.d,
            blip: posA.blip || null,
            blipColor: posA.blipColor || null,
            tpX: posB.x,
            tpY: posB.y,
            tpZ: posB.z,
            tpH: posB.h,
            tpD: posB.d,
            tpBlip: posB.blip || null,
            tpBlipColor: posB.blipColor || null,
        });

        this.createTpMarker(el);
    },
    removeTpMarker(id) {
        var marker = mp.markers.at(id);

        if (marker.blip) marker.blip.destroy();
        if (marker.target.blip) marker.target.blip.destroy();

        marker.db.destroy();
        marker.colshape.destroy();
        marker.target.colshape.destroy();
        marker.target.destroy();
        marker.destroy();
    },
    getNearTpMarker(pos) {
        var result = null;
        mp.markers.forEachInRange(pos, 2, marker => {
            if (marker.target) result = marker;
        });

        return result;
    }

};
