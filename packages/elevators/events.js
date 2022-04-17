const elevators = require('./index');

module.exports = {
    'init': () => {
        elevators.init();
        inited(__dirname);
    },
    'elevators.teleport': (player, floor) => {
        if (player.elevatorId == null) return;
        elevators.teleport(player, floor);
    }
}