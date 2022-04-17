let isInFuelStationColshape = false;

let pricePerLiter;

mp.events.add('fuelstations.shape.enter', (price) => {
    isInFuelStationColshape = true;
    pricePerLiter = price;
});

mp.events.add('fuelstations.shape.leave', () => {
    isInFuelStationColshape = false;
    mp.events.call('fuelstations.menu.close');
});

mp.keys.bind(0x45, true, () => { /// E
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    if (isInFuelStationColshape) {
        let player = mp.players.local;
        let vehicle = player.vehicle;
        if (vehicle && vehicle.getPedInSeat(-1) == player.handle) {
            mp.busy.add('fuel', true);
            mp.callCEFV(`gasStation.pricePerLiter = ${pricePerLiter}`);
            mp.callCEFV('gasStation.show = true');
            
        } else {
            mp.prompt.showByName('fuelstation_control');
        }
    }
});

mp.events.add('fuelstations.close', () => {
    mp.busy.remove('fuel');
});

mp.events.add('fuelstations.fill.litres.ans', (ans, data) => {
    switch (ans) {
        case 0:
            mp.notify.error('Вы не на АЗС', 'Ошибка');
            break;
        case 1:
            mp.notify.error('Вы не в транспорте', 'Ошибка');
            break;
        case 2:
            mp.notify.warning('Заправка не требуется', 'Бак полон');
            break;
        case 3:
            mp.notify.success(`Заправлено ${data.litres} л за $${data.total}`, 'АЗС');
            break;
        case 4:
            mp.notify.error(`Недостаточно денег`, 'Ошибка');
            break;
        case 5:
            mp.notify.error(`Не удалось заправиться`, 'Ошибка');
            break;
        case 6:
            mp.notify.error(`Некорректное значение`, 'Ошибка');
            break;
        case 7:
            mp.notify.error(`Бак не вмещает столько бензина`, 'Ошибка');
            break;
        case 8:
            mp.notify.error(`На заправке кончилось топливо`, 'АЗС');
            break;
        case 9:
            mp.notify.error(`Нельзя заправить электромобиль`, 'АЗС');
            break;
        case 10:
            mp.notify.success(`Заправлено ${data.litres} л за счет вашей организации`, 'АЗС');
            break;
    }
});

mp.events.add('fuelstations.fill.fulltank.ans', (ans, data) => {
    switch (ans) {
        case 0:
            mp.notify.error('Вы не на АЗС', 'Ошибка');
            break;
        case 1:
            mp.notify.error('Вы не в транспорте', 'Ошибка');
            break;
        case 2:
            mp.notify.warning('Заправка не требуется', 'Бак полон');
            break;
        case 3:
            mp.notify.success(`Заправлено ${data.litres} л за $${data.total}`, 'АЗС');
            break;
        case 4:
            mp.notify.error(`Недостаточно денег`, 'Ошибка');
            break;
        case 5:
            mp.notify.error(`Не удалось заправиться`, 'Ошибка');
            break;
        case 6:
            mp.notify.error(`На заправке кончилось топливо`, 'АЗС');
            break;
        case 7:
            mp.notify.error(`Нельзя заправить электромобиль`, 'АЗС');
            break;
        case 8:
            mp.notify.success(`Заправлено ${data.litres} л за счет вашей организации`, 'АЗС');
            break;
    }
});