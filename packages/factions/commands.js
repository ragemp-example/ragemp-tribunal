let factions = require('./index');
let notifs = require('../notifications');

module.exports = {
    "/flist": {
        description: "Посмотреть список организаций.",
        access: 1,
        args: "",
        handler: (player, args, out) => {
            var text = "ID) Имя [бп] [макс. бп] [мед] [макс. мед] | блип | цвет_блипа | ранг склада<br/>";
            for (var i = 0; i < factions.factions.length; i++) {
                var faction = factions.factions[i];
                text += `${faction.id}) ${faction.name} [${faction.ammo}] [${faction.maxAmmo}] [${faction.medicines}] [${faction.maxMedicines}] | ${faction.blip} | ${faction.blipColor} | ${faction.ammoRank}<br/>`;
            }
            out.log(text, player);
        }
    },
    "/ftp": {
        description: "Телепортироваться к организации.",
        access: 1,
        args: "[ид_организации]:n",
        handler: (player, args, out) => {
            var marker = factions.getMarker(args[0]);
            if (!marker) return out.error(`Организация #${args[0]} не найдена`, player);
            var pos = marker.position;
            pos.z++;
            player.position = pos;
            player.dimension = marker.dimension;
            out.info(`Вы телепортировались к организации #${args[0]}`, player);
        }
    },
    "/fsetname": {
        description: "Сменить имя организации.",
        access: 6,
        args: "[ид_организации]:n [имя]",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            args.splice(0, 1);
            var name = args.join(" ").trim();
            out.info(`${player.name} сменил имя у организации ${faction.name} (${faction.name} => ${name})`);
            faction.name = name;
            faction.save();
        }
    },
    "/fsetleaderoff": {
        description: "Сменить лидера организации оффлайн.",
        access: 6,
        args: "[ид_организации]:n [имя] [фамилия]",
        handler: async (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            var fullName = `${args[1]} ${args[2]}`;
            var rec = mp.players.getByName(fullName);
            var character = (rec) ? rec.character : await db.Models.Character.findOne({
                attributes: ['id', 'faction', 'factionRank'],
                where: {
                    name: fullName
                }
            });;
            if (!character) return out.error(`Персонаж ${fullName} не найден`, player);

            out.info(`${player.name} добавил лидера организации ${faction.name} оффлайн (#${character.id})`);
            character.factionId = faction.id;
            character.factionRank = factions.getMaxRank(faction).id;
            character.save();
        }
    },
    "/fsetleader": {
        description: "Сменить лидера организации.",
        access: 1,
        args: "[ид_игрока]:n [ид_организации]:n",
        handler: async (player, args, out) => {
            var faction = factions.getFaction(args[1]);
            if (!faction) return out.error(`Организация #${args[1]} не найдена`, player);

            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            out.info(`${player.name} добавил лидера организации ${faction.name} (${rec.name})`);
            factions.setLeader(faction, rec);
        }
    },
    "/fuval": {
        description: "Уволить игрока из организации.",
        access: 1,
        args: "[ид_игрока]:n",
        handler: async (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            if (!rec.character.factionId) return out.error(`${rec.name} не состоит в организации`, player);
            var faction = factions.getFaction(rec.character.factionId);
            if (!faction) return out.error(`Организация #${rec.character.factionId} не найдена`, player);

            out.info(`${player.name} уволил ${rec.name} из организации ${faction.name}`);
            factions.deleteMember(rec);
        }
    },
    "/fadd": {
        description: "Добавить игрока в организацию.",
        access: 6,
        args: "[ид_игрока]:n [ид_организации]:n",
        handler: async (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            var faction = factions.getFaction(args[1]);
            if (!faction) return out.error(`Организация #${args[1]} не найдена`, player);


            out.info(`${player.name} добавил ${rec.name} в организацию ${faction.name}`);
            factions.addMember(faction, rec);
        }
    },
    "/fgiverank": {
        description: "Изменить ранг игрока в организацию.",
        access: 6,
        args: "[ид_игрока]:n [ранг]:n",
        handler: async (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            if (!rec.character.factionId) return out.error(`${rec.name} не состоит в организации`, player);

            var rank = factions.getRank(rec.character.factionId, args[1]);
            if (!rank) return out.error(`Ранг #${args[1]} не найден`, player);

            out.info(`${player.name} изменил ранг ${rec.name} (${rank.rank})`);
            factions.setRank(rec, rank);
        }
    },
    "/fsetammo": {
        description: "Изменить количество боеприпасов на складе организации.",
        access: 1,
        args: "[ид_организации]:n [боеприпасы]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            out.info(`${player.name} изменил количество боеприпасов у организации ${faction.name} (${faction.ammo} => ${args[1]})`);
            factions.setAmmo(faction, args[1]);
        }
    },
    "/fsetmaxammo": {
        description: "Изменить вместимость боеприпасов на складе организации.",
        access: 6,
        args: "[ид_организации]:n [вместимость]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            out.info(`${player.name} изменил вместимость боеприпасов на складе у организации ${faction.name} (${faction.maxAmmo} => ${args[1]})`);
            factions.setMaxAmmo(faction, args[1]);
        }
    },
    "/fsetmeds": {
        description: "Изменить количество медикаментов на складе организации.",
        access: 6,
        args: "[ид_организации]:n [медикаменты]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            out.info(`${player.name} изменил количество медикаментов у организации ${faction.name} (${faction.medicines} => ${args[1]})`);
            factions.setMedicines(faction, args[1]);
        }
    },
    "/fsetmaxmeds": {
        description: "Изменить вместимость медикаментов на складе организации.",
        access: 6,
        args: "[ид_организации]:n [вместимость]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            out.info(`${player.name} изменил вместимость медикаментов на складе у организации ${faction.name} (${faction.maxMedicines} => ${args[1]})`);
            factions.setMaxMedicines(faction, args[1]);
        }
    },
    "/fsetblip": {
        description: "Изменить блип на карте у организации.",
        access: 5,
        args: "[ид_организации]:n [тип_блипа]:n [цвет_блипа]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            out.info(`${player.name} изменил блип у организации ${faction.name} (${faction.blip}-${faction.blipColor} => ${args[0]}-${args[1]})`);
            factions.setBlip(faction, args[1], args[2]);
        }
    },
    "/fsetammorank": {
        description: "Изменить минимальный ранг, с которого можно брать ящики БП/Мед со склада организации.",
        access: 4,
        args: "[ид_организации]:n [ранг]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            args[1] = Math.clamp(args[1], 0, faction.ranks.length - 1);

            out.info(`${player.name} изменил мин. ранг для доступа к складу у организации ${faction.name} (${faction.ammoRank} => ${args[1]})`);
            factions.setAmmoRank(faction, args[1]);
        }
    },
    "/fsetpos": {
        description: "Изменить позицию организации. Позиция берется от игрока.",
        access: 6,
        args: "[ид_организации]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            var pos = player.position;
            faction.x = pos.x;
            faction.y = pos.y;
            faction.z = pos.z;
            faction.h = player.heading;
            faction.d = player.dimension;
            faction.save();
            pos.z -= 1;

            var marker = factions.getMarker(faction.id);
            marker.position = pos;
            marker.dimension = faction.d;
            var blip = factions.getBlip(faction.id);
            blip.position = pos;
            blip.dimension = faction.d;

            out.info(`${player.name} изменил позицию у организации ${faction.name}`);
        }
    },
    "/fsetwarehousepos": {
        description: "Изменить позицию склада организации. Позиция берется от игрока.",
        access: 6,
        args: "[ид_организации]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            var pos = player.position;
            faction.wX = pos.x;
            faction.wY = pos.y;
            faction.wZ = pos.z;
            faction.wD = player.dimension;
            faction.save();
            pos.z -= 1;

            var warehouse = factions.getWarehouse(faction.id);
            warehouse.colshape.destroy();
            warehouse.position = pos;
            warehouse.dimension = faction.wD;
            pos.z += 2;
            warehouse.label.position = pos;
            warehouse.label.dimension = faction.wD;

            var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, warehouse.dimension);
            colshape.onEnter = warehouse.colshape.onEnter;
            colshape.onExit = warehouse.colshape.onExit;
            warehouse.colshape = colshape;


            out.info(`${player.name} изменил позицию склада у организации ${faction.name}`);
        }
    },
    "/fsetstoragepos": {
        description: "Изменить позицию выдачи предметов организации. Позиция берется от игрока.",
        access: 6,
        args: "[ид_организации]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            var pos = player.position;
            faction.sX = pos.x;
            faction.sY = pos.y;
            faction.sZ = pos.z;
            faction.sD = player.dimension;
            faction.save();
            pos.z -= 1;

            var storage = factions.getStorage(faction.id);
            storage.colshape.destroy();
            storage.position = pos;
            storage.dimension = faction.sD;

            var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, storage.dimension);
            colshape.onEnter = storage.colshape.onEnter;
            colshape.onExit = storage.colshape.onExit;
            storage.colshape = colshape;

            out.info(`${player.name} изменил позицию выдачи предметов у организации ${faction.name}`);
        }
    },
    "/fsetholderpos": {
        description: "Изменить позицию шкафа организации. Позиция берется от игрока.",
        access: 6,
        args: "[ид_организации]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            var pos = player.position;
            faction.hX = pos.x;
            faction.hY = pos.y;
            faction.hZ = pos.z;
            faction.hD = player.dimension;
            faction.save();
            pos.z -= 1;

            var holder = factions.getHolder(faction.id);
            holder.colshape.destroy();
            holder.position = pos;
            holder.dimension = faction.hD;

            var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, holder.dimension);
            colshape.onEnter = holder.colshape.onEnter;
            colshape.onExit = holder.colshape.onExit;

            holder.colshape = colshape;

            out.info(`${player.name} изменил позицию шкафа у организации ${faction.name}`);
        }
    },
    "/fsetcommonpos": {
        description: "Изменить позицию общего шкафа организации. Позиция берется от игрока.",
        access: 6,
        args: "[ид_организации]:n",
        handler: (player, args, out) => {
            let faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            let pos = player.position;
            faction.chX = pos.x;
            faction.chY = pos.y;
            faction.chZ = pos.z;
            faction.chD = player.dimension;
            faction.save();
            pos.z -= 1;

            let holder = factions.getCommonHolder(faction.id);
            holder.colshape.destroy();
            holder.position = pos;
            holder.dimension = faction.chD;

            let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
            colshape.dimension = faction.chD;
            colshape.onEnter = holder.colshape.onEnter;
            colshape.onExit = holder.colshape.onExit;

            holder.colshape = colshape;

            out.info(`${player.name} изменил позицию общего шкафа у организации ${faction.name}`);
        }
    },
    "/franks": {
        description: "Получить список рангов организации.",
        access: 6,
        args: "[ид_организации]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            var text = `Организация ${faction.name}:<br/>`;
            for (var i = 0; i < faction.ranks.length; i++) {
                var rank = faction.ranks[i];
                text += `${i + 1}) ${rank.name} - $${rank.pay}<br/>`;
            }

            out.log(text, player);
        }
    },
    "/fsetrankname": {
        description: "Изменить название ранга.",
        access: 6,
        args: "[ид_организации]:n [номер_ранга]:n [название]",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            var rank = faction.ranks[args[1] - 1];

            args.splice(0, 2);
            var name = args.join(" ").trim();
            out.info(`${player.name} изменил название ранга ${rank.rank} у организации ${faction.name} (${rank.name} => ${name})`);
            rank.name = name;
            rank.save();
        }
    },
    "/fsetrankpay": {
        description: "Изменить зарплату ранга.",
        access: 6,
        args: "[ид_организации]:n [номер_ранга]:n [сумма]:n",
        handler: (player, args, out) => {
            var faction = factions.getFaction(args[0]);
            if (!faction) return out.error(`Организация #${args[0]} не найдена`, player);

            var rank = faction.ranks[args[1] - 1];

            out.info(`${player.name} изменил зарплату ранга ${rank.pay} у организации ${faction.name} (${rank.pay} => ${args[2]})`);
            rank.pay = args[2];
            rank.save();
        }
    },
}
