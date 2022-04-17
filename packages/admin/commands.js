/// Базовые админские команды, описание их структуры находится в модуле test
let admin = require('./index.js');

let chat = call("chat");
let vehicles = call("vehicles");
let notify = call('notifications');
let factions = call('factions');
let timer = call('timer');
let death = call('death');
let utils = call('utils');

module.exports = {

    "/a": {
        access: 1,
        description: "Сообщение в админский чат",
        args: "[сообщение]",
        handler: (player, args) => {
            mp.events.call('admin.notify.all.split', args.join(' '), `!{#b5e865}[A] ${player.name}[${player.id}]: `);
        }
    },
    "/ans": {
        access: 1,
        description: "Ответ игроку",
        args: "[id]:n [сообщение]:s",
        handler: (player, args) => {
            let target = mp.players.at(args[0]);
            if (!target) return player.call('notifications.push.error', ['Игрок не найден', 'Ошибка']);
            args.shift();
            mp.events.call('admin.notify.all.split', args.join(' '), `!{#f29f53}[A] ${player.name}[${player.id}] > ${target.name}[${target.id}]: `);
            target.call('chat.message.split', [args.join(' '), `!{#f29f53}Ответ от ${player.name}[${player.id}]: `]);
        }
    },
    "/msg": {
        access: 4,
        description: "Сообщение в общий чат",
        args: "[сообщение]",
        handler: (player, args) => {
            mp.events.call('admin.notify.players.split', args.join(' '), `!{#ebc71b}${player.name}[${player.id}]: `);
        }
    },
    "/goto": {
        access: 2,
        description: "Телепорт к игроку",
        args: "[ID игрока]",
        handler: (player, args) => {
            if (!args[0]) {
                return;
            }
            let target = mp.players.at(args[0]);
            if (!target) {
                player.call('chat.message.push', [`!{#ffffff} Игрок не найден`]);
                return;
            }
            try {
                player.backPosition = player.position;
                player.backDimension = player.dimension;
                player.position = new mp.Vector3(target.position.x + 2, target.position.y, target.position.z);
                player.dimension = target.dimension;
                player.house.place = target.house.place;
                player.house.id = target.house.id;
                mp.events.call("admin.notify.all", `!{#edffc2}[A] ${player.name} телепортировался к ${target.name}`);
                player.call('chat.message.push', [`!{#ebd13d}Используйте /goback, чтобы вернуться на исходную позицию`]);
            } catch (err) {
                player.call('chat.message.push', [`!{#ffffff}Игрок отключился`]);
            }
        }
    },
    "/goback": {
        access: 2,
        description: "Вернуться на исходную позицию (после /goto)",
        args: "",
        handler: (player, args) => {
            if (!player.backPosition) return notify.error(player, `У вас нет исходной позиции`);
            player.position = player.backPosition;
            player.dimension = player.backDimension;
            notify.info(player, `Вы вернулись на исходную позицию`);
        }
    },
    "/gethere": {
        access: 3,
        description: "Телепорт игрока к себе",
        args: "[ID игрока]",
        handler: (player, args) => {
            if (!args[0]) {
                return;
            }
            let target = mp.players.at(args[0]);
            if (!target) {
                player.call('chat.message.push', [`!{#ffffff}Игрок не найден`]);
                return;
            }
            try {
                target.returnPosition = target.position;
                target.returnDimension = target.dimension;
                utils.setPlayerPosition(target, new mp.Vector3(player.position.x + 2, player.position.y, player.position.z));
                target.dimension = player.dimension;
                target.house.place = player.house.place;
                target.house.id = player.house.id;
                mp.events.call("admin.notify.all", `!{#edffc2}[A] ${player.name} телепортировал к себе ${target.name}`);
                player.call('chat.message.push', [`!{#ebd13d}Используйте /return, чтобы вернуть игрока обратно`]);
                target.call('chat.message.push', [`!{#ffffff}${player.name} телепортировал вас к себе`]);
            } catch (err) {
                player.call('chat.message.push', [`!{#ffffff}Игрок отключился`]);
            }
        }
    },
    "/getveh": {
        access: 3,
        description: "Телепорт транспорта к себе",
        args: "[ID]:n",
        handler: (player, args) => {
            let target = mp.vehicles.at(args[0]);
            if (!target) {
                player.call('chat.message.push', [`!{#ffffff}Транспорт не найден`]);
                return;
            }
            target.position = new mp.Vector3(player.position.x + 1, player.position.y + 1, player.position.z);
        }
    },
    "/rollveh": {
        access: 3,
        description: "Перевернуть транспорт",
        args: "[ID]:n",
        handler: (player, args) => {
            let target = mp.vehicles.at(args[0]);
            if (!target) {
                player.call('chat.message.push', [`!{#ffffff}Транспорт не найден`]);
                return;
            }
            target.position = new mp.Vector3(target.position.x, target.position.y, target.position.z + 1);
            target.rotation = new mp.Vector3(target.rotation.x, target.rotation.y + 180, target.rotation.z);
            target.position = new mp.Vector3(target.position.x, target.position.y, target.position.z - 1);
        }
    },
    "/return": {
        access: 2,
        description: "Вернуть игрока на исходную позицию (после /gethere или /masstp)",
        args: "[ID]:n",
        handler: (player, args) => {
            let target = mp.players.at(args[0]);
            if (!target) return notify.error(player, `Игрок не найден`);
            if (!target.returnPosition) return notify.error(player, `У игрока нет исходной позиции`);
            utils.setPlayerPosition(target, target.returnPosition);
            target.dimension = target.returnDimension;
            target.returnPosition = null;
            target.returnDimension = null;
            notify.info(player, `Вы вернули игрока на исходную позицию`);
            notify.info(target, `${player.character.name} вернул вас на исходную позицию`);
        }
    },
    "/returnall": {
        access: 2,
        description: "Вернуть игроков в радиусе на исходную позицию (после /gethere или /masstp)",
        args: "[радиус]:n",
        handler: (player, args) => {
            let count = 0;
            mp.players.forEachInRange(player.position, args[0], (target) => {
                if (!target.character) return;
                if (target.dimension != player.dimension) return;
                if (!target.returnPosition) return;
                if (target.getVariable('knocked')) return;
                utils.setPlayerPosition(target, target.returnPosition);
                target.dimension = target.returnDimension;
                target.returnPosition = null;
                target.returnDimension = null;
                notify.info(target, `${player.character.name} вернул вас на исходную позицию`);
                count++;
            });
            mp.events.call("admin.notify.all", `!{#edffc2}[A] ${player.name} вернул ${count} чел. на исходную позицию (Радиус: ${args[0]})`);
            notify.info(player, `Вы вернули ${count} чел. на исходную позицию`);
        }
    },
    "/hp": {
        access: 2,
        description: "Выдать здоровье игроку",
        args: "[ID игрока]",
        handler: (player, args) => {
            if (!args[0] || !args[1]) {
                return;
            }
            let target = mp.players.at(args[0]);
            if (!target) {
                player.call('chat.message.push', [`!{#ffffff}Игрок не найден`]);
                return;
            }
            try {
                target.health = parseInt(args[1], 10);
                mp.events.call("admin.notify.all", `!{#edffc2}[A] ${player.name} изменил здоровье игроку ${target.name}`);
            } catch (err) {
                player.call('chat.message.push', [`!{#ffffff}Игрок отключился`]);
            }
        }
    },
    "/kill": {
        access: 4,
        description: "Убить игрока",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return out.error(`Игрок #${args[0]} не найден`, player);

            rec.health = 0;
        }
    },
    "/restart": {
        access: 6,
        description: "Рестарт сервера (Linux)",
        args: "",
        handler: (player, args) => {
            mp.players.forEach((current) => {
                current.call('chat.message.push', [`!{#edffc2}${player.name} запустил рестарт сервера через ${20000 / 1000} сек.`]);
                mp.events.call("playerQuit", current);
            });
            timer.add(() => {
                process.exit();
            }, 20000);
        }
    },
    "/branch": {
        access: 6,
        description: "Переключиться на выбранную ветку.",
        args: "[ветка]",
        handler: (player, args, out) => {

            var exec = require("exec");
            exec(`cd ${__dirname} && git clean -d -f && git stash && git checkout ${args[0]}`, (error, stdout, stderr) => {
                if (error) out.error(stderr, player);
                out.log(stdout, player);
                out.info(`${player.name} переключился на ветку ${args[0]}`);
            });
        }
    },
    "/update": {
        access: 6,
        description: "Обновить текущую ветку.",
        args: "",
        handler: (player, args, out) => {
            var exec = require("exec");
            exec(`cd ${__dirname} && git clean -d -f && git stash && git pull`, (error, stdout, stderr) => {
                if (error) out.error(stderr, player);
                out.log(stdout, player);
                out.info(`${player.name} обновил сборку сервера`);

                mp.players.forEach((current) => {
                    current.call('chat.message.push', [`!{#edffc2}${player.name} обновил сборку сервера`]);
                });
            });
        }
    },
    "/veh": {
        access: 4,
        description: "Заспавнить транспорт",
        args: "[название т/c] [ID цвета #1] [ID цвета #2]",
        handler: async (player, args) => {
            if (vehicles != null) {
                let veh = {
                    modelName: args[0],
                    x: player.position.x,
                    y: player.position.y + 2,
                    z: player.position.z,
                    h: player.heading,
                    color1: parseInt(args[1]),
                    color2: parseInt(args[2]),
                    license: 0,
                    key: "admin",
                    owner: 0,
                    fuel: 40,
                    mileage: 0,
                    plate: vehicles.generateVehiclePlate(),
                    destroys: 0
                };
                veh = await vehicles.spawnVehicle(veh);
                veh.spawnedBy = player.name;
                mp.events.call("admin.notify.all", `!{#e0bc43}[A] ${player.name} создал транспорт ${veh.modelName}`);
            }
        }
    },
    "/mvehs": {
        access: 6,
        description: "Заспавнить N машин [for test]",
        args: "[количество]",
        handler: async (player, args) => {
            if (vehicles != null) {
                for (let i = 0; i < parseInt(args[0]); i++) {
                    let veh = {
                        modelName: 'cheburek',
                        x: 0,
                        y: 0,
                        z: 0,
                        h: 0,
                        color1: parseInt(args[1]),
                        color2: parseInt(args[2]),
                        license: 0,
                        key: "admin",
                        owner: 0,
                        fuel: 40,
                        mileage: 0,
                        plate: vehicles.generateVehiclePlate(),
                        destroys: 0
                    }
                    veh = await vehicles.spawnVehicle(veh);
                }
                mp.events.call("admin.notify.all", `!{#e0bc43}[A] ${player.name} создал ${args[0]} чебуреков`);
            }
        }
    },
    "/pos": {
        access: 1,
        description: "Получить текущие координаты",
        args: "",
        handler: (player, args) => {
            player.call('chat.message.push', [`!{#ffffff} ${player.position.x} ${player.position.y} ${player.position.z}`]);
            console.log(`${player.position.x}, ${player.position.y}, ${player.position.z}`);
        }
    },
    "/timers": {
        access: 5,
        description: "создать N таймеров",
        args: "[count] [ms]",
        handler: (player, args) => {
            for (let i = 0; i < parseInt(args[0]); i++) {
                timer.addInterval(() => {
                    let i = 1 + 1;
                }, parseInt(args[1]));
            }
        }
    },
    "/vcount": {
        access: 5,
        description: "Вывести кол-во машин на сервере",
        args: "",
        handler: (player, args, out) => {
            let private = mp.vehicles.toArray().filter(x => x.key == 'private');
            let admin = mp.vehicles.toArray().filter(x => x.key == 'admin');
            let faction = mp.vehicles.toArray().filter(x => x.key == 'faction');
            let market = mp.vehicles.toArray().filter(x => x.key == 'market');
            let newbie = mp.vehicles.toArray().filter(x => x.key == 'newbie');
            out.info(`Всего транспорта: ${mp.vehicles.length}`, player);
            out.info(`Личные: ${private.length}`, player);
            out.info(`Админские: ${admin.length}`, player);
            out.info(`Фракционные: ${faction.length}`, player);
            out.info(`Авторынок: ${market.length}`, player);
            out.info(`Для новичков: ${newbie.length}`, player);
        }
    },
    "/tpos": {
        access: 3,
        description: "Телепорт по координате",
        args: "[x] [y] [z]",
        handler: (player, args) => {
            var entity = (player.vehicle) ? player.vehicle : player;
            entity.position = new mp.Vector3(parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2]));
        }
    },
    "/warn": {
        access: 3,
        description: "Выдать варн игроку",
        args: "[ид_игрока]:n [причина]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            args.shift();
            var reason = args.join(" ");

            if (rec.character.factionId) factions.deleteMember(rec);
            rec.character.warnNumber++;
            rec.character.warnDate = new Date();

            if (rec.character.warnNumber >= admin.banWarns) { // баним игрока
                rec.character.warnNumber = 0;
                rec.character.warnDate = null;
                rec.account.clearBanDate = new Date(Date.now() + admin.warnsBanDays * 24 * 60 * 60 * 1000);
                rec.account.save();
                mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] забанил игрока ${rec.name}[${rec.id}]: ${reason} (${admin.banWarns} варнов)`);
            } else {
                mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] выдал warn игроку ${rec.name}[${rec.id}]: ${reason}`);
            }
            rec.character.save();
            rec.kick();
        }
    },
    "/offwarn": {
        access: 4,
        description: "Выдать офлайн варн игроку",
        args: "[имя]:s [фамилия]:s [причина]",
        handler: async (player, args, out) => {
            let name = `${args[0]} ${args[1]}`;
            let target = mp.players.getByName(name);
            if (target) return out.error('Игрок в сети, используйте /warn', player);

            let character = await db.Models.Character.findOne({
                where: {
                    name: name
                },
                include: db.Models.Account
            });
            if (!character) return out.error(`Персонаж ${name} не найден`, player);
            let account = character.Account;
            args.splice(0, 2);
            let reason = args.join(" ");

            if (character.factionId) factions.deleteOfflineMember(character);
            character.warnNumber++;
            character.warnDate = new Date();

            if (character.warnNumber >= admin.banWarns) { 
                character.warnNumber = 0;
                character.warnDate = null;
                account.clearBanDate = new Date(Date.now() + admin.warnsBanDays * 24 * 60 * 60 * 1000);
                account.save();
                mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] забанил игрока ${character.name}: ${reason} (${admin.banWarns} варнов)`);
            } else {
                mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] выдал warn игроку ${character.name}: ${reason}`);
            }
            character.save();
        }
    },
    "/unwarn": {
        access: 4,
        description: "Снять все варны игроку",
        args: "[id]:n",
        handler: async (player, args, out) => {
            let target = mp.players.at(args[0]);
            if (!target || !target.character) return out.error(`Игрок #${args[0]} не найден`, player);
            target.character.warnNumber = 0;
            target.character.warnDate = null;
            target.character.save();
            notify.info(player, `${player.name} снял вам все варны`);
            out.info(`${player.name} снял все варны ${target.name}`)
        }
    },
    "/mute": {
        access: 2,
        description: "Запретить текстовый + голосовой чат игроку.",
        args: "[ид_игрока]:n [минуты]:n [причина]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            args.shift();
            var mins = args.shift();
            var reason = args.join(" ");
            var time = mins * 60 * 1000;

            rec.character.muteTime = time;
            rec.character.save();
            chat.setMute(rec, time);
            mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] выдал мут игроку ${rec.name}[${rec.id}] (${mins} мин): ${reason}`);
        }
    },
    "/kick": {
        access: 2,
        description: "Кик игрока",
        args: "[ID] [причина]",
        handler: (player, args) => {
            if (isNaN(parseInt(args[0]))) return; //temp
            let target = mp.players.at(args[0]);
            if (!target || !mp.players.exists(target)) return notify.warning(player, 'Игрок не найден');
            // if (!target.character) return notify.warning(player, 'Игрок не найден');
            args.shift();
            let message = args.join(' ');
            mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] кикнул игрока ${target.name}[${target.id}]: ${message}`);
            target.kick("kicked");
        }
    },
    "/skick": {
        access: 4,
        description: "Тихий кик игрока",
        args: "[ID]",
        handler: (player, args) => {
            if (isNaN(parseInt(args[0]))) return; //temp
            let target = mp.players.at(args[0]);
            if (!target || !mp.players.exists(target)) return notify.warning(player, 'Игрок не найден');
            // if (!target.character) return notify.warning(player, 'Игрок не найден');
            mp.events.call('admin.notify.all', `!{#9e9e9e}[A] Администратор ${player.name}[${player.id}] кикнул игрока ${target.name}[${target.id}] без лишнего шума`);
            target.kick("kicked");
        }
    },
    "/ban": {
        access: 4,
        description: "Забанить игрока.",
        args: "[ид_игрока]:n [дни]:n [причина]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            var days = Math.clamp(args[1], 1, 30);
            args.splice(0, 2);

            mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] забанил игрока ${rec.name}[${rec.id}]: ${args.join(" ")} `);

            rec.account.clearBanDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            rec.account.save();
            rec.kick();
        }
    },
    "/offban": {
        access: 4,
        description: "Забанить игрока оффлайн.",
        args: "[имя] [фамилия] [дни]:n [причина]",
        handler: async (player, args, out) => {
            var name = `${args[0]} ${args[1]}`;
            var days = Math.clamp(args[2], 1, 30);
            args.splice(0, 3);
            var reason = args.join(" ");

            var character = await db.Models.Character.findOne({
                where: {
                    name: name
                },
                include: db.Models.Account
            });
            if (!character) return out.error(`Персонаж ${name} не найден`, player);

            character.Account.clearBanDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            character.Account.save();

            var rec = mp.players.getByName(name);
            if (rec) {
                mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] забанил игрока ${rec.name}[${rec.id}]: ${reason} `);
                rec.kick();
            }

            out.info(`${player.name} забанил ${name} оффлайн на ${days} дней: ${reason}`);
        }
    },
    "/permban": {
        access: 5,
        description: "Забанить игрока перманентно (Account + IP + Social Club + Client Serial).",
        args: "[ид_игрока]:n [причина]",
        handler: async (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            args.shift();
            mp.events.call('admin.notify.players', `!{#db5e4a}Администратор ${player.name}[${player.id}] забанил игрока ${rec.name}[${rec.id}]: ${args.join(" ")} (PERMANENT)`);

            db.Models.Ban.create({
                ip: rec.ip,
                socialClub: rec.socialClub,
                serial: rec.serial,
                reason: args.join(" ")
            });

            rec.account.clearBanDate = new Date(Date.now() + 30 * 365 * 24 * 60 * 60 * 1000);
            rec.account.save();
            rec.kick();
        }
    },
    "/offpermban": {
        access: 5,
        description: "Забанить игрока перманентно офлайн (Account + IP + Social Club).",
        args: "[имя]:s [фамилия]:s [причина]",
        handler: async (player, args, out) => {
            let name = `${args[0]} ${args[1]}`;
            let target = mp.players.getByName(name);
            if (target) return out.error('Игрок в сети, используйте /permban', player);

            let character = await db.Models.Character.findOne({
                where: {
                    name: name
                },
                include: db.Models.Account
            });
            if (!character) return out.error(`Персонаж ${name} не найден`, player);
            let account = character.Account;
            args.splice(0, 2);
            let reason = args.join(" ");

            out.info(`${player.name} выдал пермбан в офлайне игроку ${character.name}: ${reason}`);

            db.Models.Ban.create({
                ip: account.lastIp,
                socialClub: account.socialClub,
                reason: reason
            });

            account.clearBanDate = new Date(Date.now() + 30 * 365 * 24 * 60 * 60 * 1000);
            account.save();
        }
    },
    "/unban": {
        access: 5,
        description: "Разбанить игрока.",
        args: "[имя] [фамилия]",
        handler: async (player, args, out) => {
            var name = args.join(" ");
            var character = await db.Models.Character.findOne({
                where: {
                    name: name
                },
                include: db.Models.Account
            });
            if (!character) return out.error(`Персонаж ${name} не найден`, player);
            if (!character.Account.clearBanDate) return out.error(`Персонаж ${name} не имеет бан`, player);

            character.Account.clearBanDate = null;
            character.Account.save();

            out.info(`${player.name} разбанил ${name}`);
        }
    },
    "/clothes": {
        access: 3,
        description: "Выдача тестовой одежды",
        args: "[тип] [вариация] [текстура]",
        handler: (player, args) => {
            player.setClothes(parseInt(args[0]), parseInt(args[1]), parseInt(args[2]), 0);
        }
    },
    "/prop": {
        access: 3,
        description: "Выдача тестового пропа",
        args: "[тип] [текстура] [вариация]",
        handler: (player, args) => {
            player.setProp(parseInt(args[0]), parseInt(args[1]), parseInt(args[2]));
        }
    },
    "/tempwear": {
        access: 1,
        description: "Выдача временного набора одежды",
        args: "[ID набора]",
        handler: (player, args) => {
            if (args[0] == 0) {
                // player.setHeadOverlay(1, [9, 0, 0, 0]);
                // player.setHeadOverlay(2, [1, 1, 0, 0]);
                player.setClothes(3, 6, 0, 0);
                player.setClothes(8, 15, 0, 0);
                player.setClothes(11, 141, 5, 0);
                player.setClothes(4, 64, 10, 0);
                player.setClothes(6, 31, 0, 0);
            }
            if (args[0] == 1) {
                // player.setHeadOverlay(1, [9, 1, 0, 0]);
                // player.setHeadOverlay(2, [1, 1, 0, 0]);
                player.setClothes(3, 6, 0, 0);
                player.setClothes(8, 4, 0, 0);
                player.setClothes(11, 72, 0, 0);
                player.setClothes(4, 35, 0, 0);
                player.setClothes(6, 10, 0, 0);
            }
            if (args[0] == 2) {
                player.setClothes(3, 6, 0, 0);
                player.setClothes(8, 15, 0, 0);
                player.setClothes(11, 229, 0, 0);
                player.setClothes(4, 7, 0, 0);
                player.setClothes(6, 27, 0, 0);
            }
            if (args[0] == 3) {
                player.setClothes(3, 6, 0, 0);
                player.setClothes(8, 15, 0, 0);
                player.setClothes(11, 229, 1, 0);
                player.setClothes(4, 7, 0, 0);
                player.setClothes(6, 27, 0, 0);
            }
            if (args[0] == 4) {
                player.setClothes(3, 6, 0, 0);
                player.setClothes(8, 4, 0, 0);
                player.setClothes(11, 77, 0, 0);
                player.setClothes(4, 35, 0, 0);
                player.setClothes(6, 10, 0, 0);
            }
        }
    },
    "/rot": {
        access: 6,
        handler: (player, args) => {
            player.call('chat.message.push', [`!{#ffffff} ${player.heading}`]);
            console.log(`${player.heading}`);
            if (player.vehicle) {
                player.call('chat.message.push', [`!{#ffffff} ${player.vehicle.heading}`]);
                console.log(`veh heading = ${player.vehicle.heading}`);
                console.log(`veh rotation = ${JSON.stringify(player.vehicle.rotation)}`);
            }
        }
    },
    "/hair": {
        access: 6,
        handler: (player, args) => {
            if (args[0] == 0) {
                player.setHeadOverlay(2, [1, 1, 0, 0]);
                player.setClothes(2, 4, 0, 0);
            }
            if (args[0] == 1) {
                player.setHeadOverlay(2, [1, 1, 0, 0]);
                player.setClothes(2, 12, 0, 0);
            }
            if (args[0] == 2) {
                player.setHeadOverlay(2, [1, 1, 0, 0]);
                player.setClothes(2, 0, 0, 0);
            }
        }
    },
    "/pinfo": {
        access: 6,
        description: "Логировать игрока в консоль",
        args: "",
        handler: (player) => {
            console.log(player)
        }
    },
    "/vinfo": {
        access: 6,
        description: "Логировать авто в консоль",
        args: "",
        handler: (player) => {
            console.log(player.vehicle)
        }
    },
    "/getpos": {
        access: 6,
        description: "Логировать координаты игрока в консоль",
        args: "",
        handler: (player) => {
            console.log("player.position:")
            console.log(player.position)
            console.log("player.heading:")
            console.log(player.heading)
        }
    },
    "/setadmin": {
        description: "Назначить игрока администратором",
        access: 5,
        args: "[ID] [Уровень администрирования]",
        handler: (player, args, out) => {
            let lvl = parseInt(args[1]);
            let id = parseInt(args[0]);

            if (isNaN(lvl) || lvl < 1 || isNaN(id) || id < 0) return;
            let target = mp.players.at(id);
            if (!target) return player.call('notifications.push.error', [`Игрок не найден`, 'Ошибка']);
            if (lvl >= player.character.admin /*|| target.character.admin > player.character.admin*/ ) return player.call('notifications.push.error', [`Недостаточно прав`, 'Ошибка'])
            target.character.admin = lvl;
            target.character.save();
            out.info(`${player.name} назначил ${target.name} администратором ${lvl} уровня`);
            target.call('chat.message.push', [`!{#ffcf0d} ${player.character.name} назначил вас администратором ${lvl} уровня`]);
            target.call('admin.set', [lvl]);
            mp.events.call("player.admin.changed", target);
        }
    },
    "/deladmin": {
        description: "Снять админку с игрока",
        access: 5,
        args: "[ID]",
        handler: (player, args, out) => {
            let id = parseInt(args[0]);

            if (isNaN(id) || id < 0) return;
            let target = mp.players.at(id);
            if (!target) return player.call('notifications.push.error', [`Игрок не найден`, 'Ошибка']);
            if (player.character.admin < target.character.admin) return player.call('notifications.push.error', [`Недостаточно прав`, 'Ошибка'])
            target.character.admin = 0;
            target.character.save();
            target.call('admin.set', [0]);
            target.call('chat.message.push', [`!{#ff8819} ${player.character.name} забрал у вас права администратора`]);
            out.info(`${player.name} забрал у ${target.name} права администратора`);
            mp.events.call("player.admin.changed", target);
        }
    },
    "/admins": {
        description: "Список администраторов",
        access: 1,
        args: "",
        handler: (player, args) => {
            player.call('chat.message.push', [`!{#ecffbf}Список администраторов в сети:`])
            mp.players.forEach((current) => {
                if (!current.character) return;
                if (current.character.admin) {
                    player.call('chat.message.push', [`!{#ecffbf}${current.character.name} (${current.character.admin} уровень)`]);
                }
            });
        }
    },
    "/setd": {
        description: "Смена измерения",
        access: 4,
        args: "[номер]",
        handler: (player, args) => {
            let dim = parseInt(args[0]);
            if (isNaN(dim)) return;
            player.dimension = dim;
            notify.info(player, `Установлено измерение: ${dim}`);
        }
    },
    "/sethp": {
        description: "Изменить кол-во здоровья игроку. Реанимирует, если игрок лежит.",
        access: 3,
        args: "[ид_игрока]:n [здоровье]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return out.error(`Игрок #${args[0]} не найден`, player);
            rec.health = Math.clamp(args[1], 0, 100);
            out.info(`Игроку ${rec.name} установлено ${rec.health} ед. здоровья`, player);
            notify.info(rec, `${player.name} установил вам ${rec.health} ед. здоровья`);
            if (rec.getVariable("knocked")) death.removeKnocked(rec);
        }
    },
    "/weapon": {
        description: "Выдать оружие игроку (не в инвентарь).",
        access: 4,
        args: "[ид_игрока]:n [ид_оружия] [патроны]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec) return out.error(`Игрок #${args[0]} не найден`, player);
            rec.giveWeapon(mp.joaat(args[1]), args[2]);
        }
    },
    "/q": {
        description: "Отключиться от сервера.",
        access: 1,
        args: "",
        handler: (player, args, out) => {
            out.log(`До скорого!`, player);
            player.kick();
        }
    },
    "/cmdlevel": {
        description: "Установить мин. админ уровень для доступа к команде.",
        access: 6,
        args: "[cmd_name] [level]:n",
        handler: (player, args, out) => {
            var cmd = admin.getCommands()[args[0]];
            if (!cmd) return out.error(`Команда ${args[0]} не найдена`, player);
            if (args[1] > player.character.admin) return out.error(`Нельзя установить уровень команды выше своего`, player);
            cmd.access = args[1];
            out.info(`${player.name} установил для команды ${args[0]} уровень доступа ${args[1]}`);
        }
    },
    "/cmd": {
        description: "Вызвать команду от имени другого игрока.",
        access: 6,
        args: "[player_id]:n [cmd]",
        handler: (player, args, out) => {
            var rec = mp.players.at(args.shift());
            if (!rec) return out.error(`Игрок #${args[0]} не найден`, player);

            mp.events.call("terminal.command.handle", rec, args);
        }
    },
    "/godmode": {
        description: "Вкл/выкл бессмертие.",
        access: 6,
        args: "",
        handler: (player, args, out) => {
            player.godmode = !player.godmode;
            player.call(`godmode.set`, [player.godmode]);
            if (player.godmode) return out.log(`Бессмертие включено`, player);
            else return out.log(`Бессмертие выключено`, player);
        }
    },
    "/blip": {
        description: "Создать блип.",
        access: 1,
        args: "[тип]:n [масштаб]:n",
        handler: (player, args, out) => {
            mp.blips.new(args[0], player.position, {
                color: 1,
                name: `blip`,
                shortRange: 10,
                scale: args[1]
            })
        }
    },
    "/modules": {
        description: "Список включенных модулей на сервере.",
        access: 1,
        args: "",
        handler: (player, args, out) => {
            var text = `Список включенных модулей:<br/>`
            activeServerModules.forEach(moduleName => {
                try {
                    var commands = require(`../${moduleName}/commands`);
                    var count = Object.keys(commands).length;
                    text += `${moduleName} (${count} команд)<br/>`;
                } catch (e) {
                    text += `${moduleName}<br/>`;
                }
            });
            text += `<br/>Всего модулей: ${activeServerModules.length} шт.`;
            out.log(text, player);
        }
    },
    "/module": {
        description: "Список команд в модуле.",
        access: 1,
        args: "[модуль]",
        handler: (player, args, out) => {
            try {
                var commands = require(`../${args[0]}/commands`);
                var text = `Команды модуля ${args[0]}:<br/><br/>`;
                for (var name in commands) {
                    var cmd = commands[name];
                    // if (cmd.access > player.character.admin) continue;
                    text += `<b>${name}</b> ${cmd.args} (${cmd.access} lvl.) - ${cmd.description}<br/>`;
                }
                var keys = Object.keys(commands);
                text += `<br/>Всего команд: ${keys.length} шт.<br/>Введите "help [name]" или "help [level]" для ознакомления с командой`;
                out.log(text, player);
            } catch (e) {
                debug(e);
                return out.error(`Модуль ${args[0]} не найден. Список включенных модулей: /modules.`, player);
            }
        }
    },
    "/effect": {
        description: "Включить визуальный эффект.",
        access: 1,
        args: "[эффект] [продолжительность]:n",
        handler: (player, args, out) => {
            player.call(`effect`, args);
        }
    },
    "/sound": {
        description: "Включить звуковой эффект.",
        access: 1,
        args: "[name] [set_name]",
        handler: (player, args, out) => {
            player.call(`sound`, [{
                name: args[0],
                setName: args[1]
            }]);
        }
    },
    "/red": {
        description: "Включить/отключить красный ник",
        access: 2,
        args: "",
        handler: (player, args, out) => {
            if (!player.hasRedNick) {
                player.setVariable('redNick', true);
                player.hasRedNick = true;
                out.info('Красный ник включен', player);
            } else {
                player.setVariable('redNick', false);
                player.hasRedNick = false;
                out.info('Красный ник отключен', player);
            }
        }
    },
    "/masstp": {
        description: "Включить/отключить массовый телепорт",
        access: 4,
        args: "",
        handler: (player, args, out) => {
            let data = admin.getMassTeleportData();
            if (data.position) {
                admin.setMassTeleportData(null, null);
                out.info(`${player.character.name} отключил массовый телепорт`);
            } else {
                admin.setMassTeleportData(player.position, player.dimension);
                out.info(`${player.character.name} включил массовый телепорт`);
            }
        }
    },
    "/hpall": {
        access: 2,
        description: "Пополнить здоровье игрокам в радиусе",
        args: "[радиус]:n",
        handler: (player, args, out) => {
            let radius = args[0];
            mp.players.forEachInRange(player.position, radius, (current) => {
                if (!current.character) return;
                if (current.dimension == player.dimension) {
                    current.health = 100;
                    notify.info(current, `Ваше здоровье восстановлено администратором`);
                };
            });
            mp.events.call("admin.notify.all", `!{#edffc2}[A] ${player.name} пополнил HP игрокам в радиусе ${radius}`);
        }
    },
    "/collision": {
        access: 3,
        description: "Уменьшить капсулу коллизии игрока.",
        args: "",
        handler: (player, args, out) => {
            if (player.isCapsuleCollision) {
                delete player.isCapsuleCollision;
                player.call(`collision.set`, [false]);
                out.info(`Коллизия включена`, player);
            } else {
                player.isCapsuleCollision = true;

                player.call(`collision.set`, [true]);
                out.info(`Коллизия отключена`, player);
            }
        }
    },
    "/slap": {
        access: 2,
        description: "Дать пинка игроку.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            rec.call("slap");
            notify.warning(rec, `Администратор пнул вас`);
        }
    },
    "/skin": {
        access: 4,
        description: "Изменить скин.",
        args: "[id]:n [модель]",
        handler: (player, args, out) => {
            let target = mp.players.at(args[0]);
            if (!target) return out.error(`Игрок не найден`, player);;
            target.model = mp.joaat(args[1]);
            notify.info(target, `${player.name} установил вам скин`);
            out.log(`Скин изменен`, player);
        }
    },
    "/vanish": {
        description: "Включить/отключить режим невидимки",
        access: 2,
        args: "",
        handler: (player, args, out) => {
            if (!player.isVanished) {
                player.setVariable('isVanished', true);
                player.isVanished = true;
                out.info('Режим невидимки включен', player);
            } else {
                player.setVariable('isVanished', false);
                player.isVanished = false;
                out.info('Режим невидимки отключен', player);
            }
        }
    },
    "/stats": {
        description: "Статистика персонажа",
        access: 5,
        args: "[ID]:n",
        handler: (player, args, out) => {
            let target = mp.players.at(args[0]);
            if (!target) return out.error('Игрок не найден', player);

            let data = target.character.dataValues;
            data.phone = target.phone ? target.phone.number : null;
            player.call('admin.stats.show', [JSON.stringify(data)]);
        }
    },
    "/setnick": {
        access: 5,
        description: "Сменить ник игроку",
        args: "[id]:n [имя]:s [фамилия]:s",
        handler: (player, args, out) => {
            let target = mp.players.at(args[0]);
            if (!target || !target.character) out.error('Игрок не найден', player);
            out.info(`${player.name} сменил ник игроку ${target.character.name} на ${args[1]} ${args[2]}`);
            target.character.name = `${args[1]} ${args[2]}`;
            target.character.save();
            target.call('chat.message.push', [`!{#ffbe4f}Администратор ${player.name} сменил ваш ник на ${args[1]} ${args[2]}`]);
            target.call('chat.message.push', [`!{#ffbe4f}Перезайдите в игру (F1)`]);
            target.kick('kicked');
        }
    },
    "/removeaccount": {
        access: 6,
        description: "Удалить аккаунт игрока",
        args: "[id]:n",
        handler: (player, args, out) => {
            admin.removeAccount(args[0]);
        }
    },
    "/removecharacter": {
        access: 6,
        description: "Удалить персонажа игрока",
        args: "[id]:n",
        handler: (player, args, out) => {
            admin.removeCharacter(args[0]);
        }
    },
    "/removeallaccounts": {
        access: 6,
        description: "Удалить все аккаунты",
        args: "",
        handler: (player, args, out) => {
            admin.removeAccounts();
        }
    },
    "/removeallcharacters": {
        access: 6,
        description: "Удалить всех персонажей",
        args: "",
        handler: (player, args, out) => {
            admin.removeCharacters();
        }
    },
}
