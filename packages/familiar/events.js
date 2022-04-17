let familiar = call('familiar');
let notifs = call('notifications');

module.exports = {
    "init": () => {
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        familiar.initList(player);
    },
    "familiar.add": (player, recId) => {
        // console.log(`familiar.add: ${player.name} ${recId}`)
        var header = `Знакомство`;
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return notifs.error(player, `Игрок #${recId} не найден`, header);
        if (player.dist(rec.position) > 10) return notifs.error(player, `${rec.name} далеко`, header);
        if (familiar.have(player, rec.character.id)) return notifs.error(player, `Вы уже знакомы с ${rec.name}`, header);

        rec.call(`offerDialog.show`, ["familiar", {
            playerId: player.id
        }]);
    },
    "familiar.accept": (player, recId) => {
        var header = `Знакомство`;
        var rec = mp.players.at(recId);
        if (!rec || !rec.character) return notifs.error(player, `Игрок #${recId} не найден`, header);
        if (player.dist(rec.position) > 10) return notifs.error(player, `${rec.name} далеко`, header);
        if (familiar.have(player, rec.character.id)) return notifs.error(player, `Вы уже знакомы с ${rec.name}`, header);
        if (rec.getVariable("knocked")) return notifs.error(player, `Игрок не в состоянии знакомиться`, header);

        familiar.add(player, rec);

        notifs.success(player, `${rec.name} ваш новый знакомый`, header);
        notifs.success(rec, `${player.name} ваш новый знакомый`, header);

        if (!player.vehicle && !player.getVariable("knocked")) {
            var time = 5000;
            mp.players.forEachInRange(player.position, 20, current => {
                current.call(`animations.play`, [player.id, {
                    dict: "mp_ped_interaction",
                    name: "handshake_guy_a",
                    speed: 1,
                    flag: 1
                }, time]);
            });
        }
        if (!rec.vehicle && !rec.getVariable("knocked")) {
            mp.players.forEachInRange(rec.position, 20, current => {
                current.call(`animations.play`, [rec.id, {
                    dict: "mp_ped_interaction",
                    name: "handshake_guy_a",
                    speed: 1,
                    flag: 1
                }, time]);
            });
        }
    },
    "player.name.changed": (player, oldName) => {
        mp.players.forEach(rec => {
            if (!rec.character) return;

            rec.call(`familiar.name.update`, [player.name, oldName]);
        });
    },
};
