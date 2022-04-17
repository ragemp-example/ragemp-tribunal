let orangePicker = require('./index');
let notify = call('notifications');

module.exports = {
    'init': () => {
        orangePicker.init();
        inited(__dirname);
    },
    'orangePicker.pick': (player) => {
        if (!player.character) return;
        if (player.orangeTreeId === null || player.orangeTreeId === undefined)
            return notify.error(player, 'Вы не у апельсинового дерева');
        //temp
        orangePicker.pick(player, player.orangeTreeId);
    },
    'orangePicker.items.sell': (player) => {
        orangePicker.sellItems(player);
    },
}