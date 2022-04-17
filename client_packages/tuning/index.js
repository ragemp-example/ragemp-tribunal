let data = require('carshow/data.js');

mp.game.cam.doScreenFadeIn(50);

let colorIDs = [];
let colorValues = [];

let controlsDisabled = false;
let customsId;
let vehicle;

let vehPrice = 100;

let priceConfig = {
    color: 100,
    repair: 500,
    default: 0.01,
    engine: 0.01,
    brake: 0.01,
    transmission: 0.01,
    suspension: 0.01,
    armour: 0.01
}

let tuningParams = {
    primaryColour: -1,
    secondaryColour: -1,
    engineType: {
        modType: 11,
        current: -1,
        name: "Двигатель",
        defaultModNames: ['Стандарт', 'Улучшение СУД, уровень 1', 'Улучшение СУД, уровень 2',
            'Улучшение СУД, уровень 3', 'Улучшение СУД, уровень 4']
    },
    brakeType: {
        modType: 12,
        current: -1,
        name: "Тормоза",
        defaultModNames: ['Стандартные тормоза', 'Уличные тормоза', 'Спортивные тормоза',
            'Гоночные тормоза']
    },
    transmissionType: {
        modType: 13,
        current: -1,
        name: "Трансмиссия",
        defaultModNames: ['Стандартная трансмиссия', 'Уличная трансмиссия',
            'Спортивная трансмиссия', 'Гоночная трансмиссия']
    },
    suspensionType: {
        modType: 15,
        current: -1,
        name: "Подвеска",
        defaultModNames: ['Стандартная подвеска', 'Заниженная подвеска', 'Уличная подвеска',
            'Спортивная подвеска', 'Гоночная подвеска']
    },
    armourType: {
        modType: 16,
        current: -1,
        name: "Броня",
        defaultModNames: ['Нет', 'Усиление брони 20%', 'Усиление брони 40%', 'Усиление брони 60%',
            'Усиление брони 80%', 'Усиление брони 100%']
    },
    windowTint: {
        modType: 55,
        current: -1,
        name: "Тонировка",
        ignoreModGetter: true,
        defaultModNames: ['Нет', 'Слабое затемнение', 'Среднее затемнение', 'Лимузин']
    },
    xenon: {
        modType: 22,
        current: -1,
        name: "Фары",
        ignoreModGetter: true,
        defaultModNames: ['Обычные', 'Ксеноновые']
    },
    plateHolder: {
        modType: 62,
        current: -1,
        name: "Номерные знаки",
        ignoreModGetter: true,
        defaultModNames: ['Синий на белом 1', 'Желтый на черном', 'Желтый на синем',
            'Синий на белом 2', 'Синий на белом 3', 'Черный на белом']
    },
    neon: {
        modType: 100,
        current: -1,
        name: "Неон",
        ignoreModGetter: true,
        modelsToIgnore: [mp.game.joaat('gs350')],
        defaultModNames: ['Нет', 'Белый', 'Синий', '"Электрический голубой"', '"Мятно-зеленый"',
            'Лайм', 'Желтый', '"Золотой дождь"', 'Оранжевый', 'Красный', '"Розовый пони"',
            'Ярко-розовый', 'Фиолетовый']
    },
    turbo: {
        modType: 18,
        current: -1
    },
    spoiler: {
        modType: 0,
        current: -1,
        name: "Спойлер"
    },
    frontBumper: {
        modType: 1,
        current: -1,
        name: "Передний бампер"
    },
    rearBumper: {
        modType: 2,
        current: -1,
        name: "Задний бампер"
    },
    sideSkirt: {
        modType: 3,
        current: -1,
        name: "Пороги"
    },
    exhaust: {
        modType: 4,
        current: -1,
        name: "Глушитель"
    },
    frame: {
        modType: 5,
        current: -1,
        name: "Рама"
    },
    grille: {
        modType: 6,
        current: -1,
        name: "Решетка радиатора"
    },
    hood: {
        modType: 7,
        current: -1,
        name: "Капот"
    },
    fender: {
        modType: 8,
        current: -1,
        name: "Крыло"
    },
    rightFender: {
        modType: 9,
        current: -1,
        name: "Правое крыло",
        modelsToIgnore: [mp.game.joaat('imperator')]
    },
    roof: {
        modType: 10,
        current: -1,
        name: "Крыша",
        modelsToIgnore: [mp.game.joaat('revolter'), mp.game.joaat('imperator')]
    },
    frontWheels: {
        modType: 23,
        current: -1,
        name: "Колеса",
        modelsToIgnore: [mp.game.joaat('trophytruck')]
    },
    livery: {
        modType: 48,
        current: -1,
        name: "Покрасочные работы"
    },
}

