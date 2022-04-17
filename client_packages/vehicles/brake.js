let config = {};
mp.brakeConfig = config;

const msToBrake = 1000;

mp.events.add({
    'vehicles.brakeConfig.init': (rawConfig) => {
        for (let key in rawConfig) {
            config[mp.game.joaat(key)] = rawConfig[key];
        }
    },
    'vehicles.brakeConfig.update': (model, value) => {
        config[mp.game.joaat(model)] = value;
    }
});

mp.keys.bind(0x20, true, startBraking); // SPACE
mp.keys.bind(0x20, false, stopBraking); // SPACE
mp.keys.bind(0x53, true, startBraking); // SPACE
mp.keys.bind(0x53, false, stopBraking); // SPACE

let brakeTimer = null;

function startBraking() {
    const vehicle = mp.players.local.vehicle;
    if (!vehicle) return;
    if (mp.busy.includes()) return;
    let value = config[vehicle.model];
    if (!value) return;
    value = 6 - value;
    // mp.chat.debug('Торможение начато');
    brakeTimer = mp.timer.add(() => {
        if (!vehicle) return;
        if (vehicle.gear === 0) return;
        vehicle.setVelocity(0, 0, 0);
        // mp.chat.debug('Принудительное торможение');
    }, value * msToBrake);
}

function stopBraking() {
    const vehicle = mp.players.local.vehicle;
    if (!vehicle) return;
    if (mp.busy.includes()) return;
    mp.timer.remove(brakeTimer);
    // mp.chat.debug('Торможение закончено');
}