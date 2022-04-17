"use strict";
let vehicles;
let jobs;

let busStation = {
    x: 435.4512634277344,
    y: -646.3255615234375,
    z: 0,
    marker: {
        x: 435.9074401855469,
        y: -646.0038452148438,
        z: 27.55,
        color: [255, 255, 125, 200],
    },
}

let shape;
let busStops;
let busRoutes;

const RENT_PRICE = 50;
const STOP_TIMEOUT = 15000;
const RESPAWN_TIMEOUT = 120000;

module.exports = {
    init() {
        vehicles = call("vehicles");
        jobs = call("jobs");
        this.createBusStation();
        this.loadBusStopsFromDB();
        this.loadBusRoutesFromDB();
    },
    createBusStation() {
        mp.blips.new(513, new mp.Vector3(busStation.x, busStation.y, busStation.z),
            {
                name: `Автобусная станция`,
                shortRange: true,
                color: 4
            });
        mp.markers.new(1, new mp.Vector3(busStation.marker.x, busStation.marker.y, busStation.marker.z), 0.4,
            {
                direction: new mp.Vector3(busStation.marker.x, busStation.marker.y, busStation.marker.z),
                rotation: 0,
                color: busStation.marker.color,
                visible: true,
                dimension: 0
            });
        shape = mp.colshapes.newSphere(busStation.marker.x, busStation.marker.y, busStation.marker.z + 1, 1.2);

        shape.onEnter = (player) => {
            let state = player.character.job == 3 ? 1 : 0;
            player.call('busdriver.jobmenu.show', [state]);
        }

        shape.onExit = (player) => {
            player.call('busdriver.jobmenu.close');
        }
    },
    async loadBusStopsFromDB() {
        busStops = await db.Models.BusStop.findAll();

        for (var i = 0; i < busStops.length; i++) {
            this.createBusStop(busStops[i]);
        }
        console.log(`[BUSDRIVER] Загружено автобусных остановок: ${i}`);
    },
    async loadBusRoutesFromDB() {
        busRoutes = await db.Models.BusRoute.findAll({
            include: [{
                model: db.Models.BusRoutePoint
            }]   
        });
        console.log(`[BUSDRIVER] Загружено маршрутов: ${busRoutes.length}`);
    },
    createBusStop(stop) {
       let label = mp.labels.new(`Автобусная остановка \n ~y~${stop.name}`, new mp.Vector3(stop.x, stop.y, stop.z),
        {
            los: false,
            font: 0,
            drawDistance: 15,
        });
        label.busStopId = stop.id;
    },
    getRentPrice() {
        return RENT_PRICE;
    },
    getRoutesLevelByModel(model) {
        if (model == 'rentalbus' || model == 'coach') return 0;
        //if (model == 'coach') return 1;
        return null;
    },
    getAvailiableRoutes(player) {
        if (!player.vehicle) return;

        let level = this.getRoutesLevelByModel(player.vehicle.modelName);
        let routes = busRoutes.filter(x => x.level == level);
        let result = routes.map(function (current) {
            return {
                id: current.id,
                name: current.name
            };
        });
        return result;
    },
    getRouteById(id) {
        return busRoutes.find(x => x.id == id);
    },
    getStopTimeout() {
        return STOP_TIMEOUT;
    },
    getRespawnTimeout() {
        return RESPAWN_TIMEOUT;
    },
    calculateBonus(player) {
        let skill = jobs.getJobSkill(player, 3).exp;
        return +(skill / 100).toFixed(2);
    }
}