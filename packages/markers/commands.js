let markers = call('markers');

module.exports = {
    "/tpmarkadd": {
        description: "Добавить маркер для телепорта (необходимо указать координаты конечного маркера). Используйте 0 для параметров blip/blipColor, если маркер не имеет блипа на карте.",
        access: 3,
        args: "[x]:n [y]:n [z]:n [heading]:n [dimension]:n [blipA]:n [colorBlipA]:n [blipB]:n [colorBlipB]:n [name]",
        handler: (player, args, out) => {
            var posA = player.position;
            posA.z--;
            posA.h = player.heading;
            posA.d = player.dimension;
            posA.blip = args[5];
            posA.blipColor = args[6];

            var posB = new mp.Vector3(args[0], args[1], args[2] - 1);
            posB.h = args[3];
            posB.d = args[4];
            posB.blip = args[7];
            posB.blipColor = args[8];

            if (player.dist(posB) < 5) return out.error(`Маркеры расположены слишком близко`, player);

            markers.addTpMarker(posA, posB, args[9]);
            out.info(`${player.name} добавил ТП-маркер ${JSON.stringify(posA)} => ${JSON.stringify(posB)}`);
        }
    },
    "/tpmarkdel": {
        description: "Удалить маркер для телепорта.",
        access: 3,
        args: "",
        handler: (player, args, out) => {
            var marker = markers.getNearTpMarker(player.position);
            if (!marker) return out.error(`Маркер поблизости не найден`, player);

            markers.removeTpMarker(marker.id);
            out.info(`${player.name} удалил ТП-маркер #${marker.db.id}`);
        }
    },
}
