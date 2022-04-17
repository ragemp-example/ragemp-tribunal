let terminal = require('./index.js');
module.exports = {
    "init": async () => {
        await terminal.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        if (terminal.haveAccess(player))
            player.call(`terminal.enable`, [true]);
    },
    "terminal.command.handle": (player, values) => {
        if (typeof values == 'string') values = JSON.parse(values);
        terminal.handleCommand(player, values.shift(), values);
    },
};
