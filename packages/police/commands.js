var chat = require('../chat');
var factions = require('../factions');
var notifs = require('../notifications');
var police = require('./index');

module.exports = {
    "/pcuffs": {
        access: 6,
        description: "Надеть/снять наручники.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            mp.events.call(`police.cuffs`, player, {
                recId: args[0]
            });
        }
    },
    "/pfollow": {
        access: 6,
        description: "Вести игрока за собой.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            mp.events.call(`police.follow`, player, args[0]);
        }
    },
    "/cellls": {
        access: 6,
        description: "Посадить игрока в КПЗ ЛСПД.",
        args: "[ид_игрока]:n [минуты]:n [причина]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);
            var mins = Math.clamp(args[1], 1, 60 * 12); // 12 суток макс.

            police.startLSCellArrest(rec, null, mins * 60 * 1000);
            args.shift();
            args.shift();
            out.info(`${player.name} посадил ${rec.name} в КПЗ на ${mins} мин. Причина: ${args.join(" ")}`);
            chat.push(rec, `!{#ff8819} Администратор ${player.name} посадил Вас в КПЗ на ${mins} мин. Причина: ${args.join(" ")}`);
        }
    },
    "/cellbc": {
        access: 6,
        description: "Посадить игрока в КПЗ БССД.",
        args: "[ид_игрока]:n [минуты]:n [причина]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);
            var mins = Math.clamp(args[1], 1, 60 * 12); // 12 суток макс.

            police.startBCCellArrest(rec, null, mins * 60 * 1000);
            args.shift();
            args.shift();
            out.info(`${player.name} посадил ${rec.name} в КПЗ на ${mins} мин. Причина: ${args.join(" ")}`);
            chat.push(rec, `!{#ff8819} Администратор ${player.name} посадил Вас в КПЗ на ${mins} мин. Причина: ${args.join(" ")}`);
        }
    },
    "/jail": {
        access: 6,
        description: "Посадить игрока в тюрьму за городом.",
        args: "[ид_игрока]:n [минуты]:n [причина]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);
            var mins = Math.clamp(args[1], 1, 60 * 12); // 12 часов макс.

            police.startJailArrest(rec, null, mins * 60 * 1000);
            args.shift();
            args.shift();
            out.info(`${player.name} посадил ${rec.name} в тюрьму на ${mins} мин. Причина: ${args.join(" ")}`);
            chat.push(rec, `!{#ff8819} Администратор ${player.name} посадил Вас в тюрьму на ${mins} мин. Причина: ${args.join(" ")}`);
        }
    },
    "/offjail": {
        access: 4,
        description: "Выдать офлайн jail игроку",
        args: "[имя]:s [фамилия]:s [минуты]:n [причина]",
        handler: async (player, args, out) => {
            let name = `${args[0]} ${args[1]}`;
            let target = mp.players.getByName(name);
            if (target) return out.error('Игрок в сети, используйте /jail', player);

            let character = await db.Models.Character.findOne({
                where: {
                    name: name
                }
            });
            if (!character) return out.error(`Персонаж ${name} не найден`, player);
            let mins = Math.clamp(args[2], 1, 60 * 12); // 12 часов макс.
            args.splice(0, 3);
            let reason = args.join(" ");

            character.arrestTime = mins * 60 * 1000;
            character.arrestType = 1;
            character.save();

            out.info(`${player.name} посадил ${character.name} в тюрьму на ${mins} мин. Причина: ${reason}`);
        }
    },
    "/pwanted": {
        access: 6,
        description: "Изменить розыск игрока.",
        args: "[ид_игрока]:n [розыск]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);
            if (rec.character.wanted == args[1]) return out.error(`${rec.name} уже имеет ${args[1]} ур. розыска`, player);
            police.setWanted(rec, args[1]);

            // notifs.success(player, `${rec.name} имеет ${rec.character.wanted} ур.`, `Розыск`);
            notifs.info(rec, `${player.name} выдал вам ${rec.character.wanted} ур.`, `Розыск`);

            mp.players.forEach(cop => {
                if (!cop.character) return;
                if (!factions.isPoliceFaction(cop.character.factionId) && !factions.isFibFaction(cop.character.factionId)) return;

                notifs.warning(cop, `${player.name} выдал ${rec.character.wanted} ур. ${rec.name}`, `Розыск`);
            });
        }
    },
    "/pvehput": {
        access: 6,
        description: "Запихнуть игрока в авто.",
        args: "[ид_игрока]:n [ид_авто]:n",
        handler: (player, args, out) => {
            mp.events.call(`police.vehicle.put`, player, args[0], args[1]);
        }
    },
    "/pvehrem": {
        access: 6,
        description: "Выпихнуть игрока из авто.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            mp.events.call(`police.vehicle.remove`, player, args[0]);
        }
    },
    "/pgivelic": {
        access: 6,
        description: "Выдать игроку лицензию на оружие.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            mp.events.call(`police.licenses.gun.give`, player, args[0]);
        }
    },
    "/ptakelic": {
        access: 6,
        description: "Забрать у игрока лицензию на оружие.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            mp.events.call(`police.licenses.gun.take`, player, args[0]);
        }
    },
    "/paddcall": {
        access: 6,
        description: "Добавить вызов в планшет.",
        args: "[описание]",
        handler: (player, args, out) => {
            mp.events.call(`mapCase.pd.calls.add`, player, args.join(" "));
        }
    },
    "/premcall": {
        access: 6,
        description: "Удалить вызов из планшета.",
        args: "[ид]:n",
        handler: (player, args, out) => {
            mp.events.call(`mapCase.pd.calls.remove`, player, args[0]);
        }
    },
}
