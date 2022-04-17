const oilrigs = require('./index');

module.exports = {
    "/createrig": {
        access: 6,
        description: "Добавить нефтевышку",
        args: "[id_вышки]:n [цена]:n",
        handler: (player, args, out) => {
            oilrigs.createRig(player, parseInt(args[0]), parseInt(args[1]));
        }
    },
    "/createrigst": {
        access: 6,
        description: "Добавить склад нефтевышки",
        args: "",
        handler: (player, args, out) => {
            oilrigs.createRigStorage(player);
        }
    },
};