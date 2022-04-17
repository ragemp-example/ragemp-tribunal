let lastDimension = 0;
let destination = null;
let buyers;
let buyerIndex = null;

mp.robberies = {
    isInRobberyShape: false
}

mp.events.add({
    'robberies.shape.enter': (enter) => {
        mp.robberies.isInRobberyShape = enter;
        if (enter) {
            mp.prompt.show('Нажмите <span>E</span> для того, чтобы взять коробку');
        } else {
            mp.prompt.hide();
        }
    },
    // Временное решение для фикса пропадания аттача при смене измерения
    'time.main.tick': () => {
        let newDimension = mp.players.local.dimension;
        if (newDimension != lastDimension) {
            lastDimension = newDimension;
            if (mp.players.local.hasAttachment('robberyBox')) {
                mp.events.callRemote('robberies.box.update');
            }
        }
    },
    'robberies.box.taken': () => {
        mp.prompt.show(`Отнесите коробку в грузовик и нажмите <span>B</span> для погрузки`)
    },
    'robberies.destination.create': () => {
        if (destination) return;

        let index;

        if (buyerIndex === null) {
            index = mp.utils.randomInteger(0, buyers.length - 1);
            buyerIndex = index;
        } else {
            index = buyerIndex;
        }
        let buyer = buyers[index];

        destination = {};
        let pos = buyer.shapePos;
        destination.blip = mp.blips.new(108, pos, {color: 71, name: "Продажа награбленного"});
        destination.blip.setRoute(true);

        destination.marker = mp.markers.new(1, new mp.Vector3(pos.x, pos.y, pos.z - 8), 12,
            {
                direction: new mp.Vector3(pos.x, pos.y, pos.z),
                rotation: 0,
                color: [255, 234, 0, 190],
                visible: true,
                dimension: 0
            });

        destination.shape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 6);
        destination.shape.isRobberyDestination = true;

        mp.notify.info('Когда вы загрузите достаточно ящиков, отвезите автомобиль на пункт продажи');
    },
    'playerEnterColshape': (shape) => {
        if (shape.isRobberyDestination) {
            destroyDestination();
            mp.prompt.show('Нажмите <span>B</span> рядом с машиной, чтобы взять из нее ящик');
        }
    },
    'house.action': (type, id) => {
        if (type === 'robbery') {
            mp.events.callRemote('robberies.start', true, id);
        }
    },
    'biz.action': (type, id) => {
        if (type === 'robbery') {
            mp.events.callRemote('robberies.start', false, id);
        }
    },
    'robberies.destination.destroy': () => {
        destroyDestination();
    },
    'robberies.peds.init': (peds) => {
        buyers = peds;
        peds.forEach(el => {
            let ped = {
                model: "csb_grove_str_dlr",
                position: {
                    x: el.pedPos.x,
                    y: el.pedPos.y,
                    z: el.pedPos.z,
                },
                heading: el.pedRot,
                defaultScenario: 'WORLD_HUMAN_AA_SMOKE'
            };
            mp.events.call('NPC.create', ped);
        })
    },
    'robberies.index.update': (index) => {
        buyerIndex = index;
    }
});

function destroyDestination() {
    if (!destination) return;
    if (destination.blip) {
        destination.blip.destroy();
        destination.blip = null;
    }
    if (destination.shape) {
        destination.shape.destroy();
        destination.shape = null;
    }
    if (destination.marker) {
        destination.marker.destroy();
        destination.marker = null;
    }
    destination = null;
}

mp.keys.bind(0x42, true, () => {
    if (mp.players.local.vehicle) return;
    if ((mp.busy.includes() == 1 && mp.busy.includes('lostAttach')) || !mp.busy.includes()) {
        let vehicle = mp.utils.getNearVehicle(mp.players.local.position, 5);
        if (!vehicle) return;
        if (!vehicle.getVariable('robberyVehicle')) return;

        if (mp.players.local.hasAttachment('robberyBox')) {
            mp.events.callRemote('robberies.box.put', vehicle.remoteId);
        } else {
            mp.events.callRemote('robberies.box.takeFromVeh', vehicle.remoteId);
        }
    }
});