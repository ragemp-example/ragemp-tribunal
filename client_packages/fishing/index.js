let peds = [
    {
        model: "cs_old_man2",
        position: {
            x: -1593.1,
            y: 5202.9,
            z: 4.3,
        },
        heading: 294.5,
        defaultScenario: 'WORLD_HUMAN_AA_SMOKE'
    },
    {
        model: "cs_old_man2",
        position: {
            x: 712.6,
            y: 4099.5,
            z: 35.8,
        },
        heading: 0,
        defaultScenario: 'WORLD_HUMAN_AA_SMOKE'
    },
    {
        model: "cs_old_man2",
        position: {
            x: -1633.6,
            y: -1120.9,
            z: 2.4,
        },
        heading: 224.7,
        defaultScenario: 'WORLD_HUMAN_AA_SMOKE'
    },
    {
        model: "cs_old_man2",
        position: {
            x: -426.5,
            y: 6355.8,
            z: 13.3,
        },
        heading: 33.14,
        defaultScenario: 'WORLD_HUMAN_AA_SMOKE'
    },
    {
        model: "s_m_y_dockwork_01",
        position: {
            x: -169.2956,
            y: -2687.0917,
            z: 6.01,
        },
        heading: 264.51,
        defaultScenario: 'WORLD_HUMAN_AA_SMOKE'
    }
];

let localPlayer = mp.players.local;
let rods = [];

let timeoutEndFishing;

let isInZone = false;

let isBinding = false;
let isEnter = false;
let isStarted = false;
let isFetch = false;
let isHaveRod = false;
let isShowPrompt = false;
let isDead = false;

let intervalFishing;
let isIntervalCreated = false;

const checkConditions = () => {
    return (
        isHaveRod &&
        !isDead &&
        localPlayer.hands && localPlayer.hands.itemId == 5 &&
        !isEnter &&
        !localPlayer.isSwimming() &&
        !localPlayer.vehicle &&
        !localPlayer.getVehicleIsTryingToEnter() &&
        !localPlayer.isInAir() &&
        !localPlayer.isJumping() &&
        !localPlayer.isDiving() &&
        !localPlayer.isEvasiveDiving() &&
        !localPlayer.isFalling() &&
        !localPlayer.isSwimmingUnderWater() &&
        !localPlayer.isClimbing()
    );
};

mp.events.add('characterInit.done', () => {
    mp.events.call('fishing.game.exit');

    peds.forEach((current) => {
        mp.events.call('NPC.create', current);
    });
});

mp.events.add('render', () => {
    var start = Date.now();
    if (checkConditions()) {
        if (!isIntervalCreated) {
            isIntervalCreated = true;
            intervalFishing = mp.timer.addInterval(() => {
                let heading = localPlayer.getHeading() + 90;
                let point = {
                    x: localPlayer.position.x + 15*Math.cos(heading * Math.PI / 180.0),
                    y: localPlayer.position.y + 15*Math.sin(heading * Math.PI / 180.0),
                    z: localPlayer.position.z
                }

                let ground = mp.game.gameplay.getGroundZFor3dCoord(point.x, point.y, point.z, 0.0, false);
                let water = Math.abs(mp.game.water.getWaterHeight(point.x, point.y, point.z, 0));
                // debug(`water: ${water} | ground: ${ground}`);

                if (water > 0 && ground < water && ground != 0) {
                    isShowPrompt = true;
                    isInZone = true;
                    mp.events.call('fishing.game.menu');
                } else {
                    if (isShowPrompt) {
                        mp.events.call('prompt.hide');
                        isShowPrompt = false;
                    }
                    if (!isEnter) bindButtons(false);

                    isInZone = false;
                }
            }, 1000);
        }
    } else {
        if (isIntervalCreated) {
            mp.events.call('prompt.hide');
            isInZone = false;
            isShowPrompt = false;
            mp.timer.remove(intervalFishing);
            isIntervalCreated = false;
            if (!isEnter) bindButtons(false);
        }
    }

    if (mp.renderChecker) mp.utils.drawText2d(`fishing rend: ${Date.now() - start} ms`, [0.8, 0.55]);
});

