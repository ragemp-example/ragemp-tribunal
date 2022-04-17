let mafia = call('mafia');
let factions = call('factions');

module.exports = {
    "/mzonetp": {
        access: 4,
        description: "Телепортироваться в зону бизвара.",
        args: "[ид_зоны]:n",
        handler: (player, args, out) => {
            var zone = mafia.getZone(args[0]);
            if (!zone) return out.error(`Зона #${args[0]} не найдена`, player);
            var pos = new mp.Vector3(zone.x, zone.y, 80);
            player.position = pos;
        }
    },
    "/mcaptrk": {
        access: 6,
        description: "Вкл/выкл Reveange Kill на бизваре.",
        args: "[reveange_kill]:b",
        handler: (player, args, out) => {
            mafia.reveangeKill = args[0];
            if (mafia.reveangeKill) out.info(`${player.name} включил Reveange Kill на захвате бизнеса`);
            else out.info(`${player.name} выключил Reveange Kill на захвате бизнеса`);
        }
    },
}
