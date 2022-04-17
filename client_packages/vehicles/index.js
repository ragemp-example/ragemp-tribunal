let breakdowns = require('vehicles/breakdowns.js');
let sell = require('vehicles/sell.js');
let garage = require('vehicles/garage.js');
let radiosync = require('vehicles/radiosync.js');
let own = require('vehicles/own.js');
let power = require('vehicles/power.js');
let brake = require('vehicles/brake.js');
let currentSirenState = false;
let isCurrentVehicleElectric = false;
mp.speedometerEnabled = true;

mp.events.add("playerLeaveVehicle", () => {
    mp.callCEFV('speedometer.arrow = 0');
    mp.callCEFV('speedometer.emergency = false');
    mp.timer.add(() => {
        try {
            currentSirenState = false;
        } catch (err) {
            mp.chat.debug('currentSirenState = false error')
        }

    }, 2000);

});

mp.events.addDataHandler("engine", (entity) => {
    var player = mp.players.local;
    var engine = entity.getVariable('engine');
    entity.setUndriveable(!engine);
    entity.setEngineOn(engine, true, true);

});

mp.events.addDataHandler("handbrake", (entity) => {
    if (entity.getClass() !== 14) return;
    const handbrake = entity.getVariable('handbrake');
    if (handbrake) {
        entity.fixedPosition = entity.position;
        // mp.chat.debug(JSON.stringify(fixedPosition));
        // entity.handbrakeInterval = mp.timer.addInterval(() => {
        //     // mp.events.callRemote('vehicles.position.set', entity, JSON.stringify(fixedPosition))
        // }, 1);
    } else {
        // if (!entity.handbrakeInterval) return;
        // mp.timer.remove(entity.handbrakeInterval);
        entity.fixedPosition = null;
    }
});

mp.events.add('vehicles.position.fixed', (vehicle, fixedPosition) => {
    const { x, y } = fixedPosition;
    mp.chat.debug(JSON.stringify(fixedPosition));
    vehicle.x = x;
    vehicle.y = y;
});

mp.timer.addInterval(() => { /// Синхронизация двигателя
    try {
        var player = mp.players.local;
        if (player.vehicle && mp.vehicles.exists(player.vehicle)) {
            var engine = player.vehicle.getVariable('engine') || false;

            player.vehicle.setUndriveable(!engine);
            player.vehicle.setEngineOn(engine, true, true);
        }
    } catch (err) {
        mp.chat.debug('engine sync error');
    }

}, 100);

let lastLightState;
let lightState = 0;
let lastLockStatus;

speedometerUpdateTimer = mp.timer.addInterval(() => { /// Обновление спидометра

    try {
        if ((!mp.players.local.vehicle) || (mp.players.local.vehicle.getPedInSeat(-1) != mp.players.local.handle)) return;

        let engine = mp.players.local.vehicle.getIsEngineRunning();
        let lastEngine;
        if (engine != lastEngine) {
            if (!engine) {
                mp.callCEFV(`speedometer.isActive = false`);
                lastEngine = false;
            } else {
                mp.callCEFV(`speedometer.isActive = true`);
                lastEngine = true;
            }
        }

        let speed = Math.floor(mp.players.local.vehicle.getSpeed() * 3.6);
        mp.callCEFV(`speedometer.speed = ${speed}`);

        let lights = mp.players.local.vehicle.getLightsState(1, 1); /// Фары

        let low = lights.lightsOn;
        let high = lights.highbeamsOn;
        if (low == 0 && high == 0) lightState = 0;
        if (low == 0 && high == 1) lightState = 1;
        if (low == 1 && high == 0) lightState = 2;
        if (low == 1 && high == 1) lightState = 3;
        if (lastLightState != lightState) {
            mp.callCEFV(`speedometer.headlights = ${lightState}`);
            lastLightState = lightState;
        }
        let lockStatus = mp.players.local.vehicle.getDoorLockStatus();
        if (lockStatus != lastLockStatus) {
            lastLockStatus = lockStatus;
            if (lockStatus == 1) {
                mp.callCEFV(`speedometer.lock = 0`);
            } else {
                mp.callCEFV(`speedometer.lock = 1`);
            }
        }
    } catch (err) {
        mp.chat.debug('speedometerUpdateTimer error');
    }


}, 100);

