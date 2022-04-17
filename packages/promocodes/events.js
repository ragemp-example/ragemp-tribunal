let promocodes = call("promocodes");

module.exports = {
    "init": async () => {
        await promocodes.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        promocodes.check(player);
    },
    "promocodes.activate": (player, code) => {
        promocodes.activate(player, code);
    },
};
