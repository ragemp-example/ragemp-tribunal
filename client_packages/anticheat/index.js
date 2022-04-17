const limit = 1.8;

mp.events.add({
    'characterInit.done': () => {
        mp.timer.addInterval(() => {
            checkSpeedHack();
        }, 2000);
    }
});

function checkSpeedHack() {
    let player = mp.players.local;
    let vehicle = player.vehicle;
    if (!vehicle) return;
    if (player.handle !== vehicle.getPedInSeat(-1)) return;
    if (mp.powerConfig[vehicle.model]) return;

    let max = mp.game.vehicle.getVehicleModelMaxSpeed(vehicle.model) * 3.6;
    let current = mp.players.local.vehicle.getSpeed() * 3.6;
    let diff = current / max;
    if (diff >= limit) {
        mp.events.callRemote('anticheat.speedHack.detected', current);
    }
}