mp.keys.bind(0x32, true, function() {
    if (mp.busy.includes(['chat', 'cuffs', 'terminal', 'fuel'])) return;
    if (!mp.players.local.vehicle) return;
    if (mp.players.local.vehicle.getPedInSeat(-1) === mp.players.local.handle) {
        mp.events.callRemote('vehicles.engine.toggle');

        if (mp.players.local.vehicle.getClass() !== 14) return;
        mp.events.callRemote('vehicles.handbrake.toggle');
    }
});


mp.events.add('vehicles.engine.toggle', (state) => {
    mp.callCEFV(`speedometer.isActive = ${state}`);
})

mp.events.add('vehicles.speedometer.show', (state, isElectric = isCurrentVehicleElectric) => {
    isCurrentVehicleElectric = isElectric;
    if (mp.speedometerEnabled) {
        if (state) {
            let vehicle = mp.players.local.vehicle;
            if (!vehicle) return;
            let engine = vehicle.getIsEngineRunning()
            mp.callCEFV(`speedometer.isElectricCar = ${isElectric}`);
            mp.callCEFV(`speedometer.isActive = ${engine}`);
            mp.callCEFV('speedometer.show = true');
        } else {
            mp.callCEFV('speedometer.show = false');
        }
    }

});

mp.events.add('vehicles.speedometer.sync', () => {

    let vehicle = mp.players.local.vehicle;
    if (!vehicle) return;
    var left = vehicle.getVariable(`leftTurnSignal`);
    var right = vehicle.getVariable(`rightTurnSignal`);

    if (left && right) {
        mp.callCEFV('speedometer.emergency = true');
    }
    if (left && !right) {
        mp.callCEFV('speedometer.arrow = 1');
    }
    if (!left && right) {
        mp.callCEFV('speedometer.arrow = 2');
    }
});

mp.events.add('vehicles.speedometer.fuel.update', (litres) => {
    mp.callCEFV(`speedometer.fuel = ${litres}`);
});

mp.events.add('vehicles.speedometer.mileage.update', (mileage) => {
    mileage = parseInt(mileage);
    mp.callCEFV(`speedometer.mileage = ${mileage}`);
});

mp.events.add('vehicles.speedometer.max.update', (fuel) => {
    mp.callCEFV(`speedometer.maxFuel = ${fuel}`);
    let vehicle = mp.players.local.vehicle;
    if (!vehicle) return;
    let maxSpeed = (mp.game.vehicle.getVehicleModelMaxSpeed(vehicle.model) * 3.6).toFixed(0);
    mp.callCEFV(`speedometer.maxSpeed = ${maxSpeed}`);
});

var mileageTimer, mileageUpdateTimer, lastPos, currentDist = 0;

mp.events.add('vehicles.mileage.start', (value) => {
    if (mp.players.local.vehicle) {
        mp.players.local.vehicle.mileage = value;
    }
    startMileageCounter();
});

function startMileageCounter() {

    var player = mp.players.local;
    lastPos = player.position;
    stopMileageCounter();
    mileageTimer = mp.timer.addInterval(() => {
        var vehicle = player.vehicle;
        if (!vehicle) return stopMileageCounter();

        var dist = (vehicle.position.x - lastPos.x) * (vehicle.position.x - lastPos.x) + (vehicle.position.y - lastPos.y) * (vehicle.position.y - lastPos.y) +
            (vehicle.position.z - lastPos.z) * (vehicle.position.z - lastPos.z);
        dist = Math.sqrt(dist);
        if (dist > 200) dist = 50;
        dist /= 1000;

        currentDist += dist;
        lastPos = vehicle.position;

        var mileage = vehicle.mileage + currentDist;
        mp.events.call('vehicles.speedometer.mileage.update', mileage);
    }, 1000);
    mileageUpdateTimer = mp.timer.addInterval(() => {
        try {
            var vehicle = player.vehicle;
            if (!vehicle) return stopMileageCounter();
            if (currentDist < 0.1) return;
            mp.events.callRemote(`vehicles.mileage.add`, currentDist);
            vehicle.mileage += currentDist;
            currentDist = 0;
        } catch (err) {
            mp.chat.debug('mileageUpdateTimer error');
        }
    }, 60000);
};

function stopMileageCounter() {

    mp.timer.remove(mileageTimer);
    mp.timer.remove(mileageUpdateTimer);

    if (currentDist < 0.1) return;
    mp.events.callRemote(`vehicles.mileage.add`, currentDist);
    currentDist = 0;
};

