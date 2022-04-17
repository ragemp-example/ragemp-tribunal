module.exports = {
    "/naddad": {
        access: 6,
        description: "Добавить объявление в планшет.",
        args: "[описание]",
        handler: (player, args, out) => {
            mp.events.call(`mapCase.news.ads.add`, player, args.join(" "));
        }
    },
    "/nremad": {
        access: 6,
        description: "Удалить объявление из планшета.",
        args: "[ид]:n",
        handler: (player, args, out) => {
            mp.events.call(`mapCase.news.ads.remove`, player, args[0]);
        }
    },
}
