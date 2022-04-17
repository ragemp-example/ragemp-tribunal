const MAX_RANGE = 7;
const INTERACTION_RANGE = 2;
const classesToIgnore = [8, 13, 14, 15, 16];
const defaultLeft = 50;
const vehicleLeft = 60;

let currentInteractionEntity;
let personalInteractionEntity;
let currentVehicle;
let isOpen = false;

let occupantsToEject = [];

mp.getCurrentInteractionEntity = () => {
    return currentInteractionEntity;
}

mp.getPersonalInteractionEntity = () => {
    return personalInteractionEntity;
}

mp.getDefaultInteractionLeft = () => {
    return defaultLeft;
}

function vdist(posA, posB) {
    if (!posA || !posB) return Number.MAX_VALUE;
    return mp.game.system.vdist(posA.x, posA.y, posA.z, posB.x, posB.y, posB.z);
}

mp.vdist = (posA, posB) => {
    if (!posA || !posB) return Number.MAX_VALUE;
    return mp.game.system.vdist(posA.x, posA.y, posA.z, posB.x, posB.y, posB.z);
}

function getClosestVehicle(pos, range = MAX_RANGE) {
    let closestVehicle;
    let minDist = 99999;
    mp.vehicles.forEachInStreamRange((veh) => {
        let distToVeh = mp.vdist(pos, veh.position);
        if (distToVeh < range) {
            let hoodPos = mp.utils.getHoodPosition(veh);
            let bootPos = mp.utils.getBootPosition(veh);
            let distToHood = mp.vdist(pos, hoodPos);
            let distToBoot = mp.vdist(pos, bootPos);
            let vehArray = [{ pos: veh.position, dist: distToVeh }, { pos: hoodPos, dist: distToHood }, { pos: bootPos, dist: distToBoot }];
            let final = getFinalPosition(vehArray);
            let finalDist = final.minDist;
            let minPos = final.minPos;
            //let finalDist = Math.min(distToVeh, distToHood, distToBoot);
            if (finalDist < minDist && finalDist < INTERACTION_RANGE) {
                closestVehicle = veh;
                closestVehicle.minPos = minPos;
                minDist = finalDist;
            }
        }
    });
    return closestVehicle;
}

function getClosestPlayer(pos, range = INTERACTION_RANGE) {
    var closestPlayer;
    var minDist = 99999;
    mp.players.forEachInStreamRange((current) => {
        if (current == mp.players.local) return; //for tests
        if (current.vehicle) return;

        let isVanished = current.getVariable('isVanished') || false;
        if (isVanished) return;

        var distToPlayer = mp.vdist(pos, current.position);
        if (distToPlayer < range) {
            if (distToPlayer < minDist) {
                closestPlayer = current;
                minDist = distToPlayer;
            }
        }
    });
    return closestPlayer;
}

function getFinalPosition(vehArray) {
    let minDist = vehArray[0].dist;
    let minPos = vehArray[0].pos;
    for (let i = 0; i < vehArray.length; i++) {
        if (vehArray[i].dist < minDist) {
            minDist = vehArray[i].dist;
            minPos = vehArray[i].pos;
        }
    }
    return {
        minDist: minDist,
        minPos: minPos
    };
}

function getClosestPlayerOrVehicle(pos) {
    var closestPlayer = getClosestPlayer(pos);
    var closestVehicle = getClosestVehicle(pos);
    if (!closestPlayer) {
        return closestVehicle;
    };
    if (!closestVehicle) {
        return closestPlayer;
    }
    var distToPlayer = mp.vdist(pos, closestPlayer.position);

    var distToVehicle = mp.vdist(pos, closestVehicle.minPos);
    if (distToPlayer <= distToVehicle) {
        return closestPlayer;
    } else return closestVehicle;
}

mp.events.add('interaction.menu.show', () => {
    mp.busy.add('interaction', true);
    isOpen = true;
    mp.callCEFV('interactionMenu.show = true');
});

mp.events.add('interaction.menu.close', () => {
    //if (personalInteractionEntity) personalInteractionEntity = null;
    mp.busy.remove('interaction');
    isOpen = false;
    mp.callCEFV('interactionMenu.show = false');
});

