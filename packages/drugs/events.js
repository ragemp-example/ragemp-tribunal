const drugs = require('./index');

module.exports = {
    "init": async () => {
        await drugs.init();
    },
    "playerEnterColshape": (player, colshape) => {
        if (colshape.isDrugsCoordinates) {
            if (player.vehicle) return;
            player.call('drugs.coordinates.menu', [drugs.coordinatePrice]);
        }
        if (colshape.isDrugsSell) player.call('drugs.sell.menu');
    },
    "playerExitColshape": (player, colshape) => {
        if (colshape.isDrugsCoordinates) player.call('drugs.coordinates.menu.close');
        if (colshape.isDrugsSell) player.call('drugs.sell.menu.close');
    },
    "drugs.coordinates.buy": (player) => {
        drugs.buyCoordinate(player);
    },
    "drugs.sell": (player) => {
        drugs.sellDrugs(player);
    },
    "drugs.checkpoint.enter": (player) => {
        drugs.onEnterCheckpoint(player);
    }
};