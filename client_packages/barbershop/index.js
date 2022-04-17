let config = require('barbershop/data.js');

let isInBarbershopShape = false;
let controlsDisabled = false;
let player = mp.players.local;
let currentGender = 0;
let currentColorType = 0;
let bType = 1;
let prices;

let rotation = {
    left: false,
    right: false
}

let appearance = {
    hairstyle: 0,
    hairColor: 0,
    hairHighlightColor: 0,
    facialHair: 0,
    facialHairColor: 0
}

let current = {
    hairstyle: 0,
    hairColor: 0,
    hairHighlightColor: 0,
    facialHair: 0,
    facialHairColor: 0
}
mp.events.add('barbershop.shape', (enter) => {
    isInBarbershopShape = enter;
});

mp.keys.bind(0x45, true, () => {
    if (isInBarbershopShape) {
        if (mp.busy.includes()) return;

        let isCuffed = mp.players.local.getVariable('cuffs') || false;
        if (isCuffed) return;

        mp.events.callRemote('barbershop.enter');
    }
});

mp.events.add('barbershop.enter', (shopData, gender, appearanceData, priceData) => {
    bindKeys(true);
    bType = shopData.bType;
    controlsDisabled = true;
    mp.events.call('hud.enable', false);
    mp.game.ui.displayRadar(false);
    mp.callCEFR('setOpacityChat', [0.0]);
    prices = priceData;
    currentGender = gender;
    initCurrentAppearanceParams(appearanceData);
    mp.events.call('barbershop.mainMenu.show');
    clearClothes();
    mp.utils.cam.create(shopData.camera.x, shopData.camera.y, shopData.camera.z, shopData.pos.x, shopData.pos.y, shopData.pos.z + 0.6, 40);

    player.position = new mp.Vector3(shopData.pos.x, shopData.pos.y, shopData.pos.z);
    player.freezePosition(true);
    mp.timer.add(() => {
        player.setHeading(shopData.pos.h);
        mp.prompt.show('Используйте <span>A</span> и <span>D</span> для того, чтобы вращать персонажа');
    }, 100);
});

mp.events.add('barbershop.exit', () => {
    bindKeys(false);
    mp.utils.cam.destroy();
    mp.events.call('hud.enable', true);
    mp.game.ui.displayRadar(true);
    mp.callCEFR('setOpacityChat', [1.0]);
    player.freezePosition(false);
    controlsDisabled = false;
    mp.callCEFV(`selectMenu.show = false`);
    mp.events.callRemote('barbershop.exit');
});

mp.events.add('render', () => {
    if (controlsDisabled) {
        mp.game.controls.disableControlAction(0, 21, true); /// бег
        mp.game.controls.disableControlAction(0, 22, true); /// прыжок
        mp.game.controls.disableControlAction(0, 31, true); /// вперед назад
        mp.game.controls.disableControlAction(0, 30, true); /// влево вправо
        mp.game.controls.disableControlAction(0, 24, true); /// удары
        mp.game.controls.disableControlAction(1, 200, true); // esc
        mp.game.controls.disableControlAction(0, 140, true); /// удары R
        mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2
    }

    if (rotation.left) player.setHeading(player.getHeading() - 2);
    if (rotation.right) player.setHeading(player.getHeading() + 2);
});

mp.events.add('barbershop.mainMenu.show', () => {
    setCurrentAppearanceParams();
    let items = [{
        text: 'Прически'
    },
    {
        text: 'Цвет волос'
    },
    {
        text: 'Доп. цвет волос'
    },
    ];

    if (currentGender == 0) {
        items.push({
            text: 'Растительность на лице'
        },
            {
                text: 'Цвет растительности на лице'
            }
        )
    }
    items.push({
        text: 'Выйти'
    });

    mp.callCEFV(`selectMenu.setItems('barbershopMain', ${JSON.stringify(items)});`)
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["barbershopMain"])`);
    mp.callCEFV(`selectMenu.menu.headerImg = '${getHeaderImageByType()}'`);
    mp.callCEFV(`selectMenu.show = true`);

});


mp.events.add('barbershop.hairstylesMenu.show', () => {

    let items = [];

    let hairstyles = config.hairList[currentGender];

    hairstyles.forEach((current) => {
        items.push({
            text: current.name,
            values: [`$${prices.hairstylePrice}`]
        });
    });

    items.push({
        text: 'Назад'
    });

    player.setComponentVariation(2, 0, 0, 2);
    mp.callCEFV(`selectMenu.setItems('barbershopHairstyles', ${JSON.stringify(items)});`)
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["barbershopHairstyles"])`);
    mp.callCEFV(`selectMenu.menu.headerImg = '${getHeaderImageByType()}'`);
    mp.callCEFV(`selectMenu.show = true`);

});