let colorData = {
    primary: -1,
    secondary: -1
}

let currentModType;

let lastIndex = 0;

let ignoreModsGetterData;

let neonColors = [[222, 222, 255], [2, 21, 255], [3, 83, 255], [0, 255, 140],
[94, 255, 1], [255, 255, 0], [255, 150, 5], [255, 62, 0],
[255, 1, 1], [255, 50, 100], [255, 5, 190], [35, 1, 255]];

data.colors.forEach((current) => {
    colorIDs.push(current.id);
    colorValues.push(current.value);
});

mp.events.add('tuning.fadeOut', () => {
    mp.game.cam.doScreenFadeOut(80);
});

mp.events.add('tuning.start', (id, primary, secondary, priceInfo, ignoreData) => {
    mp.timer.add(() => {
        mp.game.cam.doScreenFadeIn(500);
    }, 500);

    if (!mp.players.local.vehicle) return;
    controlsDisabled = true;
    mp.events.call('hud.enable', false);
    mp.events.call('vehicles.speedometer.show', false);
    mp.game.ui.displayRadar(false);
    mp.callCEFR('setOpacityChat', [0.0]);
    customsId = id;
    vehicle = mp.players.local.vehicle;
    vehicle.freezePosition(true);
    tuningParams.primaryColour = primary;
    tuningParams.secondaryColour = secondary;
    colorData.primary = primary;
    colorData.secondary = secondary;
    initTuningParams();
    initPrices(priceInfo);
    ignoreModsGetterData = ignoreData;
    mp.events.call('tuning.menu.show');
});

mp.events.add('tuning.menu.show', (index = lastIndex) => {
    mp.callCEFV(`lsCustoms.menu.values = {
        repair: {
            title: "Ремонт авто",
            price: ${priceConfig.repair},
            handler() {
               mp.trigger('callRemote', 'tuning.repair');
            },
        },
        colors: {
            title: "Цвета",
            values: [],
            handler(index) {
                mp.trigger('tuning.colors.set', index, -1);
            },
        },
        secondaryColors: {
            title: "Доп. цвета",
            values: [],
            handler(index) {
                mp.trigger('tuning.colors.set', -1, index);
            },
        },
    }`);
    setColorValues();
    
    for (let key in tuningParams) {
        if (tuningParams[key].hasOwnProperty('name')) {
            if (tuningParams[key].hasOwnProperty('modelsToIgnore')) {
                if (tuningParams[key].modelsToIgnore.includes(vehicle.model)) continue;
            }
            if (vehicle.getNumMods(tuningParams[key].modType) > 0 || tuningParams[key].ignoreModGetter) {
                mp.callCEFV(`lsCustoms.menu.values.${key} =  {
                    title: '${tuningParams[key].name}',
                    modType: ${tuningParams[key].modType},
                    values: [],
                    handler(index) {
                        mp.trigger('tuning.buy', this.modType, index - 1);
                    }   
                }`);
                let data = tuningParams[key];
                let numMods = data.ignoreModGetter ? data.defaultModNames.length : vehicle.getNumMods(data.modType);
                let items = [];
                for (let i = -1; i < numMods; i++) {
                    let text;
                    if (tuningParams[key].hasOwnProperty("defaultModNames")) {
                        text = tuningParams[key].defaultModNames[i + 1];
                        if (!text) continue;
                    } else {
                        let label = mp.players.local.vehicle.getModTextLabel(data.modType, i);
                        text = mp.game.ui.getLabelText(label);
                        if (text == 'NULL') {
                            i != -1 ? text = `${data.name} ${i + 1}` : text = 'Нет';
                        }
                    }
                    items.push({
                        value: text,
                        price: calculatePrice(data.modType, i)
                    });
                }
                mp.callCEFV(`lsCustoms.setValues('${key}', ${JSON.stringify(items)})`);
            }
        }
    }
    mp.busy.add('lsc', false);
    mp.callCEFV('lsCustoms.show = true');
});

