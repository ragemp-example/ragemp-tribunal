let waitShape;
let waitMarker;

let destination;

const PRICE_PER_KM = 100;

let lastCallTime;
let minCallTime = 60 * 1000; /// промежуток для вызова

let isActiveTaxiClient = false;
mp.events.add('taxi.client.app.open', () => {
    mp.callCEFR('taxi.client.location', getClientLocation())
});

mp.events.add('taxi.client.app.search', () => {
    if (mp.players.local.vehicle) {
        mp.notify.error('Нельзя заказать такси из транспорта', 'Такси');
        mp.callCEFR('taxi.client.order.cancel', []);
        return;
    }
    let diff = Date.now() - lastCallTime;
    if (diff < minCallTime) {
        mp.notify.error(`Ожидайте ${parseInt((minCallTime - diff) / 1000)} секунд`, 'Такси');
        mp.callCEFR('taxi.client.order.cancel', []);
        return;
    }
    lastCallTime = Date.now();
    mp.events.callRemote('taxi.client.order.send');
});

mp.events.add('taxi.client.order.ans', (ans) => {
    switch (ans) {
        case 0:
            mp.notify.error('Нельзя заказать такси из транспорта', 'Такси');
            mp.callCEFR('taxi.client.order.cancel', []);
            break;
        case 1:
            mp.notify.error('Вы не на улице', 'Такси');
            mp.callCEFR('taxi.client.order.cancel', []);
            break;
        case 2:
            mp.notify.error('У вас недостаточно наличности', 'Такси');
            mp.callCEFR('taxi.client.order.cancel', []);
            break;
        case 3:
            mp.notify.error('Вы уже сделали заказ', 'Такси');
            mp.callCEFR('taxi.client.order.cancel', []);
            break;
        case 4:
            mp.notify.success('Заказ отправлен', 'Такси');
            mp.notify.warning('Не покидайте зону, выделенную зеленым', 'Такси');
            mp.events.call('taxi.client.waitshape.create');
            break;
    }
});

mp.events.add('taxi.client.waitshape.create', () => {
    let player = mp.players.local;

    waitMarker = mp.markers.new(1, new mp.Vector3(player.position.x, player.position.y, player.position.z - 9.5), 10, {
        direction: new mp.Vector3(player.position.x, player.position.y, player.position.z),
        rotation: 0,
        color: [131, 255, 92, 180],
        visible: true,
        dimension: 0
    });
    waitShape = mp.colshapes.newSphere(player.position.x, player.position.y, player.position.z, 5.5);
    waitShape.pos = new mp.Vector3(player.position.x, player.position.y, player.position.z);
    waitShape.isTaxiClientShape = true;
});

mp.events.add('taxi.client.waitshape.destroy', () => {
    if (waitMarker) {
        waitMarker.destroy();
        waitMarker = null;
    }
    if (waitShape) {
        waitShape.destroy();
        waitShape = null;
    }
});

mp.events.add('taxi.client.order.taken', (driverInfo) => {
    let info = {
        name: driverInfo.name,
        model: driverInfo.model,
        number: driverInfo.plate
    }
    mp.callCEFR('taxi.client.order.ans', [info]);
    mp.notify.success('Ваш заказ принят', 'Такси');
});

mp.events.add('taxi.client.car.ready', () => {
    mp.events.call('taxi.client.waitshape.destroy');
    mp.callCEFR('taxi.client.order.ready', []);
    mp.notify.success('Машина на месте, садитесь в такси', 'Такси');
});

mp.events.add('taxi.client.car.enter', () => {
    isActiveTaxiClient = true;
    mp.callCEFR('taxi.client.order.inTaxi', []);
    mp.notify.info('Поставьте метку на карте и подтвердите выбор в приложении', 'Такси');
    mp.events.call('chat.message.push', `!{#f3c800}Чтобы начать поездку, откройте карту и поставьте метку на пункте назначения`);
    mp.events.call('chat.message.push', `!{#80c102}После этого нажмите !{#009eec}"Подтвердить" !{#80c102}в приложении на телефоне`);
});