mp.events.add('barbershop.hairstyle.set', (index) => {
    let hairstyles = config.hairList[currentGender];
    let variation = hairstyles[index].id;
    player.setComponentVariation(2, variation, 0, 2);
});

mp.events.add('barbershop.hairstyle.buy', (index) => {
    mp.callCEFV('selectMenu.loader = true');
    let hairstyles = config.hairList[currentGender];
    let hairstyleId = hairstyles[index].id;
    current.hairstyle = hairstyleId;
    mp.events.callRemote('barbershop.hairstyle.buy', hairstyleId);
});

mp.events.add('barbershop.hairstyle.buy.ans', (ans) => {
    mp.callCEFV('selectMenu.loader = false');
    switch (ans) {
        case 0:
            appearance.hairstyle = current.hairstyle;
            mp.callCEFV(`selectMenu.notification = 'Прическа сделана'`);
            break;
        case 1:
            mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
            break;
        case 2:
            mp.callCEFV(`selectMenu.notification = 'Ошибка покупки'`);
            break;
        case 3:
            mp.callCEFV(`selectMenu.notification = 'В парикмахерской кончились ресурсы'`);
            break;
    }
});

mp.events.add('barbershop.facialHairMenu.show', () => {

    let items = [];

    let facialHairList = config.facialHairList;

    facialHairList.forEach((current) => {
        items.push({
            text: current,
            values: [`$${prices.facialHairPrice}`]
        });
    });

    items.push({
        text: 'Назад'
    });
    player.setHeadOverlay(1, 255, 1.0, appearance.facialHairColor, 0);
    mp.callCEFV(`selectMenu.setItems('barbershopFacialHair', ${JSON.stringify(items)});`)
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["barbershopFacialHair"])`);
    mp.callCEFV(`selectMenu.menu.headerImg = '${getHeaderImageByType()}'`);
    mp.callCEFV(`selectMenu.show = true`);
});

mp.events.add('barbershop.facialHair.set', (index) => {
    index == 0 ? index = 255 : index -= 1;
    player.setHeadOverlay(1, index, 1.0, appearance.facialHairColor, 0);
});

mp.events.add('barbershop.facialHair.buy', (index) => {
    mp.callCEFV('selectMenu.loader = true');
    index == 0 ? index = 255 : index -= 1;
    current.facialHair = index;
    mp.events.callRemote('barbershop.facialHair.buy', index);
});

mp.events.add('barbershop.facialHair.buy.ans', (ans) => {
    mp.callCEFV('selectMenu.loader = false');
    switch (ans) {
        case 0:
            appearance.facialHair = current.facialHair;
            mp.callCEFV(`selectMenu.notification = 'Борода заменена'`);
            break;
        case 1:
            mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
            break;
        case 2:
            mp.callCEFV(`selectMenu.notification = 'Ошибка покупки'`);
            break;
        case 3:
            mp.callCEFV(`selectMenu.notification = 'В парикмахерской кончились ресурсы'`);
            break;
    }
});

mp.events.add('barbershop.colorMenu.show', (type = currentColorType) => {
    currentColorType = type;
    let colorList = config.hairColorList;
    switch (currentColorType) {
        case 0:
            player.setHairColor(0, appearance.hairHighlightColor);
            break;
        case 1:
            player.setHairColor(appearance.hairColor, 0);
            break;
        case 2:
            player.setHeadOverlay(1, appearance.facialHair, 1.0, 0, 0)
            break;
    }
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["barbershopColor"])`);
    mp.callCEFVN({ "selectMenu.menu.items[1].values": [`$${prices.colorChangePrice}`] });
    mp.callCEFVN({ "selectMenu.menu.items[0].values": colorList });
    mp.callCEFV(`selectMenu.menu.headerImg = '${getHeaderImageByType()}'`);
    mp.callCEFV(`selectMenu.show = true`);
});