mp.keys.bind(0x25, true, function() {
    if (mp.busy.includes()) return;
    var player = mp.players.local;
    var vehicle = player.vehicle;
    if (!vehicle) return;
    if (vehicle.getPedInSeat(-1) != player.handle) return;

    var left = vehicle.getVariable(`leftTurnSignal`);
    var right = vehicle.getVariable(`rightTurnSignal`);
    mp.callCEFV('speedometer.arrow = 0');
    if (!left || !right) {
        mp.events.callRemote("vehicles.signals.left", !left);
        if (!left) {
            mp.callCEFV('speedometer.arrow = 0');
            mp.callCEFV('speedometer.arrow = 1');
        } else {
            mp.callCEFV('speedometer.arrow = 0');
        }

    }
});

mp.keys.bind(0x27, true, function() {
    if (mp.busy.includes()) return;
    var player = mp.players.local;
    var vehicle = player.vehicle;
    if (!vehicle) return;
    if (vehicle.getPedInSeat(-1) != player.handle) return;

    var left = vehicle.getVariable(`leftTurnSignal`);
    var right = vehicle.getVariable(`rightTurnSignal`);
    mp.callCEFV('speedometer.arrow = 0');
    if (!left || !right) {
        mp.events.callRemote("vehicles.signals.right", !right);
        if (!right) {
            mp.callCEFV('speedometer.arrow = 0');
            mp.callCEFV('speedometer.arrow = 2');
        } else {
            mp.callCEFV('speedometer.arrow = 0');
        }
    }
});


mp.keys.bind(0x28, true, () => {
    if (mp.busy.includes()) return;
    var player = mp.players.local;
    var vehicle = player.vehicle;
    if (!vehicle) return;
    if (vehicle.getPedInSeat(-1) != player.handle) return;

    var left = vehicle.getVariable(`leftTurnSignal`);
    var right = vehicle.getVariable(`rightTurnSignal`);

    if (left && right) {
        mp.events.callRemote(`vehicles.signals.emergency`, false);
        mp.callCEFV('speedometer.arrow = 0');
        mp.callCEFV('speedometer.emergency = false');
    } else {
        mp.events.callRemote(`vehicles.signals.emergency`, true);
        mp.callCEFV('speedometer.arrow = 0');
        mp.callCEFV('speedometer.emergency = true');
    }
});

mp.keys.bind(87, true, () => { // W
    var player = mp.players.local;
    if (!player.autopilot || !player.vehicle) return;
    delete player.autopilot;
    player.clearTasks();
    mp.notify.info("Автопилот деактивирован");
});

mp.events.addDataHandler("leftTurnSignal", (entity) => {
    var player = mp.players.local;
    var left = entity.getVariable('leftTurnSignal');
    entity.setIndicatorLights(1, left);
});

mp.events.addDataHandler("rightTurnSignal", (entity) => {
    var player = mp.players.local;
    var right = entity.getVariable('rightTurnSignal');
    entity.setIndicatorLights(0, right);
});

mp.events.addDataHandler("hood", (entity) => {
    var hood = entity.getVariable('hood');
    if (hood) {
        entity.setDoorOpen(4, false, false);
    } else {
        entity.setDoorShut(4, false);
    }
});


mp.events.addDataHandler("trunk", (entity) => {
    var trunk = entity.getVariable('trunk');
    if (trunk) {
        entity.setDoorOpen(5, false, false);
    } else {
        entity.setDoorShut(5, false);
    }
});

mp.events.addDataHandler("sirenSound", (entity) => {
    var sirenSound = entity.getVariable("sirenSound");
    entity.setSirenSound(sirenSound);
});

mp.events.addDataHandler("sirenLights", (entity) => {
    var sirenLights = entity.getVariable("sirenLights");
    entity.setSiren(sirenLights);
});

mp.events.addDataHandler("heading", (entity, value) => {
    if (value != null) entity.setHeading(value);
});

mp.events.add('entityStreamIn', (entity) => {
    if (entity.type == 'vehicle') {
        let left = entity.getVariable("leftTurnSignal") || false;
        let right = entity.getVariable("rightTurnSignal") || false;
        entity.setIndicatorLights(1, left);
        entity.setIndicatorLights(0, right);

        let hood = entity.getVariable("hood") || false;
        let trunk = entity.getVariable("trunk") || false;

        let sirenLights = entity.getVariable("sirenLights") || false;
        let sirenSound = entity.getVariable("sirenSound") || false;

        if (hood) {
            entity.setDoorOpen(4, false, false);
        } else {
            entity.setDoorShut(4, false);
        }

        if (trunk) {
            entity.setDoorOpen(5, false, false);
        } else {
            entity.setDoorShut(5, false);
        }

        entity.setSiren(sirenLights);
        entity.setSirenSound(sirenSound);

        var rotation = entity.getVariable("rotation");
        if (rotation) entity.setRotation(rotation);

        entity.setDoorBreakable(4, false); // hood
        entity.setDoorBreakable(5, false); // trunk
    }
});