mp.events.add('tuning.colors.set', (primary, secondary) => {
    if (primary != -1) colorData.primary = primary;
    if (secondary != -1) colorData.secondary = secondary;
    mp.events.callRemote('tuning.colors.set', colorData.primary, colorData.secondary);
});

mp.events.add('tuning.colors.set.ans', (ans) => {
    mp.callCEFV('selectMenu.loader = false');
    switch (ans) {
        case 0:
            tuningParams.primaryColour = colorData.primary;
            tuningParams.secondaryColour = colorData.secondary;
            mp.notify.success('Автомобиль перекрашен');
            break;
        case 1:
            mp.notify.error('Недостаточно денег');
            break;
        case 2:
            mp.notify.error('Вы не в транспорте');
            break;
        case 3:
            mp.notify.error('Модификация недоступна');
            break;
        case 4:
            mp.notify.error('Ошибка покупки');
            break;
        case 5:
            mp.notify.error('В LSC кончились детали');
            break;
    }
});

mp.events.add('tuning.end', () => {
    lastIndex = 0;

    mp.events.call('vehicles.speedometer.show', true);
    vehicle.freezePosition(false);

    mp.events.call('hud.enable', true);
    mp.game.ui.displayRadar(true);
    mp.callCEFR('setOpacityChat', [1.0]);

    mp.events.callRemote('tuning.end', customsId);

    controlsDisabled = false;
    mp.busy.remove('lsc');
});

mp.events.add('tuning.mod.set', (type, index) => {
    if (type == -1) type = currentModType;
    if (type == 55) {
        vehicle.setWindowTint(index);
    } else if (type == 22) {
        let toggle = index != -1;
        vehicle.toggleMod(22, toggle);
    } else if (type == 62) {
        vehicle.setNumberPlateTextIndex(index + 1);
    } else if (type == 100) {
        setNeon(vehicle, index);
    } else if (type == 999) {
        vehicle.setColours(index + 1, tuningParams.secondaryColour);
    } else if (type == 1000) {
        vehicle.setColours(tuningParams.primaryColour, index + 1);
    } else {
        vehicle.setMod(type, index);
    }
});

mp.events.add('tuning.buy', (modType, modIndex) => {
    if (modType == -1) modType = currentModType;
    mp.events.callRemote('tuning.buy', modType, modIndex);
});

mp.events.add('tuning.buy.ans', (ans, mod, index) => {
    switch (ans) {
        case 0:
            if (ignoreModsGetterData.hasOwnProperty(tuningParams[mod].modType)) {
                ignoreModsGetterData[tuningParams[mod].modType] = index;
            } else {
                tuningParams[mod].current = index;
            }
            let current = ignoreModsGetterData.hasOwnProperty(tuningParams[mod].modType) ?
                ignoreModsGetterData[tuningParams[mod].modType] : tuningParams[mod].current;
            mp.events.call('tuning.mod.set', tuningParams[mod].modType, current);
            mp.callCEFV(`lsCustoms.updateSetMod('${mod}', ${index + 1})`);
            mp.notify.success('Элемент тюнинга установлен');
            break;
        case 1:
            mp.notify.error('Недостаточно денег');
            break;
        case 2:
            mp.notify.error('Вы не в транспорте');
            break;
        case 3:
            mp.notify.error('Модификация недоступна');
            break;
        case 4:
            mp.notify.error('Ошибка покупки');
            break;
        case 5:
            mp.notify.error('В LSC кончились детали');
            break;
    }
});


mp.events.add('tuning.item.update', (mod, index) => {
    mp.callCEFV(`selectMenu.menu.items[${index + 1}].values = ['$${calculatePrice(tuningParams[mod].modType, index)}']`);
});

mp.events.add('tuning.lastIndex.set', (index) => {
    lastIndex = index;
});

mp.events.add('tuning.repair.ans', (ans) => {
    switch (ans) {
        case 0:
            mp.notify.success('Автомобиль отремонтирован');
            break;
        case 1:
            mp.notify.error('Недостаточно денег');
            break;
        case 2:
            mp.notify.error('Вы не в транспорте');
            break;
        case 3:
            mp.notify.error('Модификация недоступна');
            break;
        case 4:
            mp.notify.error('Ошибка покупки');
            break;
        case 5:
            mp.notify.error('В LSC кончились детали');
            break;
    }
});