mp.events.add('barbershop.color.set', (color) => {
    switch (currentColorType) {
        case 0:
            player.setHairColor(color, appearance.hairHighlightColor);
            break;
        case 1:
            player.setHairColor(appearance.hairColor, color);
            break;
        case 2:
            player.setHeadOverlay(1, appearance.facialHair, 1.0, color, 0)
            break;
    }
});

mp.events.add('barbershop.color.buy', (index) => {
    mp.callCEFV('selectMenu.loader = true');
    switch (currentColorType) {
        case 0:
            current.hairColor = index;
            break;
        case 1:
            current.hairHighlightColor = index;
            break;
        case 2:
            current.facialHairColor = index;
            break;
    }
    mp.events.callRemote('barbershop.color.buy', currentColorType, index);
});

mp.events.add('barbershop.color.buy.ans', (ans) => {
    mp.callCEFV('selectMenu.loader = false');
    switch (ans) {
        case 0:
            appearance.hairColor = current.hairColor;
            mp.callCEFV(`selectMenu.notification = 'Цвет изменен'`);
            break;
        case 1:
            appearance.hairHighlightColor = current.hairHighlightColor;
            mp.callCEFV(`selectMenu.notification = 'Цвет изменен'`);
            break;
        case 2:
            appearance.facialHairColor = current.facialHairColor;
            mp.callCEFV(`selectMenu.notification = 'Цвет изменен'`);
            break;
        case 3:
            mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
            break;
        case 4:
            mp.callCEFV(`selectMenu.notification = 'Ошибка покупки'`);
            break;
        case 5:
            mp.callCEFV(`selectMenu.notification = 'В парикмахерской кончились ресурсы'`);
            break;
    }
});

function setCurrentAppearanceParams() {
    player.setComponentVariation(2, appearance.hairstyle, 0, 2);
    player.setHeadOverlay(1, appearance.facialHair, 1.0, appearance.facialHairColor, 0)
    player.setHairColor(appearance.hairColor, appearance.hairHighlightColor);
}

function initCurrentAppearanceParams(data) {
    appearance.hairstyle = data.hairstyle;
    appearance.facialHair = player.getHeadOverlayValue(1);
    appearance.hairColor = data.hairColor;
    appearance.hairHighlightColor = data.hairHighlightColor;
    appearance.facialHairColor = data.facialHairColor;
}

function bindKeys(bind) {
    if (bind) {
        mp.keys.bind(0x41, true, startRotationLeft); // A
        mp.keys.bind(0x41, false, stopRotationLeft); // A
        mp.keys.bind(0x44, true, startRotationRight); // D
        mp.keys.bind(0x44, false, stopRotationRight); // D
    } else {
        mp.keys.unbind(0x41, true, startRotationLeft); // A
        mp.keys.unbind(0x41, false, stopRotationLeft); // A
        mp.keys.unbind(0x44, true, startRotationRight); // D
        mp.keys.unbind(0x44, false, stopRotationRight); // D
        rotation.left = false;
        rotation.right = false;
    }
}

function startRotationLeft() {
    rotation.left = true;
}

function stopRotationLeft() {
    rotation.left = false;
}

function startRotationRight() {
    rotation.right = true;
}

function stopRotationRight() {
    rotation.right = false;
}

function getHeaderImageByType(type = bType) {
    switch (type) {
        case 1:
            return "beachcombover.png";
        case 2:
            return "herrkutz.png";
        case 3:
            return "haironhawick.png";
        case 4:
            return "osheas.png"
    }
}

function clearClothes() {
        player.setComponentVariation(1, 0, 0, 0);
        player.clearAllProps();
}
