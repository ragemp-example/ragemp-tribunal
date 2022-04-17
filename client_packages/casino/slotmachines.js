let slotMachines = [];
let isInSlotMachineShape = false;
let isUsingSlotMachine = false;
//let isAbleToEnter = true;

let minBet, maxBet, currentBet, balance;
let slotValues = [0, 1, 2, 3, 4, 5, 2, 6, 0, 1, 3, 4, 1, 6, 2, 4];

mp.events.add({
    'casino.area.enter': (enter, slotMachines) => {
        if (enter) {
            removeDefaultSlotMachines();
            createSlotMachines(slotMachines);
        }
    },
    'casino.slotmachine.enter': (enter) => {
        isInSlotMachineShape = enter;
        if (enter) {
            mp.prompt.show('Нажмите <span>E</span> для того, чтобы занять автомат');
        } else {
            mp.prompt.hide();
        }
    },
    'casino.slotmachine.animation.sitting': (playerId, machineIndex) => {
        let target = mp.players.atRemoteId(playerId);
        if (!target) return;
        let machine = slotMachines[machineIndex];
        let offset = mp.game.object.getObjectOffsetFromCoords(machine.main.position.x, machine.main.position.y,
            machine.main.position.z, machine.main.getHeading(), 0, -0.95, 0.67);
        target.position = offset;
        target.setHeading(machine.main.getHeading());
        target.freezePosition(true);
        
        let dict = getAnimDict(target);
        mp.game.streaming.requestAnimDict(dict);
        new Promise(resolve => {
            let checker = mp.timer.addInterval(() => {
                if (mp.game.streaming.hasAnimDictLoaded(dict)) {
                    mp.timer.remove(checker);
                    resolve();
                }
            }, 100);
        }).then(() => {
            target.taskPlayAnim(dict, 'enter_right_short', 8.0, -8.0, -1, 2, 0, false, false, false);
        });
    },
    'casino.slotmachine.start': (data) => {
        isUsingSlotMachine = true;
        mp.busy.add('slotmachine', false);
        currentBet = data.minBet;
        minBet = data.minBet;
        maxBet = data.maxBet;
        balance = data.balance;
        updateSlotMachineMenu();
        mp.callCEFV('slotmachines.show = true');
    },
    'casino.slotmachine.leave': () => {
        isUsingSlotMachine = false;
        mp.players.local.freezePosition(false);
        mp.players.local.stopAnimTask(getAnimDict(mp.players.local), 'enter_right_short', 1.0);
        mp.callCEFV('slotmachines.show = false');
        mp.busy.remove('slotmachine');
    },
    'casino.slotmachine.spin.start': (res, machineIndex, bet) => {
        balance -= bet;
        updateSlotMachineMenu();
        let result = res.split('');
        let machine = slotMachines[machineIndex];
        let reels = [machine.reels.left, machine.reels.middle, machine.reels.right];
        reels.forEach(x => x.isRolling = true);
        for (let i = 0; i < result.length; i++) {
            let value = slotValues.findIndex(x => x == parseInt(result[i]));
            makeRoll(reels[i], i + 1, value);
        }

        let readyChecker = mp.timer.addInterval(() => {
            let isReady = isMachineReady(machine);
            if (isReady) {
                mp.events.callRemote('casino.slotmachine.spin.finish');
                mp.timer.remove(readyChecker);
            }
        }, 50)
    },
    'casino.slotmachine.balance.update': (newBalance) => {
        balance = newBalance;
        updateSlotMachineMenu();
    },
    'casino.slotmachine.win': () => {
        mp.game.audio.playSoundFrontend(-1, "DLC_VW_RULES", "dlc_vw_table_games_frontend_sounds", true);
    }
})

function removeDefaultSlotMachines() {
    ['vw_prop_casino_slot_01a', 'vw_prop_casino_slot_02a', 'vw_prop_casino_slot_03a',
        'vw_prop_casino_slot_04a', 'vw_prop_casino_slot_05a', 'vw_prop_casino_slot_06a',
        'vw_prop_casino_slot_07a', 'vw_prop_casino_slot_08a'].forEach(name => {
            mp.game.entity.createModelHide(mp.players.local.position.x, mp.players.local.position.y,
                mp.players.local.position.z, 100, mp.game.joaat(name), true);
        });
}

function createSlotMachines(machines) {
    slotMachines = [];
    for (let i = 0; i < machines.length; i++) {
        let machine = createSlotMachineObject(machines[i]);
        machine.index = i;
        slotMachines.push(machine);
    }
}