function initTuningParams() {
    for (let key in tuningParams) {
        if (tuningParams[key].hasOwnProperty('modType')) {
            tuningParams[key].current = mp.players.local.vehicle.getMod(tuningParams[key].modType);
        }
    }
}

mp.events.add('tuning.params.set', setCurrentParams);

mp.events.add('tuning.modType.set', (type) => {
    currentModType = type;
    mp.events.call('tuning.mod.set', -1, -1);
});

mp.events.add('render', () => {
    if (controlsDisabled) {
        mp.game.controls.disableControlAction(1, 200, true);
        mp.game.controls.disableControlAction(27, 75, true);
    }
});

mp.events.addDataHandler('plateHolder', (entity, value) => {
    entity.setNumberPlateTextIndex(value + 1);
});

mp.events.addDataHandler('neon', (entity, value) => {
    setNeon(entity, value);
});

mp.events.addDataHandler('xenon', (entity, value) => {
    setXenon(entity, value);
});

mp.events.add('entityStreamIn', (entity) => {
    if (entity.type == 'vehicle') {
        let plateHolder = entity.getVariable('plateHolder');
        if (plateHolder === null || plateHolder === undefined) plateHolder = -1;
        entity.setNumberPlateTextIndex(plateHolder + 1);

        let neon = entity.getVariable('neon');
        if (neon === null || neon === undefined) neon = -1;
        setNeon(entity, neon);

        let xenon = entity.getVariable('xenon');
        if (xenon === null || xenon === undefined) xenon = -1;
        setXenon(entity, xenon);
    }
});

function setCurrentParams() {
    vehicle.setColours(tuningParams.primaryColour, tuningParams.secondaryColour);
    for (let key in tuningParams) {
        if (tuningParams[key].hasOwnProperty('modType') && !tuningParams[key].ignoreModGetter) {
            vehicle.setMod(tuningParams[key].modType, tuningParams[key].current);
        }
    }
    vehicle.toggleMod(22, ignoreModsGetterData[22] != -1);
    vehicle.setWindowTint(ignoreModsGetterData[55]);
    vehicle.setNumberPlateTextIndex(ignoreModsGetterData[62] + 1);
    setNeon(vehicle, ignoreModsGetterData[100]);
}

function calculatePrice(modType, index) {
    let key;
    let i = index + 1;
    switch (modType) {
        case 11:
            key = 'engine';
            break;
        case 12:
            key = 'brake';
            break;
        case 13:
            key = 'transmission';
            break;
        case 15:
            key = 'suspension';
            break;
        case 16:
            key = 'armour';
            break;
        default:
            key = 'default';
            break;
    }

    let vehicle = mp.players.local.vehicle;
    let param;

    for (let key in tuningParams) {
        let current = tuningParams[key];
        if (current.hasOwnProperty('modType') && current.modType === modType) {
            param = current;
        }
    }

    let isSet = false;
    if (param.ignoreModGetter) {
        if (ignoreModsGetterData[modType] == index) {
            isSet = true;
        }
    } else {
        if (vehicle.getMod(modType) === index) {
            isSet = true;
        }
    }

    let price = parseInt(priceConfig[key] * vehPrice * i);
    return isSet ? price += ' - уст.' : price;
}

function initPrices(info) {
    vehPrice = info.veh;
    for (let key in info.config) {
        priceConfig[key] = info.config[key] * info.priceMultiplier;
    }
}

function setNeon(veh, index) {
    let enable = index != -1;
    [0, 1, 2, 3].forEach(element => {
        veh.setNeonLightEnabled(element, enable);
    });
    if (enable) {
        let color = neonColors[index];
        if (!color) return;
        veh.setNeonLightsColour(color[0], color[1], color[2]);
    }
}

function setXenon(veh, index) {
    let toggle = index != -1;
    veh.toggleMod(22, toggle);
}

function setColorValues() {
    let items = [];
    let price = priceConfig.color;
    colorValues.forEach(val => {
        items.push({
            value: val,
            price: price
        });
    });
    mp.callCEFV(`lsCustoms.setValues('secondaryColors', ${JSON.stringify(items)})`);
    mp.callCEFV(`lsCustoms.setValues('colors', ${JSON.stringify(items)})`);
}