module.exports = {
    "playerEnterColshape": (player, colshape) => {
        if (player.character && colshape.onEnter) colshape.onEnter(player);
    },
    "playerExitColshape": (player, colshape) => {
        if (player.character && colshape.onExit) colshape.onExit(player);
    },
};