mp.events.add('inventory.initItems', (items) => {
    for (let item in items) {
        let pockets = items[item].pockets;
        if (pockets && Object.keys(pockets).length !== 0) {
            pockets.forEach(pocket => {
                for (let pocketItem in pocket.items) {
                    if (pocket.items[pocketItem].itemId == 5) {
                        isHaveRod = true;
                        rods.push(pocket.items[pocketItem].sqlId);
                    }
                }
            });
        }
    }
});

mp.events.add('inventory.deleteItem', (item) => {
    if (rods.includes(item)) {
        let index = rods.findIndex(rod => rod == item);
        rods.splice(index, 1);

        if (rods.length == 0) {
            isHaveRod = false;
            mp.timer.remove(intervalFishing);
            isIntervalCreated = false;
            bindButtons(false);
            mp.events.call('prompt.hide');
            isShowPrompt = false;
        }
    }
});

mp.events.add('inventory.addItem', (item) => {
    if (item.itemId == 5) {
        isHaveRod = true;
        rods.push(item.sqlId)
    }
});

mp.events.add('fishing.menu.show', (rodPrice) => {
    if (mp.busy.includes()) return;

    mp.busy.add('fishing.menu', false);
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["fishingMenu"])`);
    mp.callCEFV(`selectMenu.items[0].values = ["${rodPrice}$"]`);
    mp.callCEFV(`selectMenu.show = true`);
});

mp.events.add('fishing.menu.port.show', () => {
    if (mp.busy.includes()) return;

    mp.busy.add('fishing.menu', false);
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["fishingPort"])`);
    mp.callCEFV(`selectMenu.show = true`);
});

mp.events.add('fishing.menu.close', () => {
    mp.busy.remove('fishing.menu');
    mp.callCEFV(`selectMenu.show = false`);
});

mp.events.add('fishing.rod.buy', () => {
    mp.callCEFV(`selectMenu.loader = true`);
    mp.events.callRemote('fishing.rod.buy');
});

mp.events.add('fishing.rod.buy.ans', (ans, data) => {
    mp.callCEFV(`selectMenu.loader = false`);

    switch (ans) {
        case 0:
            mp.callCEFV(`selectMenu.notification = 'Ошибка покупки'`);
            break;
        case 1:
            mp.events.call('fishing.menu.close');
            break;
        case 2:
            mp.callCEFV(`selectMenu.notification = \`${data}\``);
            break;
        case 3:
            mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
            break;
    }
});

mp.events.add('fishing.fish.sell', (isPort = false) => {
    mp.callCEFV(`selectMenu.loader = true`);
    mp.events.callRemote('fishing.fish.sell', isPort);
});

mp.events.add('fishing.fish.sell.ans', (ans) => {
    mp.callCEFV(`selectMenu.loader = false`);
    if (ans == 1) {
        mp.events.call('fishing.menu.close');
    }
});

mp.events.add('fishing.game.menu', () => {
    if (mp.busy.includes()) return;

    mp.events.call('prompt.showByName', 'fishing');
    // bindButtons(true);
});

mp.events.add('click', (x, y, upOrDown, leftOrRight, relativeX, relativeY, worldPosition, hitEntity) => {
    if (upOrDown != 'down' || leftOrRight != 'left') return;
    if (!localPlayer.hands) return;
    if (localPlayer.hands.itemId !== 5) return;

    if (!isEnter && isInZone) {
        if (mp.busy.includes()) return;
        return fishingEnter()
    };
    if (!isStarted && isEnter) return fishingStart();
});

mp.events.add('fishing.game.enter', () => {
    if (mp.busy.includes()) return;

    mp.timer.remove(timeoutEndFishing);

    bindButtons(true);
    mp.busy.add('fishing.game', false);
    playBaseAnimation(true);
    mp.utils.disablePlayerMoving(true);
    localPlayer.freezePosition(true);
    mp.callCEFVN({ "fishing.show": true });
    isEnter = true;
});

mp.events.add('fishing.game.fetch', (speed, zone, weight, name) => {
    playFetchAnimation(true);
    isFetch = true;
    mp.callCEFV(`fishing.fishFetch(${speed},${zone},${weight},"${name}");`);
});

mp.events.add('fishing.game.end', (result) => {
    playBaseAnimation(true);
    mp.events.callRemote('fishing.game.end', result);
    timeoutEndFishing = mp.timer.add(() => {
        try {
            isStarted = false;
            isFetch = false;
            mp.callCEFV(`fishing.clearData();`);
            mp.callCEFVN({ "fishing.isStarted": false });
        } catch (e) {

        }
    }, 1500);
});

