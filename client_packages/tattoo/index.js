mp.game.ui.requestAdditionalText("tat_mnu", 9);

let player = mp.players.local;
let playerIsFrozen = false;
let isInShape = false;
let isAbleToEnter = false;
let gender;
let priceMultiplier;
let deletePrice;
let hairInfo = {};

let tattoPacksLoaded = 0;

let tattooList = [];

let sortedList = [];

let rotation = {
    left: false,
    right: false
}

let zonesConfig = {
    0: "Torso",
    1: "Head",
    2: "LeftArm",
    3: "RightArm",
    4: "LeftLeg",
    5: "RightLeg"
}

let characterTattoos = [];

mp.events.add({
    'tattoo.pack.get': (pack, packsCount) => {
        tattooList = tattooList.concat(pack)
        tattoPacksLoaded++;
        if (tattoPacksLoaded == packsCount) {
            clothesLoaded = 0;
            mp.events.callRemote('tattoo.enter');
        }
    },
    'tattoo.enter': (shopData, inputGender) => {
        gender = inputGender;
        deletePrice = shopData.deleteTattooPrice;
        bindKeys(true);
        sortTattooList();
        initCurrentHair(shopData.appearance);
        setHair();
        clearClothes();
        setHeaders(shopData.bType);
        mp.events.call('hud.enable', false);
        mp.game.ui.displayRadar(false);
        mp.callCEFR('setOpacityChat', [0.0]);
        mp.utils.cam.create(shopData.camera.x, shopData.camera.y, shopData.camera.z, shopData.pos.x, shopData.pos.y, shopData.pos.z, 50);
        mp.callCEFV('loader.show = false');
        priceMultiplier = shopData.priceMultiplier;
        initMenus();
        mp.events.call('selectMenu.show', 'tattooMain');
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
    'tattoo.player.freeze': () => {
        mp.callCEFV('loader.show = true');
        mp.utils.disablePlayerMoving(true);
        player.freezePosition(true);
        playerIsFrozen = true;
    },
    'tattoo.exit': () => {
        playerIsFrozen = false;
        mp.events.call(`selectMenu.hide`);
        bindKeys(false);
        mp.utils.cam.destroy();
        mp.events.call('hud.enable', true);
        mp.game.ui.displayRadar(true);
        mp.callCEFR('setOpacityChat', [1.0]);
        player.freezePosition(false);
        mp.utils.disablePlayerMoving(false);

        mp.events.callRemote('tattoo.exit');
    },
    'tattoo.set': (zoneId, index) => {
        let currentList = sortedList.filter(x => x.zoneId == zoneId);
        let currentTattoo = currentList[index];
        clearTattoos();
        setTattoo(currentTattoo.collection, currentTattoo[gender ? 'hashNameFemale' : 'hashNameMale']);
    },
    'tattoo.buy': (zoneId, index) => {
        let currentList = sortedList.filter(x => x.zoneId == zoneId);
        let currentTattoo = currentList[index];
        if (!isAbleToBuyTattoo(currentTattoo.name)) return mp.callCEFV(`selectMenu.notification = 'У вас уже есть эта тату'`);
        mp.events.callRemote('tattoo.buy', currentTattoo.id);
    },
    'tattoo.buy.ans': (ans) => {
        mp.callCEFV(`selectMenu.loader = false`);
        switch (ans) {
            case 0:
                clearTattoos();
                mp.callCEFV(`selectMenu.notification = 'Татуировка набита'`);
                break;
            case 1:
                mp.callCEFV(`selectMenu.notification = 'Татуировка не найдена'`);
                break;
            case 2:
                mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
                break;
            case 3:
                mp.callCEFV(`selectMenu.notification = 'Ошибка финансовой операции'`);
                break;
            case 4:
                mp.callCEFV(`selectMenu.notification = 'В салоне кончились материалы'`);
                break;
        }
    },
    'tattoo.characterTattoos.add': (list) => {
        characterTattoos = characterTattoos.concat(list);
    },
    'tattoo.characterTattoos.remove': (id) => {
        removeTattoo(id);
    },
    'tattoo.clear': clearTattoos,
    'tattoo.clear.single': (index) => {
        clearSingleTattoo(index);
    },
    'tattoo.delete.show': () => {
        if (!characterTattoos.length) return mp.callCEFV(`selectMenu.notification = 'У вас нет татуировок'`);
        let items = [];
        characterTattoos.forEach((current) => {
            items.push({
                text: mp.game.ui.getLabelText(current.name),
                values: [`$${deletePrice * priceMultiplier}`]
            });
        });
        items.push({
            text: 'Назад'
        });
        mp.events.call('tattoo.clear.single', 0);
        mp.callCEFV(`selectMenu.setItems('tattooDelete', ${JSON.stringify(items)});`)
        mp.callCEFV(`selectMenu.menus["tattooDelete"].i = 0`);
        mp.callCEFV(`selectMenu.menus["tattooDelete"].j = 0`);
        mp.callCEFV(`selectMenu.showByName("tattooDelete")`);
    },
    'tattoo.delete': (index) => {
        let tattooId = characterTattoos[index].id;
        mp.events.callRemote('tattoo.delete', tattooId);
    },
    'tattoo.delete.ans': (ans, data) => {
        mp.callCEFV(`selectMenu.loader = false`);
        switch (ans) {
            case 0:
                removeTattoo(data);
                mp.callCEFV(`selectMenu.notification = 'Татуировка сведена'`);
                mp.callCEFV(`selectMenu.showByName("tattooMain")`);
                if (!characterTattoos.length) return;
                mp.events.call('tattoo.delete.show');
                break;
            case 1:
                mp.callCEFV(`selectMenu.notification = 'Татуировка не найдена'`);
                break;
            case 2:
                mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
                break;
            case 3:
                mp.callCEFV(`selectMenu.notification = 'Ошибка финансовой операции'`);
                break;
            case 4:
                mp.callCEFV(`selectMenu.notification = 'В салоне кончились материалы'`);
                break;
        }
    },
    'tattoo.shape.state': (state) => {
        isInShape = state;
        isAbleToEnter = true;
        if (state) {
            mp.prompt.show('Нажмите <span>E</span> для того, чтобы посмотреть татуировки');
        } else {
            mp.prompt.hide();
        }
    },
    'render': () => {
        if (rotation.left) player.setHeading(player.getHeading() - 2);
        if (rotation.right) player.setHeading(player.getHeading() + 2);
    },
});

mp.keys.bind(0x45, true, () => {
    if (!isInShape || !isAbleToEnter) return;

    let isCuffed = mp.players.local.getVariable('cuffs') || false;
    if (isCuffed) return;

    isAbleToEnter = false;
    mp.events.callRemote('tattoo.shape.enter');
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

function sortTattooList() {
    let hash = gender ? 'hashNameFemale' : 'hashNameMale';
    sortedList = tattooList.filter(x => x[hash].length != 0);
}

function initMenus() {
    for (let key in zonesConfig) {
        let items = [];
        let menuName = zonesConfig[key];
        sortedList.forEach((current) => {
            if (current.zoneId != key) return;
            items.push({
                text: mp.game.ui.getLabelText(current.name),
                values: [`$${parseInt(current.price * priceMultiplier)}`]
            });
        })
        items.push({
            text: 'Назад'
        });
        mp.callCEFV(`selectMenu.setItems('tattoo${menuName}', ${JSON.stringify(items)});`)
        mp.callCEFV(`selectMenu.menus["tattoo${menuName}"].i = 0`);
        mp.callCEFV(`selectMenu.menus["tattoo${menuName}"].j = 0`);
    }
}

function clearTattoos() {
    player.clearDecorations();
    characterTattoos.forEach((current) => {
        setTattoo(current.collection, current.hashName);
    });
}

function clearSingleTattoo(index) {
    player.clearDecorations();
    for (let i = 0; i < characterTattoos.length; i++) {
        if (i == index) continue;
        setTattoo(characterTattoos[i].collection, characterTattoos[i].hashName);
    }
}

function setTattoo(collection, hashName) {
    player.setDecoration(mp.game.joaat(collection), mp.game.joaat(hashName));
}

function clearClothes() {
    player.clearAllProps();
    player.setComponentVariation(1, 0, 0, 0);
    player.setComponentVariation(3, 15, 0, 0);
    player.setComponentVariation(11, gender ? 18 : 15, 0, 2);
    player.setComponentVariation(8, gender ? 3 : 15, 0, 2);
    player.setComponentVariation(4, gender ? 17 : 18, gender ? 0 : 2, 2);
    player.setComponentVariation(6, gender ? 35 : 34, 0, 0);
    player.setComponentVariation(7, 0, 0, 2);
}

function removeTattoo(id) {
    characterTattoos = characterTattoos.filter(x => x.id != id);
}

function setHeaders(type) {
    let img;
    switch (type) {
        case 0:
            img = 'blazing';
            break;
        case 1:
            img = 'bodyart';
            break;
        case 2:
            img = 'inkinc';
            break;
        case 3:
            img = 'lstattoos';
            break;
        case 4:
            img = 'thepit';
            break;
    }
    ['Main', 'Torso', 'Head', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg', 'Delete']
        .forEach(name => mp.callCEFV(`selectMenu.menus["tattoo${name}"].headerImg = '${img}.png'`));
}

function isAbleToBuyTattoo(name) {
    let tattoo = characterTattoos.find(x => x.name == name);
    return tattoo ? false : true;
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