mp.events.add('playerLeaveVehicle', () => {
    currentInteractionEntity = null;
});
mp.events.add('characterInit.done', () => { /// E
    mp.keys.bind(0x45, true, function () {
        if (mp.game.ui.isPauseMenuActive()) return;
        if (mp.busy.includes() && !mp.busy.includes('interaction')) return;
        if (isOpen) return mp.events.call('interaction.menu.close');

        let veh = mp.players.local.getVehicleIsTryingToEnter();
        if (veh) return;

        if (mp.players.local.vehicle) return;

        personalInteractionEntity = null;

        //getClosestPlayer(mp.players.local.position);
        //currentInteractionEntity = getClosestVehicle(mp.players.local.position);
        currentInteractionEntity = getClosestPlayerOrVehicle(mp.players.local.position);
        if (!currentInteractionEntity) return;

        if (currentInteractionEntity.type == 'vehicle') {
            if (currentInteractionEntity.getVariable("static")) return;
            mp.callCEFV('interactionMenu.menu = cloneObj(interactionMenu.menus["vehicle"])');
            mp.callCEFV(`interactionMenu.left = ${defaultLeft}`);

            let vehClass = currentInteractionEntity.getClass();
            if (classesToIgnore.includes(vehClass)) {
                mp.callCEFV('interactionMenu.menu.items.splice(1, 2)');
            }

            // if (mp.isInCarService()) {
            //     mp.callCEFV(`interactionMenu.menu.items.push({
            //         text: "Диагностика",
            //         icon: "tool.png"
            //     });`);
            // }
            mp.events.call('interaction.menu.show');
        } else if (currentInteractionEntity.type == 'player') {
            //mp.callCEFV(`interactionMenu.hasHeadBag = ${mp.mafia.hasBag(currentInteractionEntity)}`);
            mp.callCEFV(`interactionMenu.showByName('player_interaction')`);
            mp.callCEFV(`interactionMenu.left = ${defaultLeft}`);
            mp.events.call('interaction.menu.show');
        }

    });

    mp.keys.bind(0x4C, true, function () { /// L
        if (mp.game.ui.isPauseMenuActive()) return;
        if (mp.busy.includes() && !mp.busy.includes('interaction')) return;
        if (isOpen) return mp.events.call('interaction.menu.close');

        if (!mp.players.local.vehicle) {
            personalInteractionEntity = mp.players.local;
            mp.callCEFV(`interactionMenu.left = ${defaultLeft}`);
            mp.callCEFV('interactionMenu.menu = interactionMenu.menus["player_ownmenu"]');
            mp.events.call('interaction.menu.show');
        } else if (mp.players.local.vehicle.getPedInSeat(-1) == mp.players.local.handle) {
            personalInteractionEntity = mp.players.local.vehicle;
            if (!personalInteractionEntity) return;

            mp.callCEFV(`interactionMenu.left = ${vehicleLeft}`);
            mp.callCEFV('interactionMenu.menu = cloneObj(interactionMenu.menus["vehicle_inside"])');

            if (mp.vehicles.isInPrivateVehicle()) {
                mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "Продать Т/С",
                    icon: "default.svg"
                });`);
            }
            let vehClass = personalInteractionEntity.getClass();
            if (vehClass == 18) {
                mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "Звук сирены",
                    icon: "siren.png"
                });`);
            }
            mp.events.call('interaction.menu.show');
        }
    });
});


mp.events.add('render', () => {
    var start = Date.now();
    if (!isOpen) {
        currentInteractionEntity = getClosestPlayerOrVehicle(mp.players.local.position);
    }
    if (!currentInteractionEntity) return;
    try {
        let entity = currentInteractionEntity;
        let position;
        if (entity.type == "vehicle") {
            position = entity.minPos;
        } else {
            position = entity.position;
        }
        if (!mp.players.local.vehicle) {
            mp.game.graphics.drawText("E", [position.x, position.y, position.z], {
                font: 4,
                color: isOpen && !personalInteractionEntity ? [255, 66, 247, 185] : [255, 255, 255, 185],
                scale: [0.5, 0.5],
                outline: false,
                centre: true
              });
        }

        let dist = mp.vdist(mp.players.local.position, position);
        if (dist > INTERACTION_RANGE && !personalInteractionEntity) {
            currentInteractionEntity = null;
            mp.events.call('interaction.menu.close');
            mp.events.call('interaction.money.close'); // to be tested
        }
    } catch (err) {
        currentInteractionEntity = null;
    }
    if (mp.renderChecker) mp.utils.drawText2d(`interaction rend: ${Date.now() - start} ms`, [0.8, 0.57]);
});

mp.events.add('interaction.ejectlist.get', () => {
    if (!personalInteractionEntity) return;
    try {
        mp.events.callRemote('vehicles.ejectlist.get', personalInteractionEntity.remoteId);
    } catch (err) {
    }
});

