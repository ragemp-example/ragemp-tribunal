let player = mp.players.local;
let playerIsFrozen = false;

let clothesLoaded = 0;
let clothesList = {
    "bracelets": [],
    "ears": [],
    "glasses": [],
    "watches": [],
    "ties": [],
    "hats": [],
    "tops": [],
    "pants": [],
    "shoes": [],
}
let shopClass;
let priceMultiplier;
// let currentItem = {
//     group: 0,
//     index: 0,
//     textureIndex: 0
// };

let hairInfo = {};

let input = {
    clothes: {
        4: {
            drawable: 0,
            texture: 0
        },
        6: {
            drawable: 0,
            texture: 0
        },
        7: {
            drawable: 0,
            texture: 0
        },
        11: {
            drawable: 0,
            texture: 0
        },
        3: {
            drawable: 0,
            texture: 0
        },
        8: {
            drawable: 0,
            texture: 0
        },
    },
    props: {
        7: {
            drawable: 0,
            texture: 0
        },
        2: {
            drawable: 0,
            texture: 0
        },
        1: {
            drawable: 0,
            texture: 0
        },
        0: {
            drawable: 0,
            texture: 0
        },
        6: {
            drawable: 0,
            texture: 0
        },
    }
}

let clothesInfo = {
    "bracelets": {
        prop: 7,
        menuName: 'Bracelets',
        name: 'Браслеты'
    },
    "ears": {
        prop: 2,
        menuName: 'Ears',
        name: 'Серьги'
    },
    "glasses": {
        prop: 1,
        menuName: 'Glasses',
        name: 'Очки'
    },
    "hats": {
        prop: 0,
        menuName: 'Hats',
        name: 'Головные уборы'
    },
    "pants": {
        component: 4,
        menuName: 'Pants',
        name: 'Ноги'
    },
    "shoes": {
        component: 6,
        menuName: 'Shoes',
        name: 'Обувь'
    },
    "ties": {
        component: 7,
        menuName: 'Ties',
        name: 'Галстуки'
    },
    "tops": {
        component: 11,
        menuName: 'Tops',
        name: 'Тело'
    },
    "watches": {
        prop: 6,
        menuName: 'Watches',
        name: 'Часы'
    },
}

let rotation = {
    left: false,
    right: false
}

let debugMode = false;
let debugText;

mp.events.add({
    'clothingShop.enter': (shopData) => {
        getInputClothes();
        player.setComponentVariation(1, 0, 0, 0); /// убираем маску
        bindKeys(true);
        setHeaders(shopData.bType);
        initCurrentHair(shopData.appearance);
        setHair();
        mp.events.call('hud.enable', false);
        mp.game.ui.displayRadar(false);
        mp.callCEFR('setOpacityChat', [0.0]);
        mp.utils.cam.create(shopData.camera.x, shopData.camera.y, shopData.camera.z, shopData.pos.x, shopData.pos.y, shopData.pos.z, 42);
        mp.callCEFV('loader.show = false');
        shopClass = shopData.class;
        priceMultiplier = shopData.priceMultiplier;
        initMainMenu();
        mp.events.call('selectMenu.show', 'clothingMain');
        player.position = new mp.Vector3(shopData.pos.x, shopData.pos.y, shopData.pos.z);
        if (!playerIsFrozen) {
            mp.utils.disablePlayerMoving(true);
            player.freezePosition(true);
        }
        mp.timer.add(() => {
            player.setHeading(shopData.pos.h);
            mp.prompt.show('Используйте <span>A</span> и <span>D</span> для того, чтобы вращать персонажа');
        }, 100);
    },
    'clothingShop.exit': () => {
        playerIsFrozen = false;
        mp.events.call(`selectMenu.hide`);
        bindKeys(false);
        mp.utils.cam.destroy();
        mp.events.call('hud.enable', true);
        mp.game.ui.displayRadar(true);
        mp.callCEFR('setOpacityChat', [1.0]);
        player.freezePosition(false);
        mp.utils.disablePlayerMoving(false);
        
        debugText = null;

        mp.events.callRemote('clothingShop.exit');
    },
    'render': () => {
        if (rotation.left) player.setHeading(player.getHeading() - 2);
        if (rotation.right) player.setHeading(player.getHeading() + 2);

        if (debugText) {
            mp.game.graphics.drawText(debugText, [0.2, 0.5], {
                font: 0,
                color: [255, 240, 28, 255],
                scale: [0.4, 0.4],
                outline: true
            });
        }
    },
    'clothingShop.list.get': (key, list) => {
        clothesList[key] = list;
        clothesLoaded++;
        if (clothesLoaded == 9) {
            clothesLoaded = 0;
            mp.events.callRemote('clothingShop.enter');
        }
    },
    'clothingShop.player.freeze': () => {
        mp.callCEFV('loader.show = true');
        mp.utils.disablePlayerMoving(true);
        player.freezePosition(true);
        playerIsFrozen = true;
    },
    'clothingShop.item.set': (group, index, textureIndex) => {
        // currentItem.group = group;
        // currentItem.index = index;
        // currentItem.textureIndex = textureIndex;

        let sortedList = clothesList[group].filter(x => x.class == shopClass);
        let item = sortedList[index];

        if (debugMode) {
            debugText = '';
            if (item.pockets) {
                debugText += `Карманы ${item.pockets} \n`
            }
            if (item.clime) {
                debugText += `Климат ${item.clime}`
            }
        }

        let notif = '';
        if (item.clime) {
            notif += `Климат: от ${item.clime[0]} до ${item.clime[1]} °C`
        }
        if (item.pockets) {
            notif += ` | Вместимость: ${calculateCapacity(item.pockets)} ед.`
        }

        if (notif.length) mp.callCEFV(`selectMenu.notification = '${notif}'`);     
        setClothes(group, item, textureIndex);
    },
    'clothingShop.inputClothes.set': setInputClothes,
    'clothingShop.item.buy': (group, index, textureIndex) => {
        let sortedList = clothesList[group].filter(x => x.class == shopClass);
        let item = sortedList[index];
        mp.events.callRemote('clothingShop.item.buy', group, item.id, textureIndex);
    },
    'clothingShop.item.buy.ans': (ans, data) => {
        mp.callCEFV(`selectMenu.loader = false`);
        switch (ans) {
            case 0:
                mp.callCEFV(`selectMenu.notification = 'Предмет добавлен в инвентарь'`);
                break;
            case 1:
                mp.callCEFV(`selectMenu.notification = 'Предмет не найден'`);
                break;
            case 2:
                mp.callCEFV(`selectMenu.notification = \`${data}\``);
                break;
            case 4:
                mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
                break;
            case 5:
                mp.callCEFV(`selectMenu.notification = 'Ошибка финансовой операции'`);
                break;
            case 6:
                mp.callCEFV(`selectMenu.notification = 'В магазине кончилась одежда'`);
                break;
        }
    }
});


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

