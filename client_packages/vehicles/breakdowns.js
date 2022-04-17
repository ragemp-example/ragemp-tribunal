let breakdowns = {
    engineState: 0,
    steeringState: 0,
    fuelState: 0,
    brakeState: 0
}

let engineState;
let steeringState;
let fuelState;
let brakeState;


mp.events.add('playerLeaveVehicle', () => {
    stopBrakeTimer();
    stopSteeringTimer();
});

mp.events.add('vehicles.breakdowns.init', (data) => {
    if (!mp.players.local.vehicle) return;
    if (!data.engineState && !data.steeringState && !data.fuelState && !data.brakeState) {
        stopBrakeTimer();
        stopSteeringTimer();
        mp.players.local.vehicle.setEnginePowerMultiplier(1);
        return mp.callCEFV('speedometer.danger = 0');
    }
    mp.events.call('notifications.push.warning', 'Обратитесь к механикам', 'Т/с неисправно');
    // mp.chat.debug(`engineState ${data.engineState}`);
    // mp.chat.debug(`steeringState ${data.steeringState}`);
    // mp.chat.debug(`fuelState ${data.fuelState}`);
    // mp.chat.debug(`brakeState ${data.brakeState}`);

    engineState = data.engineState;
    steeringState = data.steeringState;
    fuelState = data.fuelState;
    brakeState = data.brakeState;
    if (engineState) {
        mp.events.call('vehicles.breakdowns.engine');
    }
    if (steeringState) {
        mp.events.call('vehicles.breakdowns.steering');
    }
    if (fuelState) {
        mp.events.call('vehicles.breakdowns.fuel');
    }
    if (brakeState) {
        mp.events.call('vehicles.breakdowns.brake');
    }
    mp.callCEFV('speedometer.danger = 1');
});

mp.events.add('vehicles.breakdowns.engine', () => {
    if (!mp.players.local.vehicle) return;
    let multiplier;
    switch (engineState) {
        case 1:
            multiplier = -30;
            break;
        case 2:
            multiplier = -60;
            break;
    }
    mp.players.local.vehicle.setEnginePowerMultiplier(multiplier);
});

mp.events.add('vehicles.breakdowns.steering', () => {
    startSteeringTimer();
});

mp.events.add('vehicles.breakdowns.fuel', () => {
    //
});

mp.events.add('vehicles.breakdowns.brake', () => {
    startBrakeTimer();
});

let brakeTimer, toBrake;

function startBrakeTimer() {
    stopBrakeTimer();
    let breakChance;
    switch (brakeState) {
        case 1:
            breakChance = 0.3;
            break;
        case 2:
            breakChance = 0.7;
            break;
    }

    brakeTimer = mp.timer.addInterval(() => {
        if (!mp.players.local.vehicle) return stopBrakeTimer();

        try {
            let random = Math.random();
            if (random <= breakChance) {
                mp.players.local.vehicle.setHandbrake(true);
                toBrake = mp.timer.add(() => {
                    if (!mp.players.local.vehicle) return stopBrakeTimer();
                    try {
                        mp.players.local.vehicle.setHandbrake(false);
                    } catch (err) {
                        stopBrakeTimer();
                    }
                }, 1000);
            }
        } catch (err) {
            stopBrakeTimer();
        }
    }, 5000);
}

function stopBrakeTimer() {
    mp.timer.remove(brakeTimer);
    mp.timer.remove(toBrake);
}

let steeringTimer;

function startSteeringTimer() {
    stopSteeringTimer();
    let breakChance;
    switch (steeringState) {
        case 1:
            breakChance = 0.2;
            break;
        case 2:
            breakChance = 0.7;
            break;
    }

    steeringTimer = mp.timer.addInterval(() => {
        if (!mp.players.local.vehicle) return stopBrakeTimer();
        let breakRandom = Math.random();
        if (breakRandom > breakChance) return;
        try {
            let random = Math.random();
            if (random > 0.5) {
                bias = -1.0;
            } else {
                bias = 1.0;
            }
            mp.players.local.vehicle.setSteerBias(bias);

        } catch (err) {
            stopSteeringTimer()
        }
    }, 2000);
}

function stopSteeringTimer() {
    mp.timer.remove(steeringTimer);
}
