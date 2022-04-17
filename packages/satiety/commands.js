var notifs = require('../notifications');
let satiety = call('satiety');

module.exports = {

    "/satiety": {
        access: 4,
        description: "Пополнить сытость игроку.",
        args: `[ид_игрока]:n`,
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            satiety.set(rec, 100, rec.character.thirst);
            out.info(`${player.name} пополнил сытость ${rec.name}`);
            notifs.success(rec, `${player.name} пополнил вам сытость`, `Сытость`);
        }
    },
    "/thirst": {
        access: 4,
        description: "Пополнить жажду игроку.",
        args: `[ид_игрока]:n`,
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            satiety.set(rec, rec.character.satiety, 100);
            out.info(`${player.name} пополнил жажду ${rec.name}`);
            notifs.success(rec, `${player.name} пополнил вам жажду`, `Жажда`);
        }
    },
}
