let whitelist = require('./index.js');

module.exports = {
    '/wlist': {
        args: '',
        description: 'Просмотреть вайтлист',
        access: 6,
        handler: (player, args, out) => {
            let list = whitelist.getAllowed();
            let result = 'WHITELIST: <br/>';
            list.forEach((record) => {
                result += `${record.id}) ${record.socialClub}<br/>`;
            });
            out.info(result, player);
        }
    },
    '/wlistadd': {
        args: '[socialClub]:s',
        description: 'Добавить игрока в вайтлист',
        access: 6,
        handler: async (player, args, out) => {
            let socialClub = args[0];
            let isInList = whitelist.isInWhiteList(socialClub);
            if (isInList) return out.error('Игрок уже в вайтлисте', player);

            let record = await db.Models.WhiteList.create({
                socialClub: socialClub
            });
            whitelist.pushToAllowed(record);
            out.info(`Игрок ${socialClub} добавлен в вайтлист`, player);
        }
    },
    '/wlistremove': {
        args: '[socialClub]:s',
        description: 'Удалить игрока из вайтлиста',
        access: 6,
        handler: async (player, args, out) => {
            let socialClub = args[0];
            let isInList = whitelist.isInWhiteList(socialClub);
            if (!isInList) return out.error('Игрока нет в вайтлисте', player);
            let record = await db.Models.WhiteList.findOne({
                where: {
                    socialClub: socialClub
                }
            });

            if (!record) return out.error('Игрока нет в вайтлисте', player);
            record.destroy();
            whitelist.removeFromAllowed(socialClub);
            out.info(`Игрок ${socialClub} удален из вайтлиста`, player);
        }
    },
}
