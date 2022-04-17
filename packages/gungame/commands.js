const gg = require('./index.js');

module.exports = {
    "/ggaddloc": {
        description: "Добавить локацию для гангейм зоны",
        access: 6,
        args: "[название]:s",
        handler: async (player, args, out) => {
            const name = args[0];
            if (!name) return out.log('Необходимо указать имя', player);

            const id = await gg.addLocation(player, name);
        }
    },
    "/ggaddspawn": {
        description: "Добавить точку спавна команды",
        access: 6,
        args: "[ид_локации]:n",
        handler: async (player, args, out) => {
            const id = parseInt(args[0]);
            await gg.addTeamPoint(player, id);
        }
    },
    "/ggaddteam": {
        description: "Добавить точку спавна команды",
        access: 6,
        args: "[ид_локации]:n",
        handler: async (player, args, out) => {
            const id = parseInt(args[0]);
            await gg.addTeamPoint(player, id);
        }
    },
    "/ggroomexit": {
        description: "Выйти из комнты",
        access: 6,
        args: "",
        handler: async (player, args, out) => {
            gg.exitRoom(player);
        }
    },
    "/ggroomscore": {
        description: "Список комнат",
        access: 6,
        args: "",
        handler: async (player, args, out) => {
            gg.rooms.forEach(r => console.log(r.score));
        }
    },
}