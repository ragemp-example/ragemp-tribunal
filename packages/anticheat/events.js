let anticheat = require('./index');

module.exports = {
    'init': () => {
        anticheat.init();
        inited(__dirname);
    },
    'playerWeaponChange': (player, oldWeapon, newWeapon) => {
        if (!anticheat.enabled) return;
        if (!player.character) return;
        anticheat.checkBannedWeapon(player, newWeapon)
    },
    'playerDeath': (player, reason, killer) => {
        if (!anticheat.enabled) return;
        if (!player.character) return;
        if (!killer) return;
        anticheat.checkBannedReason(killer, reason);
    },
    'anticheat.speedHack.detected': (player, speed) => {
        if (!player.character) return;
        let vehicle = player.vehicle;
        anticheat.action(player, 4,
            `${vehicle ? vehicle.modelName : 'Неизвестное т/с'} (${parseInt(speed)} км/ч)`, true);
    }
}