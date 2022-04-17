"use strict";
let vehicles;
let jobs;

let shape;
let taxiStation = {
    x: 894.9740600585938,
    y: -179.16798400878906,
    z: 74.70034790039062,
    marker: {
        x: 895.3949584960938,
        y: -179.32843017578125,
        z: 73.50028686523438,
        color: [255, 255, 125, 200],
    },
}

const RENT_PRICE = 50;
const PRICE_PER_KM = 100;
const RESPAWN_TIMEOUT = 120000;

let orders = [];

module.exports = {
    init() {
        vehicles = call("vehicles");
        jobs = call("jobs");
        this.createTaxiStation();
    },
    createTaxiStation() {
        mp.blips.new(198, new mp.Vector3(taxiStation.x, taxiStation.y, taxiStation.z),
            {
                name: `Таксопарк`,
                shortRange: true,
                color: 70
            });
        mp.markers.new(1, new mp.Vector3(taxiStation.marker.x, taxiStation.marker.y, taxiStation.marker.z), 0.4,
            {
                direction: new mp.Vector3(taxiStation.marker.x, taxiStation.marker.y, taxiStation.marker.z),
                rotation: 0,
                color: taxiStation.marker.color,
                visible: true,
                dimension: 0
            });
        shape = mp.colshapes.newSphere(taxiStation.marker.x, taxiStation.marker.y, taxiStation.marker.z + 1, 1.2);
        shape.pos = new mp.Vector3(taxiStation.marker.x, taxiStation.marker.y, taxiStation.marker.z);
        shape.isTaxiStation = true;
    },
    getPricePerKilometer() {
        return PRICE_PER_KM;
    },
    getRentPrice() {
        return RENT_PRICE;
    },
    getOrders() {
        return orders;
    },
    addOrder(clientId, position) {
        let order = {
            orderId: orders.length + 1,
            clientId: clientId,
            position: position
        }
        orders.push(order);

        mp.players.forEach((current) => {
            if (!current.character) return;
            if (current.character.job == 2) {
                current.call('taxi.driver.orders.add', [order]);
            }
        });
    },
    doesClientHaveOrders(id) {
        let order = orders.find(x => x.clientId == id);
        return order ? true : false;
    },
    deleteOrder(orderId) {
        let index = orders.findIndex(x => x.orderId == orderId);
        if (index == -1) return;

        orders.splice(index, 1);
        
        mp.players.forEach((current) => {
            if (!current.character) return;
            if (current.character.job == 2) {
                current.call('taxi.driver.orders.delete', [orderId]);
            }
        });
    },
    getOrderById(id) {
        let order = orders.find(x => x.orderId == id);
        return order;
    },
    calculatePrice(player, destination) {
        let price = Math.round((player.dist(destination) / 1000) * PRICE_PER_KM);
        if (price < PRICE_PER_KM) price = PRICE_PER_KM;
        return price;
    },
    deletePlayerOrders(player) {
        let order = orders.find(x => x.clientId == player.id);
        if (!order) return;
        this.deleteOrder(order.orderId);
    },
    getRespawnTimeout() {
        return RESPAWN_TIMEOUT;
    },
    calculateComission(player) {
        let skill = jobs.getJobSkill(player, 2).exp;
        let defaultComission = 0.3;
        return +(defaultComission - 0.25 * (skill / 100)).toFixed(2);
    }
}