mp.events.add('interaction.police.ejectlist.get', () => {
    if (!currentInteractionEntity) return;
    try {
        mp.events.callRemote('vehicles.police.ejectlist.get', currentInteractionEntity.remoteId);
    } catch (err) {
    }
});

mp.events.add('interaction.ejectlist.show', (list) => {
    occupantsToEject = list;
    mp.callCEFV(`interactionMenu.left = ${vehicleLeft}`);
    mp.callCEFV('interactionMenu.menu = cloneObj(interactionMenu.menus["vehicle_ejectlist"])');
    occupantsToEject.forEach((current) => {
        mp.callCEFV(`interactionMenu.menu.items.push({
            text: "ID: ${current.id}",
            icon: "person.png"
        });`);
    });
    mp.events.call('interaction.menu.show');
});

mp.events.add('interaction.police.ejectlist.show', (list) => {
    occupantsToEject = list;

    // mp.callCEFV(`interactionMenu.left = ${vehicleLeft}`);
    mp.callCEFV('interactionMenu.menu = cloneObj(interactionMenu.menus["police_ejectlist"])');
    occupantsToEject.forEach((current) => {
        mp.callCEFV(`interactionMenu.menu.items.push({
            text: "ID: ${current.id}",
            icon: "person.png"
        });`);
    });
    mp.events.call('interaction.menu.show');

});

mp.events.add('interaction.eject', (index) => {
    if (!personalInteractionEntity) return;
    if (personalInteractionEntity.type != 'vehicle') return;
    let playerToEject = occupantsToEject[index];
    mp.events.callRemote('vehicles.eject', JSON.stringify(playerToEject));
});

mp.events.add('interaction.police.eject', (index) => {
    if (!currentInteractionEntity) return;
    if (currentInteractionEntity.type != 'vehicle') return;
    let playerToEject = occupantsToEject[index];
    mp.events.callRemote('vehicles.police.eject', JSON.stringify(playerToEject));
});

mp.events.add('interaction.money.show', () => {
    if (!currentInteractionEntity) return;
    if (currentInteractionEntity.type != 'player') return;

    let playerId = currentInteractionEntity.remoteId;
    if (playerId == null) return;
    mp.busy.add('money_giving', true);
    mp.callCEFV(`inputWindow.name = 'money_giving';
inputWindow.header = "Передача денег ID: ${playerId}";
inputWindow.hint = "Введите сумму от $1 до $5000";
inputWindow.inputHint = "Сумма...";
inputWindow.value = "";
inputWindow.show = true;
`);

});
mp.events.add('interaction.money.close', () => {
    mp.callCEFV(`inputWindow.show = false`);
    mp.busy.remove('money_giving');
});

mp.events.add('interaction.money.accept', (value) => {

    if (!value) return mp.notify.error('Введите сумму', 'Ошибка');

    let sum = parseInt(value);
    if (isNaN(sum)) return mp.notify.error('Некорректная сумма', 'Ошибка');

    if (sum < 1) return mp.notify.error('Слишком малая сумма', 'Ошибка');

    if (sum > 5000) return mp.notify.error('Слишком большая сумма', 'Ошибка');
    if (!currentInteractionEntity) return;
    let targetId = currentInteractionEntity.remoteId;
    if (targetId == null) return mp.notify.error('Игрок не найден', 'Ошибка');
    mp.events.callRemote('interaction.money.give', targetId, sum);
    mp.callCEFV('loader.show = true');
    mp.events.call('interaction.money.close');

});

mp.events.add('interaction.money.ans', (ans) => {
    mp.callCEFV('loader.show = false');
    switch (ans) {
        case 0:
            mp.notify.error('Игрок не найден', 'Ошибка');
            break;
        case 1:
            mp.notify.error('Некорректная сумма', 'Ошибка');
            break;
        case 2:
            mp.notify.error('Недостаточно денег', 'Ошибка');
            break;
        case 3:
            mp.notify.error('Не удалось передать деньги', 'Ошибка');
            break;
        case 4:
            mp.notify.success('Вы передали деньги', 'Успех');
            break;
        case 5:
            mp.notify.error('Нельзя передать деньги себе', 'Ошибка');
            break;
        case 6:
            mp.notify.error('Игрок далеко', 'Ошибка');
            break;
        default:
            break;
    }
});

mp.events.add('interaction.money.decline', () => {
    mp.events.call('interaction.money.close');
});