function setHeaders(type) {
    let img;
    switch (type) {
        case 0:
            img = 'binco';
            break;
        case 1:
            img = 'discount';
            break;
        case 2:
            img = 'suburban';
            break;
        case 3:
            img = 'ponsonbys';
            break;
    }
    ['Main', 'Tops', 'Bracelets', 'Ears', 'Glasses', 'Watches', 'Ties', 'Hats', 'Pants', 'Shoes']
    .forEach(name => mp.callCEFV(`selectMenu.menus["clothing${name}"].headerImg = '${img}.png'`));
}

function initMainMenu() {
    let items = [];
    for (let key in clothesList) {
        let sortedList = clothesList[key].filter(x => x.class == shopClass);
        if (sortedList.length > 0) {
            items.push({
                text: clothesInfo[key].name
            });
            initSubMenu(key, sortedList);
        }
    }
    items.push({
        text: 'Закрыть'
    });
    mp.callCEFV(`selectMenu.setItems('clothingMain', ${JSON.stringify(items)});`)
    mp.callCEFV(`selectMenu.menus["clothingMain"].i = 0`);
    mp.callCEFV(`selectMenu.menus["clothingMain"].j = 0`);
}

function initSubMenu(key, list) {
    let items = [];
    let menuName = clothesInfo[key].menuName;
    list.forEach((current) => {
        let values = [];
        for (let i = 0; i < current.textures.length; i++) {
            values.push(`№${i + 1}`);
        }
        items.push({
            text: `${current.name} [$${parseInt(current.price*priceMultiplier)}]`,
            values: values
        });
    })
    items.push({
        text: 'Назад'
    });
    mp.callCEFV(`selectMenu.setItems('clothing${menuName}', ${JSON.stringify(items)});`)
    mp.callCEFV(`selectMenu.menus["clothing${menuName}"].i = 0`);
    mp.callCEFV(`selectMenu.menus["clothing${menuName}"].j = 0`);
}

function setClothes(group, item, textureIndex) {
    let info = clothesInfo[group];

    if (group == 'tops') {
        player.setComponentVariation(3, item.torso, 0, 0);
        player.setComponentVariation(8, item.undershirt, 0, 0);
    }

    if (info.component != null) {
        player.setComponentVariation(info.component, item.variation, item.textures[textureIndex], 0);
    } else {
        player.setPropIndex(info.prop, item.variation, item.textures[textureIndex], true);
    }
}

function getInputClothes() {
    for (let key in input.clothes) {
        key = parseInt(key);
        input.clothes[key].drawable = player.getDrawableVariation(key);
        input.clothes[key].texture = player.getTextureVariation(key);
    }
    for (let key in input.props) {
        key = parseInt(key);
        input.props[key].drawable = player.getPropIndex(key);
        input.props[key].texture = player.getPropTextureIndex(key);
    }
}

function setInputClothes() {
    for (let key in input.clothes) {
        let item = input.clothes[key];
        key = parseInt(key);
        player.setComponentVariation(key, item.drawable, item.texture, 0);
    }
    for (let key in input.props) {
        let item = input.props[key];
        key = parseInt(key);
        player.setPropIndex(key, item.drawable, item.texture, true);
        if (item.drawable == -1) player.clearProp(key);
    }
}

function initCurrentHair(data) {
    hairInfo.hairstyle = data.hairstyle;
    hairInfo.hairColor = data.hairColor;
    hairInfo.hairHighlightColor = data.hairHighlightColor;
}

function setHair() {
    player.setComponentVariation(2, hairInfo.hairstyle, 0, 2);
    player.setHairColor(hairInfo.hairColor, hairInfo.hairHighlightColor);
}

function calculateCapacity(pockets) {
    let capacity = 0;
    for (let i = 0; i < pockets.length; i++) {
        if (i % 2 == 1) continue;
        capacity += pockets[i] * pockets[i + 1];
    }
    return capacity;
}