mp.events.add('fishing.game.exit', () => {
    mp.events.callRemote('fishing.game.exit');
    bindButtons(false);
    isEnter = false;
    isStarted = false;
    mp.events.call('prompt.hide');
    playBaseAnimation(false);
    mp.utils.disablePlayerMoving(false);
    localPlayer.freezePosition(false);
    mp.callCEFV(`fishing.clearData()`);
    mp.callCEFVN({ "fishing.show": false });
    mp.busy.remove('fishing.game');
});

mp.events.add("playerDeath", (player) => {
    if (player.remoteId === localPlayer.remoteId) {
        if (mp.busy.includes('fishing.game')) {
            isDead = true;
            mp.events.call('fishing.game.exit');
            mp.events.callRemote('animations.stop');
        }
    }
});

mp.events.addDataHandler("knocked", (player, knocked) => {
    if (player.remoteId == mp.players.local.remoteId) {
        if (!knocked) {
            isDead = false;
        }
    }
});

let bindButtons = (state) => {
    if (state) {
        if (isBinding) return;
        isBinding = true;
        mp.keys.bind(0x20, true, fishingEnd);
        mp.keys.bind(0x1B, false, fishingExit);
    }
    else {
        if (!isBinding) return;
        isBinding = false;
        mp.keys.unbind(0x20, true, fishingEnd);
        mp.keys.unbind(0x1B, false, fishingExit);
    }
};

let fishingEnter = () => {
    if (mp.game.ui.isPauseMenuActive()) return;
    if (!isEnter) {
        mp.events.callRemote('fishing.game.enter');
        mp.events.call('prompt.hide');
    }
};

let fishingStart = () => {
    if (mp.game.ui.isPauseMenuActive()) return;
    if (isEnter && !isStarted) {
        playWaitAnimation(true);
        mp.callCEFVN({ "fishing.isStarted": true });
        let heading = localPlayer.getHeading() + 90;
        let point = {
            x: localPlayer.position.x + 15*Math.cos(heading * Math.PI / 180.0),
            y: localPlayer.position.y + 15*Math.sin(heading * Math.PI / 180.0),
            z: localPlayer.position.z
        };
        let water = Math.abs(mp.game.water.getWaterHeight(point.x, point.y, point.z, 0));
        let ground = mp.game.gameplay.getGroundZFor3dCoord(point.x, point.y, point.z, 0.0, false);
        let depth;
        if (ground === 0) {
            depth = 420;
        } else {
            depth = water - ground;
        }
        mp.events.callRemote('fishing.game.start', depth);
        isStarted = true;
    }
};

let fishingEnd = () => {
    if (mp.game.ui.isPauseMenuActive()) return;
    if (isEnter && isStarted && isFetch) {
        mp.callCEFV(`fishing.endFishing();`);
        isFetch = false;
    }
};

let fishingExit = () => {
    if (mp.game.ui.isPauseMenuActive()) return;
    if (!isFetch) {
        mp.events.call('fishing.game.exit');
    }
};

function playBaseAnimation(state, timeout) { /// Анимация держания удочки
    if (state) {
        if (!timeout) timeout = 0;
        mp.timer.add(()=> {
            mp.events.callRemote('animations.play', 'amb@world_human_stand_fishing@base', 'base', 1, 49);
        }, timeout);
    } else {
        mp.events.callRemote('animations.stop');
    }
}

function playWaitAnimation(state, timeout) { /// Анимация начала рыбалки
    if (state) {
        if (!timeout) timeout = 0;
        mp.timer.add(()=> {
            mp.events.callRemote('animations.play', 'amb@world_human_stand_fishing@idle_a', 'idle_a', 1, 49);
        }, timeout);
    } else {
        mp.events.callRemote('animations.stop');
    }
}

function playFetchAnimation(state, timeout) { /// Анимация вытягивания
    if (state) {
        if (!timeout) timeout = 0;
        mp.timer.add(()=> {
            mp.events.callRemote('animations.play', 'amb@world_human_stand_fishing@idle_a', 'idle_c', 1, 49);
        }, timeout);
    } else {
        mp.events.callRemote('animations.stop');
    }
}