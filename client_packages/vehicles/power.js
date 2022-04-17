// let rawConfig = {
//     '2015polstang': 80,
//     'fbigs350': 30,
//     'rmodgt63police': 27,
//     'rmodx6police': 32,
//     'srt8police': 32
// };

let config = {};
mp.powerConfig = config;

mp.events.add({
    'vehicles.powerConfig.init': (rawConfig) => {

        for (let key in rawConfig) {
            config[mp.game.joaat(key)] = rawConfig[key];
        }
        //mp.powerConfig = config;
    },
    'vehicles.engine.toggle': (state) => {
        if (!state) return;
        let vehicle = mp.players.local.vehicle;
        if (!vehicle) return;
        setMultiplier(vehicle);
    },
    'playerEnterVehicle': (vehicle) => {
        let engine = vehicle.getIsEngineRunning();
        if (engine) {
            setMultiplier(vehicle);
        }
    },
    'vehicles.engine.updated': () => {
        let vehicle = mp.players.local.vehicle;
        if (!vehicle) return;
        setMultiplier(vehicle);
    },
    'vehicles.powerConfig.update': (model, value) => {
        mp.chat.debug(`${model} => ${value}`)
        config[mp.game.joaat(model)] = value;
    }
});

function setMultiplier(vehicle) {
    let model = vehicle.model;
    let value = config[model];
    let engineBoost = vehicle.getVariable('boost') || 0;
    if (!value && !engineBoost) return;
    if (!value) {
        value = engineBoost;
    } else {
        value += engineBoost;
    }
    mp.timer.add(() => {
        vehicle.setEnginePowerMultiplier(value);
    }, 100);
}