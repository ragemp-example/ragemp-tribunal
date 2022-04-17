let vehicleList = [];
let currentVehicleListInfo;
let respawnPrice = 0;

let destination = {};

mp.events.add('vehicles.own.list.show', (list, price) => {
    vehicleList = list;
    respawnPrice = price;
    let items = [];
    list.forEach((current) => {
        items.push({
            text: current.name,
            values: [current.plate]
        });
    });
    items.push({ text: 'Закрыть' });
    mp.callCEFV(`selectMenu.setItems('ownVehiclesList', ${JSON.stringify(items)});`)
    mp.events.call('selectMenu.show', 'ownVehiclesList');
});

mp.events.add('vehicles.own.menu.show', (index) => {
    currentVehicleListInfo = vehicleList[index];
    mp.callCEFV(`selectMenu.menus['ownVehicleMenu'].items[0].values = ['${currentVehicleListInfo.plate}']`);
    mp.callCEFV(`selectMenu.menus['ownVehicleMenu'].items[2].values = ['$${respawnPrice}']`);
    mp.callCEFV(`selectMenu.menus['ownVehicleMenu'].header = '${currentVehicleListInfo.name}'`);
    mp.events.call('selectMenu.show', 'ownVehicleMenu');
});

mp.events.add('vehicles.own.deliver', () => {
    if (!currentVehicleListInfo) return;
    mp.events.callRemote('vehicles.own.deliver', currentVehicleListInfo.id);
});

mp.events.add('vehicles.own.find', () => {
    if (!currentVehicleListInfo) return;
    mp.events.callRemote('vehicles.own.find', currentVehicleListInfo.id);
});

mp.events.add('vehicles.own.destination.create', (pos) => {
    deleteDestination();
    destination.blip = mp.blips.new(523, pos, { color: 71, name: "Транспорт" });
    destination.blip.setRoute(true);

    destination.marker = mp.markers.new(1, new mp.Vector3(pos.x, pos.y, pos.z - 6), 10,
        {
            direction: new mp.Vector3(pos.x, pos.y, pos.z),
            rotation: 0,
            color: [255, 234, 0, 180],
            visible: true,
            dimension: 0
        });
    destination.shape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 6);
    destination.shape.pos = pos;
    destination.shape.isOwnVehicleShape = true;
});

mp.events.add("playerEnterColshape", (shape) => {
    if (shape.isOwnVehicleShape) {
        deleteDestination();
    }
});

function deleteDestination() {
    if (destination.blip) {
        destination.blip.destroy();
        destination.blip = null;
    }
    if (destination.marker) {
        destination.marker.destroy();
        destination.marker = null;
    }
    if (destination.shape) {
        destination.shape.destroy();
        destination.shape = null;
    }
}

mp.keys.bind(0x4A, true, () => { /// J
        if (mp.busy.includes()) return;
        mp.events.callRemote('vehicles.lock.closest');
});