let donate = call('donate');
let notifs = call('notifications');

module.exports = {
    "/donate": {
        description: "Выдать донат игроку.",
        access: 6,
        args: "[ид_игрока]:n [донат]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            donate.setDonate(rec, rec.account.donate + args[1], `Выдано администратором ${player.name}`);

            out.info(`${player.name} выдал ${args[1]} TC ${rec.name}`);
            notifs.success(rec, `${player.name} выдал вам ${args[1]} TC`);
        }
    },
}