mp.events.add('vehicles.lock', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    // if (mp.moduleVehicles.nearBootVehicleId != null || mp.moduleVehicles.nearHoodVehicleId != null)
    //     return mp.notify.error(`Необходимо находиться у двери`, `Авто`);
    mp.events.callRemote('vehicles.lock', veh.remoteId);
})

mp.events.add('vehicles.hood', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    if (mp.moduleVehicles.nearHoodVehicleId == null || mp.moduleVehicles.nearHoodVehicleId != veh.remoteId)
        return mp.notify.error(`Необходимо находиться у капота`, `Авто`);

    if (veh.getVariable("hood")) {
        mp.events.callRemote('vehicles.hood', veh.remoteId, false);
    } else {
        mp.events.callRemote('vehicles.hood', veh.remoteId, true);
    }
});

mp.events.add('vehicles.trunk', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    if (mp.moduleVehicles.nearBootVehicleId == null || mp.moduleVehicles.nearBootVehicleId != veh.remoteId)
        return mp.notify.error(`Необходимо находиться у багажника`, `Авто`);

    if (veh.getVariable("trunk")) {
        mp.events.callRemote('vehicles.trunk', veh.remoteId, false);
    } else {
        mp.events.callRemote('vehicles.trunk', veh.remoteId, true);
    }
});

mp.events.add('vehicles.explode', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    mp.events.callRemote('vehicles.explode', veh.remoteId);
});

mp.events.add('vehicles.siren.sound', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    mp.events.callRemote('vehicles.siren.sound', veh.remoteId);
});

let sirenLightsUpdater = mp.timer.addInterval(() => {
    try {
        if (!mp.players.local.vehicle) return;
        if (currentSirenState == mp.players.local.vehicle.isSirenOn()) return;
        mp.events.callRemote('vehicles.siren.lights');
        currentSirenState = mp.players.local.vehicle.isSirenOn();
    } catch (err) {
        mp.chat.debug('sirenLightsUpdater error');
    }

}, 1000);


mp.vehicles.getVehiclePosition = (vehicle) => {
    let data = {
        x: vehicle.position.x,
        y: vehicle.position.y,
        z: vehicle.position.z,
        h: vehicle.getHeading()
    }
    return data;
}

mp.events.add('vehicles.heading.set', (heading) => {
    let veh = mp.players.local.vehicle;
    if (!veh) return;

    veh.setHeading(heading);
    veh.setOnGroundProperly();
});

mp.events.add('vehicles.onGroundProperly.set', () => {
    let veh = mp.players.local.vehicle;
    if (!veh) return;
    veh.setOnGroundProperly();
});


