const drugs = require('./index');

module.exports = {
    "/dcreatepoint": {
        description: "Добавить точку для закладки.",
        access: 1,
        args: "",
        handler: (player, args, out) => {
            drugs.createCoordinate(player);
            out.log('Координата добавлена', player);
        }
    },
    "/ddestroypoint": {
        description: "Удалить точку для закладки.",
        access: 1,
        args: "",
        handler: async (player, args, out) => {
            if (await drugs.destroyCoordinate(player)) return out.log('Координата удалена', player);
            out.log('По-близости точек не найдено', player);
        }
    }
};