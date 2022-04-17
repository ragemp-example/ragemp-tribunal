const fishing = require('./index');

module.exports = {
    "/gotofisher": {
        access: 6,
        args: "[id]:n",
        handler: (player, args) => {
            let position = fishing.getFisherPosition(parseInt(args[0]));
            if (position) player.position = position;
        }
    },
}