mp.events.add('vehicles.speedometer.enabled', (enabled) => {
    mp.speedometerEnabled = enabled;
});
mp.events.add("time.main.tick", () => {
    var start = Date.now();
    // var entity = mp.utils.getNearPlayerOrVehicle(mp.players.local.position, 10);
    var vehicle = mp.utils.getNearVehicle(mp.players.local.position, 10);

    if (vehicle && vehicle.type == "vehicle") {
        var bootPos = mp.utils.getBootPosition(vehicle);
        var distToBoot = mp.vdist(mp.players.local.position, bootPos);
        if (distToBoot < 1) {
            if (mp.moduleVehicles.nearBootVehicleId == null) {
                mp.moduleVehicles.nearBootVehicleId = vehicle.remoteId;
                mp.events.call("playerEnterVehicleBoot", mp.players.local, vehicle);
            }
        } else {
            if (mp.moduleVehicles.nearBootVehicleId != null) {
                mp.events.call("playerExitVehicleBoot", mp.players.local, mp.vehicles.atRemoteId(mp.moduleVehicles.nearBootVehicleId));
                mp.moduleVehicles.nearBootVehicleId = null;
            }
        }

        var hoodPos = mp.utils.getHoodPosition(vehicle);
        var distToHood = mp.vdist(mp.players.local.position, hoodPos);
        if (distToHood < 1) {
            if (mp.moduleVehicles.nearHoodVehicleId == null) {
                mp.moduleVehicles.nearHoodVehicleId = vehicle.remoteId;
                mp.events.call("playerEnterVehicleHood", mp.players.local, vehicle);
            }
        } else {
            if (mp.moduleVehicles.nearHoodVehicleId != null) {
                mp.events.call("playerExitVehicleHood", mp.players.local, mp.vehicles.atRemoteId(mp.moduleVehicles.nearHoodVehicleId));
                mp.moduleVehicles.nearHoodVehicleId = null;
            }
        }
    } else {
        if (mp.moduleVehicles.nearBootVehicleId != null) {
            mp.events.call("playerExitVehicleBoot", mp.players.local, mp.vehicles.atRemoteId(mp.moduleVehicles.nearBootVehicleId));
            mp.moduleVehicles.nearBootVehicleId = null;
        }
        if (mp.moduleVehicles.nearHoodVehicleId != null) {
            mp.events.call("playerExitVehicleHood", mp.players.local, mp.vehicles.atRemoteId(mp.moduleVehicles.nearHoodVehicleId));
            mp.moduleVehicles.nearHoodVehicleId = null;
        }
    }

    var player = mp.players.local;
    if (player.autopilot && player.vehicle) {
        var coord = mp.utils.getWaypointCoord();
        if (!coord) {
            delete player.autopilot;
            player.clearTasks();
            mp.notify.info("Автопилот деактивирован");
        } else {
            var dist = mp.vdist(player.position, coord);
            if (dist < 50 && coord.z - player.position.z > 2) {
                delete player.autopilot;
                player.clearTasks();
                mp.notify.info("Вы прибыли на место", "Автопилот");
            }
        }
    }

    mp.timeMainChecker.modules.vehicles = Date.now() - start;
});

mp.moduleVehicles = {
    nearBootVehicleId: null,
    nearHoodVehicleId: null,
    disabledControl: false,

    getSeat(player) {
        if (!player.vehicle) return null;

        var seats = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        for (var i = 0; i < seats.length; i++) {
            if (player.vehicle.getPedInSeat(seats[i]) == player.handle) return seats[i];
        }

        return null;
    },
    disableControl(enable) {
        this.disabledControl = enable;
    },
}

mp.events.add({
    "vehicles.disableControl": (enable) => {
        mp.moduleVehicles.disableControl(enable);
    },
    "playerEnterVehicleBoot": (player, vehicle) => {
        if (player.vehicle) return;
        if (vehicle.getVariable("static")) return;
        if (!vehicle.getVariable("trunk")) {
            mp.prompt.showByName("vehicle_open_boot");
        }
    },
    "playerEnterVehicleHood": (player, vehicle) => {
        if (player.vehicle) return;
        if (vehicle.getVariable("static")) return;
        if (!vehicle.getVariable("hood")) {
            mp.prompt.showByName("vehicle_open_hood");
        } else mp.prompt.showByName("vehicle_close_hood");
    },
    "playerExitVehicleBoot": (player, vehicle) => {
        mp.prompt.hide();
    },
    "playerExitVehicleHood": (player, vehicle) => {
        mp.prompt.hide();
    },
});

mp.events.addDataHandler("hood", (vehicle, value) => {
    if (mp.moduleVehicles.nearHoodVehicleId == null) return;
    if (mp.moduleVehicles.nearHoodVehicleId != vehicle.remoteId) return;
    if (value) mp.prompt.showByName("vehicle_close_hood");
    else mp.prompt.showByName("vehicle_open_hood");
});

