const narcotism = require('./index');

module.exports = {
    "init": () => {
        narcotism.init();
    },
    "characterInit.done": (player) => {
        const narcotismValue = player.character.narcotism;
        if (narcotismValue < 30) return;
        player.call('narcotism.update', [narcotismValue]);
    },
    "playerEnterColshape": (player, colshape) => {
        if (!colshape.isNarcotismDoctor) return;

        player.call('narcotism.menu', [[ { name: 'Пройти сеанс', price: narcotism.sessionPrice } ]])
    },
    "player.narcotism.changed": (player) => {
        player.call('narcotism.update', [player.character.narcotism])
    },
    "playerExitColshape": (player, colshape) => {
        if (!colshape.isNarcotismDoctor) return;

        player.call('narcotism.menu.close');
    },
    "narcotism.withdrawal": (player) => {
        narcotism.withdrawal(player);
    },
    "narcotism.treated": (player) => {
        narcotism.treated(player)
    }
};