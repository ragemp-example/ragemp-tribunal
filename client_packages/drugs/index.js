let checkpoint;
let shape;
let isEnter = false;
let drugsEnterInterval = null;

const peds = [
    {
        model: "ig_g",
        position: {
            x: -1451.723022,
            y: -647.001708,
            z: 29.638513,
        },
        heading: 30.9343,
        defaultScenario: 'WORLD_HUMAN_DRUG_DEALER'
    }
];

mp.events.add({
    'characterInit.done': () => {
        peds.forEach((ped) => {
            mp.events.call('NPC.create', ped);
        })
    },
    'drugs.coordinates.menu': (coordinatePrice) => {
        const items = [
            {
                text: 'Купить координаты',
                values: [`$${coordinatePrice}`]
            },
            {
                text: 'Закрыть'
            }
        ];
        mp.callCEFV(`selectMenu.setItems('drugsCoordinates', ${JSON.stringify(items)});`);
        mp.events.call('selectMenu.show', 'drugsCoordinates');
    },
    'drugs.coordinates.menu.close': () => {
        mp.callCEFV(`selectMenu.show = false`);
    },
    'drugs.sell.menu': () => {
        const items = [
            {
                text: 'Продать наркотики',
            },
            {
                text: 'Закрыть'
            }
        ];
        mp.callCEFV(`selectMenu.setItems('drugsSell', ${JSON.stringify(items)});`);
        mp.events.call('selectMenu.show', 'drugsSell');
    },
    'drugs.sell.menu.close': () => {
        mp.callCEFV(`selectMenu.show = false`);
    },
    'drugs.coordinates.buy': () => {
        // mp.callCEFV(`selectMenu.loader = true`);
        mp.events.callRemote('drugs.coordinates.buy');
    },
    'drugs.coordinates.buy.ans': (ans) => {
        // mp.callCEFV(`selectMenu.loader = false`);

        switch (ans) {
            case 0:
                mp.notify.error('Ошибка операции');
                break;
            case 1:
                mp.events.call('drugs.coordinates.menu.close');
                break;
            case 2:
                mp.notify.error('Недостаточно денег');
                break;
            case 3:
                mp.notify.error('Вы еще не нашли предыдущий груз');
                break;
            case 4:
                mp.notify.error('Доступных координат нет');
                break;
            case 5:
                mp.notify.error('Вы состоите в гос. организации');
                break;
        }
    },
    'drugs.sell': () => {
        // mp.callCEFV(`selectMenu.loader = true`);
        mp.events.callRemote('drugs.sell');
    },
    'drugs.sell.ans': (ans) => {
        // mp.callCEFV(`selectMenu.loader = false`);

        switch (ans) {
            case 0:
                mp.notify.error('Ошибка операции');
                break;
            case 1:
                break;
            case 2:
                mp.notify.error('У вас нет наркотиков на продажу');
                break;
            case 3:
                mp.notify.error('Вы состоите в гос. организации');
                break;
        }
    },
    'drugs.checkpoint.add': (point) => {
        if (shape) return;
        if (checkpoint) return;
        shape = mp.colshapes.newSphere(point.x, point.y, point.z + 1, 10);
        shape.pos = new mp.Vector3(point.x, point.y, point.z);
        shape.isDrugsCheckpoint = true;

        checkpoint = mp.blips.new(1, new mp.Vector3(point.x, point.y, point.z),
            {
                color: 69,
                name: 'Закладка',
                shortRange: false,
                dimension: mp.players.local.dimension
            });

        checkpoint.setRoute(true);
    },
    'drugs.checkpoint.delete': () => {
        checkpoint.destroy();
        checkpoint = null;
    },
    'playerEnterColshape': (colshape) => {
        if (colshape.isDrugsCheckpoint) {
            if (mp.players.local.vehicle) {
                if (!drugsEnterInterval) {
                    drugsEnterInterval = mp.timer.addInterval(() => {
                        if (!mp.players.local.vehicle) mp.events.call('drugs.checkpoint.enter');
                    }, 1000);
                }
                return mp.notify.error(`Выйдите из транспортного средства, чтобы подобрать груз`);
            }
            mp.events.call('drugs.checkpoint.enter');
        }
    },
    'playerExitColshape': (colshape) => {
        if (colshape.isDrugsCheckpoint) {
            if (!drugsEnterInterval) return;
            mp.timer.remove(drugsEnterInterval);
            drugsEnterInterval = null;
        }
    },
    'drugs.checkpoint.enter': () => {
        mp.events.callRemote('drugs.checkpoint.enter');
        checkpoint.destroy();
        shape.destroy();
        checkpoint = null;
        shape = null;
        if (!drugsEnterInterval) return;
        mp.timer.remove(drugsEnterInterval);
        drugsEnterInterval = null;
    }
});