"use strict";

module.exports = {
    zones: [],
    colshapes: [],
    markers: [],
    async init() {
        console.log("[PEACEZONE] load peace zones from DB");
        this.zones = await db.Models.PeaceZone.findAll();
        console.log("[PEACEZONE] " + this.zones.length + " peace zones loaded");

        this.zones.forEach(zone => {
            this.initZone(zone);
        });
    },
    initZone(zone) {
        let colshape = mp.colshapes.newCuboid(zone.x + zone.dx / 2, zone.y + zone.dy / 2, zone.z + zone.dz / 2, zone.dx, zone.dz, zone.dy);
        colshape.zoneId = zone.id;
        this.colshapes.push(colshape);
    },
    showDots() {
        this.zones.forEach(zone => {
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x + zone.dx / 2, zone.y + zone.dy / 2, zone.z + zone.dz / 2), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 0, 255, 255],
                    visible: true,
                    dimension: 0
                }));
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x, zone.y, zone.z), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [255, 0, 0, 255],
                    visible: true,
                    dimension: 0
                }));
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x + zone.dx, zone.y, zone.z), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: 0
                }));
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x + zone.dx, zone.y + zone.dy, zone.z), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: 0
                }));
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x, zone.y + zone.dy, zone.z), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: 0
                }));
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x, zone.y, zone.z + zone.dz), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: 0
                }));
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x + zone.dx, zone.y, zone.z + zone.dz), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: 0
                }));
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x, zone.y + zone.dy, zone.z + zone.dz), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: 0
                }));
            this.markers.push(mp.markers.new(0, new mp.Vector3(zone.x + zone.dx, zone.y + zone.dy, zone.z + zone.dz), 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: 0
                }));
        });
    },
    hideDots() {
        this.markers.forEach(marker => {
            marker.destroy();
        });
        this.markers = [];
    },
    async add(x, y, z, dx, dy, dz) {
        let zone = await db.Models.PeaceZone.create({
            x: x,
            y: y,
            z: z,
            dx: dx,
            dy: dy,
            dz: dz
        });
        this.zones.push(zone);
        this.initZone(zone);
    },
    async remove(player, id) {
        this.hideDots();
        let colshapeIndex = this.colshapes.findIndex(x => x.zoneId === id);
        if (colshapeIndex !== -1) {
            this.colshapes[colshapeIndex].destroy();
            this.colshapes.splice(colshapeIndex, 1);
        }

        let zoneIndex = this.zones.findIndex(x => x.id === id);
        if (zoneIndex !== -1) {
            await this.zones[zoneIndex].destroy();
            this.zones.splice(zoneIndex, 1);
        }

        player.call("peaceZones.removed", [id]);
    },
};
