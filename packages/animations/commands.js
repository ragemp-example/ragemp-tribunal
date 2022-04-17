let animations = call('animations');

module.exports = {
    "/anim": {
        access: 1,
        description: "Проиграть анимацию.",
        args: "[dict] [name] [speed]:n [flag]:n",
        handler: (player, args, out) => {
            if (!animations.has(args[0], args[1])) return out.error(`Анимация не найдена`, player);
            mp.events.call('animations.play', player, args[0], args[1], args[2], args[3]);
        }
    },
    "/stopanim": {
        access: 1,
        description: "Остановить анимацию.",
        args: "",
        handler: (player, args) => {
            mp.events.call('animations.stop', player);
        }
    },
    "/animid": {
        access: 1,
        description: "Проиграть анимацию по ID анимации.",
        args: "[id]:n",
        handler: (player, args) => {
            mp.events.call('animations.playById', player, args[0]);
        }
    },
    "/animator": {
        access: 1,
        description: "Вкл/выкл режим воспроизведения анимаций.",
        args: "",
        handler: (player, args) => {
            player.call("animations.animator");
        }
    },
}