function createSlotMachineObject(data) {
    let machine = {};

    machine.main = mp.objects.new(mp.game.joaat(data.model),
        new mp.Vector3(data.pos[0], data.pos[1], data.pos[2]), { dimension: 1 });
    machine.main.setHeading(data.heading);

    machine.reels = {};

    let leftOffset = mp.game.object.getObjectOffsetFromCoords(data.pos[0], data.pos[1], data.pos[2], data.heading, -0.115, +0.04, +1.095);
    machine.reels.left = mp.objects.new(mp.game.joaat(data.model + '_reels'), leftOffset, { dimension: 1 });
    machine.reels.left.setHeading(data.heading);
    setReelDefaultValues(machine.reels.left);

    let middleOffset = mp.game.object.getObjectOffsetFromCoords(data.pos[0], data.pos[1], data.pos[2], data.heading, +0.01, +0.04, +1.095);
    machine.reels.middle = mp.objects.new(mp.game.joaat(data.model + '_reels'), middleOffset, { dimension: 1 });
    machine.reels.middle.setHeading(data.heading);
    setReelDefaultValues(machine.reels.middle);

    let rightOffset = mp.game.object.getObjectOffsetFromCoords(data.pos[0], data.pos[1], data.pos[2], data.heading, +0.12, +0.04, +1.095);
    machine.reels.right = mp.objects.new(mp.game.joaat(data.model + '_reels'), rightOffset, { dimension: 1 });
    machine.reels.right.setHeading(data.heading);
    setReelDefaultValues(machine.reels.right);

    return machine;
}

function setReelDefaultValues(reel) {
    reel.defRoll = reel.getRoll();
    reel.defPitch = reel.getPitch();
    reel.defHeading = reel.getHeading();
}

function makeRoll(reel, order, value) {
    let pitch = 0;
    let finish = 360 * order + value * 22.5;
    reel.setRotation(reel.defPitch, reel.defRoll, reel.defHeading);
    let roll = reel.defRoll;
    let heading = reel.defHeading;
    let rollTimer = mp.timer.addInterval(() => {
        if (pitch < finish) {
            pitch += 22.5;
            reel.setRotation(pitch, roll, heading, 1, true);
        } else {
            mp.timer.remove(rollTimer);
            reel.isRolling = false;
        }
    }, 50);
}

function isMachineReady(machine) {
    return !machine.reels.left.isRolling
        && !machine.reels.middle.isRolling
        && !machine.reels.right.isRolling;
}

function getAnimDict(player) {
    return mp.game.joaat("mp_m_freemode_01") == player.model ?
        'anim_casino_a@amb@casino@games@slots@male' : 'anim_casino_a@amb@casino@games@lucky7wheel@female';
}

function updateSlotMachineMenu() {
    if (!balance) {
        balance = 'Нет';
    } else if (balance < 10) {
        balance = '<10';
    }
    mp.callCEFV(`slotmachines.minBet = ${minBet}`);
    mp.callCEFV(`slotmachines.maxBet = ${maxBet}`);
    mp.callCEFV(`slotmachines.currentBet = ${currentBet}`);
    mp.callCEFV(`slotmachines.balance = '${balance}'`);
}

function playBetSound() {
    mp.game.audio.playSoundFrontend(-1, "DLC_VW_CONTINUE", "dlc_vw_table_games_frontend_sounds", true);
}

// E
mp.keys.bind(69, true, () => {
    if (!isInSlotMachineShape && !isUsingSlotMachine) return;
    if (mp.busy.includes() && !mp.busy.includes('slotmachine')) return;
    if (!isUsingSlotMachine) {
        isInSlotMachineShape = false;
        mp.events.callRemote('casino.slotmachine.occupy');
        mp.prompt.hide();
    } else {
        mp.events.callRemote('casino.slotmachine.leave');
    }
});

// F
mp.keys.bind(0x46, true, () => {
    if (!isUsingSlotMachine) return;
    if (currentBet > balance) {
        mp.notify.error('Недостаточно фишек', 'Игровой автомат');
        return;
    }
    mp.events.callRemote('casino.slotmachine.spin', currentBet);
    mp.game.audio.playSoundFrontend(-1, "PICK_UP", "HUD_FRONTEND_DEFAULT_SOUNDSET", true);
});

// Стрелка вверх
mp.keys.bind(0x26, true, () => {
    if (!isUsingSlotMachine) return;
    playBetSound();
    if (currentBet + minBet > maxBet) {
        mp.notify.error('Нельзя сделать ставку выше', 'Игровой автомат');
        return;
    }
    currentBet += minBet;
    updateSlotMachineMenu();
});

// Стрелка вниз
mp.keys.bind(0x28, true, () => {
    if (!isUsingSlotMachine) return;
    playBetSound();
    if (currentBet - minBet < minBet) {
        mp.notify.error('Нельзя сделать ставку ниже', 'Игровой автомат');
        return;
    }
    currentBet -= minBet;
    updateSlotMachineMenu();
});