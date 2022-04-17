"use strict";

mp.events.add("playerEnterColshape", (shape) => {
    if (!mp.colshapes.exists(shape)) return;
    if (!mp.players.local.vehicle) return;
    let speedLimit = shape.getVariable('speedingradars.speedLimit');
    if (!speedLimit) return;
    if (mp.moduleVehicles.isInStateVehicle()) return;
    let speed = Math.floor(mp.players.local.vehicle.getSpeed() * 3.6);
    let copId = shape.getVariable('speedingradars.copId');
    mp.events.callRemote("speedingradars.check", speed, speedLimit, copId);
});