mp.events.add("playerExitColshape", (shape) => {
    if (shape.isTaxiClientShape) {
        mp.events.call('taxi.client.waitshape.leave');
    }
});

function getClientLocation() {
    let pos = mp.players.local.position;
    return [mp.utils.getRegionName(pos), mp.utils.getStreetName(pos)];
}

mp.events.add('taxi.client.waypoint.created', (position) => {
    mp.notify.info('Метка поставлена, подтвердите заказ в приложении', 'Такси');
    destination = position;
    let area = mp.utils.getRegionName(position);
    let street = mp.utils.getStreetName(position);
    let price = calculatePrice(position);
    mp.callCEFR('taxi.client.order.destination', [area, street, price]);

});

mp.events.add('taxi.client.app.confirm', () => {
    isActiveTaxiClient = false;
    destination = JSON.stringify(destination);
    mp.events.callRemote('taxi.client.app.confirm', destination);
});

mp.events.add('taxi.client.destination.reach', () => {
    mp.callCEFR('taxi.client.order.cancel', []);
});

mp.events.add('taxi.client.app.confirm.ans', (ans) => {
    switch (ans) {
        case 0:
            mp.notify.success('Данные переданы таксисту', 'Такси');
            break;
        case 1:
            mp.callCEFR('taxi.client.order.error', []);
            mp.notify.error('Недостаточно денег, выберите другое место', 'Такси');
            break;
    }
});

function calculatePrice(pos) {

    let price = Math.round((mp.vdist(mp.players.local.position, pos) / 1000) * PRICE_PER_KM);
    if (price < PRICE_PER_KM) price = PRICE_PER_KM;
    return price;
}

let waypoint;
mp.events.add("characterInit.done", () => {
    mp.timer.addInterval(() => {
        try {
            if (!isActiveTaxiClient) return;
            if (waypoint !== mp.game.invoke('0x1DD1F58F493F1DA5')) {
                waypoint = mp.game.invoke('0x1DD1F58F493F1DA5');
                let blipIterator = mp.game.invoke('0x186E5D252FA50E7D');
                let firstInfoId = mp.game.invoke('0x1BEDE233E6CD2A1F', blipIterator);
                let nextInfoId = mp.game.invoke('0x14F96AA50D6FBEA7', blipIterator);
                for (let i = firstInfoId; mp.game.invoke('0xA6DB27D19ECBB7DA', i) != 0; i = nextInfoId) {
                    if (mp.game.invoke('0xBE9B0959FFD0779B', i) == 4) {
                        var coord = mp.game.ui.getBlipInfoIdCoord(i);
                        mp.events.call("taxi.client.waypoint.created", coord);
                    };
                };
            };
        } catch (err) {
            mp.log(JSON.stringify(err.message));
        }
    }, 100);
});

mp.events.add('taxi.client.order.canceled', () => {
    mp.notify.error('Заказ отменен водителем', 'Такси');
    mp.events.call('taxi.client.waitshape.destroy');
    mp.callCEFR('taxi.client.order.cancel', []);
});

mp.events.add('taxi.client.app.cancel', () => {
    mp.events.call('taxi.client.order.cancel');
});

mp.events.add('taxi.client.order.cancel', () => {
    mp.notify.warning('Вы отменили заказ', 'Такси');
    mp.events.call('taxi.client.waitshape.destroy');
    mp.events.callRemote('taxi.client.order.cancel');
});

mp.events.add('taxi.client.car.leave', () => {
    mp.notify.warning('Вы покинули такси, заказ отменен', 'Такси');
    mp.events.call('taxi.client.waitshape.destroy');
    mp.callCEFR('taxi.client.order.cancel', []);
});

mp.events.add('taxi.client.waitshape.leave', () => {
    mp.notify.warning('Вы покинули зону ожидания, заказ отменен', 'Такси');
    mp.events.call('taxi.client.waitshape.destroy');
    mp.callCEFR('taxi.client.order.cancel', []);
    mp.events.callRemote('taxi.client.order.cancel');
});
