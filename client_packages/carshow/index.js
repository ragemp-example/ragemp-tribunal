let data = require('carshow/data.js');

let colorValues = [];

data.colors.forEach((current) => {
    colorValues.push(current.value);
});

let current;
let list = [];
let carShowInfo;
let currentIndex = 0;
let primary = 0, secondary = 0;
let camera;

let controlsDisabled = false;
let isTestDriving = false;

let updateTimeout;

mp.events.add('carshow.list.show', (inputList, inputInfo) => {

    if (!inputList[0]) return;
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
    mp.players.local.freezePosition(true);
    mp.events.call('hud.enable', false);
    mp.game.ui.displayRadar(false);
    mp.callCEFR('setOpacityChat', [0.0]);
    controlsDisabled = true;
    mp.busy.add('carshow', true);
    mp.prompt.showByName('carshow_control');
    mp.callCEFV(`carShop.colors.main.values = ${JSON.stringify(colorValues)}`);
    mp.callCEFV(`carShop.colors.additional.values = ${JSON.stringify(colorValues)}`);

    list = inputList;
    carShowInfo = inputInfo;
    camera = mp.cameras.new('default', new mp.Vector3(carShowInfo.cameraX, carShowInfo.cameraY, carShowInfo.cameraZ), new mp.Vector3(0, 0, 0), 70);
    camera.pointAtCoord(carShowInfo.toX, carShowInfo.toY, carShowInfo.toZ);
    camera.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);

    current = mp.vehicles.new(mp.game.joaat(list[currentIndex].vehiclePropertyModel), new mp.Vector3(carShowInfo.toX, carShowInfo.toY, carShowInfo.toZ));
    current.setHeading(carShowInfo.toH);
    current.setColours(primary, secondary);

    let models = inputList.map(x => {
        return {
            type: getModelClass(mp.game.joaat(x.vehiclePropertyModel)),
            name: x.properties.name,
            maxVelocity: getModelMaxSpeed(mp.game.joaat(x.vehiclePropertyModel)),
            fuelVolume: x.properties.maxFuel,
            price: x.properties.price,
            trunkCapacity: getTrunkCapacityByType(x.properties.trunkType)
        }
    });
    mp.callCEFV(`carShop.setVehicles(${JSON.stringify(models)})`);
    mp.callCEFV('carShop.show = true');
    if (currentIndex) {
        mp.callCEFV(`carShop.focusVehicle = carShop.vehicles[${currentIndex}]`);
    }
}
);

mp.events.add('render', () => {
    if (controlsDisabled) {
        mp.game.controls.disableControlAction(1, 200, true);
    }
});

mp.events.add('carshow.list.close', () => {
    mp.prompt.hide();
    current.destroy();
    camera.setActive(false);
    camera.destroy();
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
    mp.players.local.freezePosition(false);
    mp.events.call('hud.enable', true);
    mp.game.ui.displayRadar(true);
    mp.callCEFV(`carShop.show = false`);
    controlsDisabled = false;
    mp.busy.remove('carshow');
    mp.callCEFR('setOpacityChat', [1.0]);
    mp.events.callRemote('carshow.list.close', carShowInfo.sqlId);
    currentIndex = 0;
    primary = 0;
    secondary = 0;
});

mp.events.add('carshow.vehicle.show', (i) => {
    mp.timer.remove(updateTimeout);
    updateTimeout = mp.timer.add(() => {
        currentIndex = i;
        current.destroy();
        if (current) {
            current = mp.vehicles.new(mp.game.joaat(list[i].vehiclePropertyModel), new mp.Vector3(carShowInfo.toX, carShowInfo.toY, carShowInfo.toZ));
            current.setHeading(carShowInfo.toH);
            current.setColours(primary, secondary);
        }
    }, 300);
});

mp.events.add('carshow.vehicle.color', (color1, color2) => {
    if (color1 != -1) primary = color1;
    if (color2 != -1) secondary = color2;
    current.setColours(primary, secondary);
});

mp.events.add("carshow.car.buy", () => {
    mp.events.callRemote('carshow.car.buy', list[currentIndex].sqlId, primary, secondary);
});


mp.events.add("carshow.testdrive.start", () => {
    current.destroy();
    camera.setActive(false);
    camera.destroy();
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
    mp.players.local.freezePosition(false);
    mp.events.call('hud.enable', true);
    mp.game.ui.displayRadar(true);
    mp.callCEFV(`carShop.show = false`);
    controlsDisabled = false;
    mp.busy.remove('carshow');
    mp.callCEFR('setOpacityChat', [1.0]);
    mp.events.callRemote('carshow.testdrive.start', list[currentIndex].vehiclePropertyModel, primary, secondary);
    mp.players.local.setProofs(true, true, true, true, true, true, true, true);
});


mp.events.add("carshow.testdrive.started", () => {
    isTestDriving = true;
});

mp.events.add("carshow.car.buy.ans", (ans, carInfo, parkingInfo) => {
    mp.events.call('carshow.list.close');
    switch (ans) {
        case 1:
            mp.notify.success('Вы приобрели транспорт', 'Успех');
            mp.events.call('chat.message.push', `!{#80c102}Вы успешно приобрели транспортное средство !{#009eec}${carInfo.properties.name}`);
            mp.events.call('chat.message.push', `!{#f3c800}Транспорт доставлен на подземную парковку !{#009eec}${parkingInfo.name}`);
            mp.events.call('chat.message.push', '!{#f3c800}Местоположение парковки отмечено на карте');
            mp.game.ui.setNewWaypoint(parkingInfo.x, parkingInfo.y);
            //mp.events.call('carshow.list.close');
            break;
        case 2:
            mp.notify.error('Недостаточно денег', 'Ошибка');
            break;
        case 3:
            mp.notify.error('Операция не прошла', 'Ошибка');
            break;
        case 4:
            mp.notify.error('Неизвестная ошибка', 'Ошибка');
            break;
        case 5:
            mp.notify.error('Достигнут лимит на т/с', 'Ошибка');
            break;
        case 6:
            mp.notify.success('Вы приобрели транспорт', 'Успех');
            mp.events.call('chat.message.push', `!{#80c102}Вы успешно приобрели транспортное средство !{#009eec}${carInfo.properties.name}`);
            mp.events.call('chat.message.push', `!{#f3c800}Транспорт доставлен !{#009eec}к вашему дому`);
           // mp.events.call('carshow.list.close');
            break;
        case 7: // нельзя выдать ключи в инвентарь
            mp.notify.error(carInfo.text, `Инвентарь`);
            break;
    }
    mp.callCEFV(`selectMenu.loader = false;`);
});

function getModelClass(model) {
    return mp.game.ui.getLabelText(`VEH_CLASS_${mp.game.vehicle.getVehicleClassFromName(model)}`);
}

function getModelMaxSpeed(model) {
    return (mp.game.vehicle.getVehicleModelMaxSpeed(model) * 3.6 * 1.05).toFixed(0);
}
function getTrunkCapacityByType(type) {
    switch (type) {
        case 1:
            return 240;
        case 2:
            return 360;
        case 0:
            return 120;
    }
}

mp.keys.bind(0x08, true, () => { //esc
    if (isTestDriving) {
        isTestDriving = false;
        mp.events.callRemote('carshow.testdrive.stop');
    }
});

mp.keys.bind(0x1B, false, () => { //esc
    if (controlsDisabled && !isTestDriving) {
        mp.events.call('carshow.list.close');
    }
});