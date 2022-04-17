let storage = {}, destination = {};
mp.builder = {};

mp.events.add({
    'characterInit.done': () => {
        createJobPed();
    },
    'builder.menu.show': (show, isBuilder) => {
        if (show) {
            mp.callCEFV(`selectMenu.menus['builder'].items[0].text = '${isBuilder ? 'Закончить работу' : 'Начать работу'}'`);
            mp.callCEFV(`selectMenu.showByName('builder')`);
        } else {
            mp.callCEFV(`selectMenu.show = false`);
        }
    },
    'builder.storage.create': (pos) => {
        createStorage(pos);
    },
    'playerEnterColshape': (shape) => {
        if (mp.players.local.vehicle) return;
        if (shape.isBuilderStorage) {
            destroyStorage();
            mp.events.callRemote('builder.storage.enter');
        } else if (shape.isBuilderDestination) {
            destroyDestination();
            mp.events.callRemote('builder.destination.enter');
            mp.builder.hasProp = false;
        }
    },
    'builder.destination.create': (pos) => {
        mp.builder.hasProp = true;
        createDestination(pos);
    },
    'builder.destination.destroy': () => {
        destroyDestination();
    },
    'builder.work.stop': () =>{
        mp.builder.hasProp = false;
        destroyDestination();
        destroyStorage();
    }
});

registerAttachments();

function createJobPed() {
    mp.events.call('NPC.create', {
        model: "s_m_y_construct_02",
        position: {
            x: -509.410400390625,
            y: -1001.6173706054688,
            z: 23.550525665283203
        },
        heading: 82.5084457397461,
    });
}

function createStorage(pos) {
    storage.marker = mp.markers.new(1, new mp.Vector3(pos.x, pos.y, pos.z - 0.5), 1.5,
        {
            direction: new mp.Vector3(pos.x, pos.y, pos.z),
            rotation: 0,
            color: [78, 209, 54, 200],
            visible: true,
            dimension: 0
        });
    storage.shape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 2);
    storage.shape.pos = pos;
    storage.shape.isBuilderStorage = true;
    storage.blip = mp.blips.new(1, pos, { color: 2, name: "Склад" });
    storage.blip.setRoute(true);
}

function createDestination(pos) {
    destination.marker = mp.markers.new(1, new mp.Vector3(pos.x, pos.y, pos.z - 1.3), 1.5,
        {
            direction: new mp.Vector3(pos.x, pos.y, pos.z - 0.5),
            rotation: 0,
            color: [255, 140, 18, 200],
            visible: true,
            dimension: 0
        });
    destination.shape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 2);
    destination.shape.pos = pos;
    destination.shape.isBuilderDestination = true;
    destination.blip = mp.blips.new(1, pos, { color: 81, name: "Пункт назначения" });
    destination.blip.setRoute(true);
}

function destroyStorage() {
    if (storage.blip) {
        storage.blip.destroy();
        storage.blip = null;
    }
    if (storage.marker) {
        storage.marker.destroy();
        storage.marker = null;
    }
    if (storage.shape) {
        storage.shape.destroy();
        storage.shape = null;
    }
}

function destroyDestination() {
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

function registerAttachments() {
    mp.attachmentMngr.register("buildingProp1", "prop_cardbordbox_05a", 11363, new mp.Vector3(0.2, 0.29, -0.55),
        new mp.Vector3(-10, 0, 0), {
        dict: "anim@heists@box_carry@",
        name: "idle",
        speed: 8,
        flag: 49
    }, true);

    mp.attachmentMngr.register("buildingProp2", "prop_barrel_01a", 11363, new mp.Vector3(0.2, 0.36, -0.3),
        new mp.Vector3(78, 0, 0), {
        dict: "anim@heists@box_carry@",
        name: "idle",
        speed: 8,
        flag: 49
    }, true);

    mp.attachmentMngr.register("buildingProp3", "prop_byard_pipe_01", 11363, new mp.Vector3(0.12, 0.08, -0.2),
        new mp.Vector3(-100, 0, 20), {
        dict: "anim@heists@box_carry@",
        name: "idle",
        speed: 8,
        flag: 49
    }, true);
}