mp.events.add('render', () => {
    var start = Date.now();
    mp.vehicles.forEachInStreamRange((vehicle) => {
        if (mp.vdist(mp.players.local.position, vehicle.position) > 10) return;
        if (vehicle.getVariable('label')) {
            let label = vehicle.getVariable('label');
            mp.game.graphics.drawText(label, [vehicle.position.x, vehicle.position.y, vehicle.position.z + 2.7], {
                font: 0,
                color: [255, 255, 255, 255],
                scale: [0.35, 0.35],
                outline: true,
                centre: true
            });
        }
        if (vehicle.getVariable('unload')) {
            var bootPos = mp.utils.getBootPosition(vehicle);
            mp.game.graphics.drawText(`Разгрузка...`, [bootPos.x, bootPos.y, bootPos.z + 1], {
                font: 0,
                color: [187, 255, 0, 255],
                scale: [0.25, 0.25],
                outline: true,
                centre: true
            });
        }
    });

    mp.vehicles.forEach(vehicle => {
        if (vehicle.getClass() !== 14) return;
        if (!vehicle.getVariable('handbrake')) return;

        const fixedPosition = vehicle.fixedPosition || vehicle.position;
        const water = mp.game.water.getWaterHeight(fixedPosition.x, fixedPosition.y, vehicle.position.z, 1);
        vehicle.position = new mp.Vector3(fixedPosition.x, fixedPosition.y, water + 0.1);
        vehicle.setForwardSpeed(0);
    });

    if (mp.moduleVehicles.disabledControl) {
        mp.game.controls.disableControlAction(0, 59, true); /// INPUT_VEH_MOVE_LR
        mp.game.controls.disableControlAction(0, 60, true); /// INPUT_VEH_MOVE_UD
        mp.game.controls.disableControlAction(0, 71, true); /// INPUT_VEH_ACCELERATE
        mp.game.controls.disableControlAction(0, 72, true); /// INPUT_VEH_BRAKE
        // mp.game.controls.disableControlAction(0, 75, true); /// INPUT_VEH_EXIT
    }
    if (mp.renderChecker) mp.utils.drawText2d(`vehicles rend: ${Date.now() - start} ms`, [0.8, 0.67]);
});

mp.events.add('vehicles.add.menu.show', () => {
    mp.events.call('selectMenu.show', 'vehiclePropAdd');
});

let autopilotIsEnabled = false;
mp.events.add('vehicles.autopilot.enable', (enable) => {
    autopilotIsEnabled = enable;
});

mp.events.add('vehicles.autopilot', () => {
    var player = mp.players.local;
    var veh = player.vehicle;
    if (!autopilotIsEnabled) return mp.notify.warning("На этот транспорт не установлен автопилот");
    if (!veh) return mp.notify.error("Вы не в авто");
    var pos = mp.utils.getWaypointCoord();
    if (!pos) return mp.notify.warning("Укажите точку на карте");

    var speed = 25;
    var drivingStyle = 1074528293;
    var stopRange = 50;

    player.autopilot = true;
    player.taskVehicleDriveToCoordLongrange(veh.handle, pos.x, pos.y, pos.z + 2, speed, drivingStyle, stopRange);
    mp.notify.success("Автопилот активирован");
    mp.prompt.showByName("vehicle_autopilot");
});

mp.events.add('characterInit.done', () => {
    mp.timer.addInterval(async () => {
        mp.vehicles.forEachInStreamRange((vehicle) => {
            if (mp.vdist(mp.players.local.position, vehicle.position) > 30) return;
            if (vehicle.remoteId == null) return;
            if (!vehicle.getVariable('isValid')) {
                mp.events.callRemote('vehicles.invalid.found', vehicle.remoteId);
            }
        });
    }, 1000);
});

let isInNewbieRent = false;
mp.events.add('vehicles.rent.enter', (enter) => {
    isInNewbieRent = enter;
    if (enter) {
        mp.prompt.show('Нажмите <span>E</span> для того, чтобы получить бесплатный скутер');
    } else {
        mp.prompt.hide();
    }
});

mp.events.add('vehicles.boats.rent.enter', (enter, data) => {
    if (enter) {
        const items = [];

        for (let key in data) {
            items.push({
                text: data[key].name,
                values: [`$${data[key].price}`],
                model: key
            })
        }

        items.push({ text: 'Закрыть' });

        mp.callCEFV(`selectMenu.setItems('boatsRent', ${JSON.stringify(items)});`);
        mp.events.call('selectMenu.show', 'boatsRent');
    } else {
        mp.callCEFV(`selectMenu.show = false`);
    }
});

mp.events.add('vehicles.boats.rent.ans', (ans) => {
    mp.callCEFV(`selectMenu.loader = false`);

    switch (ans) {
        case 0:
            mp.callCEFV(`selectMenu.notification = 'Ошибка операции'`);
            break;
        case 1:
            mp.events.call('vehicles.boats.rent.enter', false);
            break;
        case 2:
            mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
            break;
    }
});

mp.keys.bind(0x45, true, () => { /// E
    if (!isInNewbieRent) return;
    if (mp.busy.includes()) return;
    isInNewbieRent = false;
    mp.events.callRemote('vehicles.rent.spawn');
});

let isInStateVehicle = false;
mp.events.add('vehicles.state.enter', (enter) => {
    isInStateVehicle = enter;
});

mp.moduleVehicles.isInStateVehicle = () => {
    return !!(mp.players.local.vehicle && isInStateVehicle);
}