let inventory = require('./index');

module.exports = {
    "/invdelete": {
        access: 6,
        description: "Удалить предмет из инвентаря игрока.",
        args: "[ид_игрока]:n [ид_предмета]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(player, `Игрок #${args[0]} не найден`);
            inventory.deleteItem(rec, args[1]);
        }
    },
    "/invadditems": {
        access: 6,
        description: "Добавить тестовые предметы в инвентарь игрока.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);
            inventory.addItem(rec, 1, {
                variation: 1,
                texture: 0,
                sex: 1
            });
            inventory.addItem(rec, 6, {
                variation: 1,
                texture: 0,
                sex: 1
            });
            inventory.addItem(rec, 14, {
                variation: 1,
                texture: 0,
                sex: 1
            });
            inventory.addItem(rec, 2, {
                variation: 1,
                texture: 0,
                sex: 1
            });
            inventory.addItem(rec, 3, {
                variation: 12,
                texture: 1,
                sex: 1,
                pockets: '[3,3,3,3,5,4,5,5,10,6,6,6]',
                health: 100,
            });
            inventory.addItem(rec, 7, {
                variation: 1,
                texture: 0,
                torso: 0,
                sex: 1,
                pockets: '[4,5,5,5,5,5]'
            });
            inventory.addItem(rec, 11, {
                variation: 1,
                texture: 0,
                sex: 1
            });
            inventory.addItem(rec, 10, {
                variation: 1,
                texture: 0,
                sex: 1
            });
            inventory.addItem(rec, 12, {
                variation: 1,
                texture: 0,
                sex: 1
            });
            inventory.addItem(rec, 13, {
                variation: 45,
                texture: 0,
                sex: 1,
                pockets: '[2,2,6,5,2,3,6,6,12,10]'
            });
            inventory.addItem(rec, 8, {
                variation: 1,
                texture: 0,
                sex: 1,
                pockets: '[6,6,6,6,8,10]'
            });
            inventory.addItem(rec, 9, {
                variation: 1,
                texture: 0,
                sex: 1
            });

            out.info(`Тестовые предметы добавлены`, player);
        }
    },
    "/invclearitems": {
        access: 6,
        description: "Очистить инвентарь игрока.",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);
            inventory.clearItems(rec);
            out.info(`Инвентарь ${rec.name} очищен`, player);
        }
    },
    "/invlist": {
        description: "Посмотреть общую информация о предметах инвентаря.",
        access: 3,
        args: "",
        handler: (player, args, out) => {
            var text = "ID) Имя (Описание) [вес] [обыск] [высота X ширина] | модель | DeltaZ | rX | rY<br/>";
            for (var i = 0; i < inventory.inventoryItems.length; i++) {
                var item = inventory.inventoryItems[i];
                text += `${item.id}) ${item.name} (${item.description}) [${item.weight} кг] [${item.chance}%] [${item.height}x${item.width}] | ${item.model} | ${item.deltaZ} | ${item.rX} | ${item.rY}<br/>`;
            }
            out.log(text, player);
        }
    },
    "/invattachinfo": {
        description: "Посмотреть настройки аттачей предметов к руке.",
        access: 3,
        args: "",
        handler: (player, args, out) => {
            var text = "ID) Имя | Bone | Pos | Rot| Anim<br/>";
            for (var i = 0; i < inventory.inventoryItems.length; i++) {
                var item = inventory.inventoryItems[i];
                var info = item.attachInfo;
                text += `${item.id}) ${item.name} | ${info.bone} | ${info.pos} | ${info.rot} | ${info.anim}<br/>`;
            }
            out.log(text, player);
        }
    },
    "/invsetitemname": {
        description: "Изменить название предмета инвентаря. (см. /invlist)",
        access: 6,
        args: "[ид_предмета]:n [название]",
        handler: (player, args, out) => {
            console.log(args[0] - 1)
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            args.splice(0, 1);
            var name = args.join(" ").trim();
            out.info(`${player.name} изменил название предмета #${item.id} (${item.name} => ${name})`);
            item.name = name;
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetitemdesc": {
        description: "Изменить описание предмета инвентаря. (см. /invlist)",
        access: 6,
        args: "[ид_предмета]:n [описание]",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            args.splice(0, 1);
            var desc = args.join(" ").trim();
            out.info(`${player.name} изменил описание предмета #${item.id} (${item.description} => ${desc})`);

            item.description = desc;
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetitemweight": {
        description: "Изменить вес предмета инвентаря. (см. /invlist)",
        access: 6,
        args: "[ид_предмета]:n [вес]:n",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            out.info(`${player.name} изменил вес предмета #${item.id} (${item.weight} => ${args[1]})`);
            item.weight = args[1];
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetitemsize": {
        description: "Изменить размер предмета инвентаря. (см. /invlist)",
        access: 6,
        args: "[ид_предмета]:n [высота]:n [ширина]:n",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            out.info(`${player.name} изменил размер предмета #${args[0]} (${item.height}x${item.width} => ${args[1]}x${args[2]})`);
            item.height = args[1];
            item.width = args[2];
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetitemmodel": {
        description: "Изменить модель предмета инвентаря. Эта модель используется, когда игрок выкидывает предмет. (см. /invlist)",
        access: 6,
        args: "[ид_предмета]:n [модель]",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            var model = args[1].trim();
            out.info(`${player.name} изменил модель предмета #${args[0]} (${item.model} => ${model})`);
            item.model = model;
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetitemdeltaz": {
        description: "Изменить deltaZ предмета инвентаря. Смещение модели по высоте, когда игрок выкидывает предмет. (см. /invlist)",
        access: 6,
        args: "[ид_предмета]:n [deltaZ]:n",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            out.info(`${player.name} изменил deltaZ предмета #${args[0]} (${item.deltaZ} => ${args[1]})`);
            item.deltaZ = args[1];
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetitemrot": {
        description: "Изменить rotation предмета инвентаря. Поворот модели, когда игрок выкидывает предмет. (см. /invlist)",
        access: 6,
        args: "[ид_предмета]:n [x]:n [y]:n",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            out.info(`${player.name} изменил rotation предмета #${args[0]} (${item.rX}x${item.rY} => ${args[1]}x${args[2]})`);
            item.rX = args[1];
            item.rY = args[2];
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetattachbone": {
        description: "Изменить bone аттача предмета в руке. (см. /invattachinfo)",
        access: 6,
        args: "[ид_предмета]:n [bone]:n",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            var info = item.attachInfo;
            out.info(`${player.name} изменил bone аттача предмета в руке #${args[0]} (${info.bone} => ${args[1]})`);
            info.bone = args[1];
            item.attachInfo = info;
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetattachpos": {
        description: "Изменить позицию аттача предмета в руке. (см. /invattachinfo)",
        access: 6,
        args: "[ид_предмета]:n [x]:n [y]:n [z]:n",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            var info = item.attachInfo;
            args.shift();
            out.info(`${player.name} изменил позицию аттача предмета в руке #${item.id} (${info.pos} => ${args})`);
            info.pos = args;
            item.attachInfo = info;
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetattachrot": {
        description: "Изменить поворот аттача предмета в руке. (см. /invattachinfo)",
        access: 6,
        args: "[ид_предмета]:n [x]:n [y]:n [z]:n",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            var info = item.attachInfo;
            args.shift();
            out.info(`${player.name} изменил поворот аттача предмета в руке #${item.id} (${info.rot} => ${args})`);
            info.rot = args;
            item.attachInfo = info;
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/invsetattachanim": {
        description: "Изменить анимацию аттача предмета в руке. 0 - ВЫКЛ (см. /invattachinfo)",
        access: 6,
        args: "[ид_предмета]:n [animId]:n",
        handler: (player, args, out) => {
            var item = inventory.inventoryItems[args[0] - 1];
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            var info = item.attachInfo;
            out.info(`${player.name} изменил анимацию аттача предмета в руке #${item.id} (${info.anim} => ${args[1]})`);
            info.anim = args[1];
            item.attachInfo = info;
            item.save();
            inventory.updateItemInfo(item);
        }
    },
    "/idebug": {
        description: "Вкл/выкл режим дебага инвентаря у всех игроков.",
        access: 6,
        args: "[дебаг]:b",
        handler: (player, args, out) => {
            mp.players.forEach((rec) => {
                if (!rec.character) return;
                rec.call(`inventory.debug`, [args[0]]);
            });
            var val = (args[0]) ? "включил" : "выключил";
            out.info(`${player.name} ${val} DEBUG-режим инвентаря`);
        }
    },
    "/ispin": {
        description: "Вкл/выкл режим спина инвентаря у всех игроков.",
        access: 6,
        args: "[спин]:b",
        handler: (player, args, out) => {
            mp.players.forEach((rec) => {
                if (!rec.character) return;
                rec.call(`inventory.spin`, [args[0]]);
            });
            var val = (args[0]) ? "включил" : "выключил";
            out.info(`${player.name} ${val} SPIN-режим инвентаря`);
        }
    },
    "/invweight": {
        description: "Получить вес предмета.",
        access: 6,
        args: "[ид_предмета]:n",
        handler: (player, args, out) => {
            var item = inventory.getItem(player, args[0]);
            if (!item) return out.error(`Предмет #${args[0]} не найден`, player);

            out.info(`Вес: ${inventory.getItemWeight(player, item)}`, player);
        }
    },
    "/invcommon": {
        description: "Получить общий вес предметов у игрока.",
        access: 6,
        args: "",
        handler: (player, args, out) => {
            out.info(`Общий вес: ${inventory.getCommonWeight(player)}`, player);
        }
    },
    "/pitems": {
        access: 6,
        description: "Логировать предметы игрока в консоль.",
        args: "",
        handler: (player) => {
            console.log(player.inventory.items)
        }
    },
    "/vitems": {
        access: 6,
        description: "Логировать предметы багажника в консоль.",
        args: "",
        handler: (player) => {
            console.log(player.vehicle.inventory.items)
        }
    },
    "/vitemids": {
        access: 6,
        description: "Логировать иды предметов багажника в консоль.",
        args: "",
        handler: (player) => {
            debug(player.vehicle.inventory.items.map(x => x.id));
        }
    },
    "/pitemids": {
        access: 6,
        description: "Логировать иды предметов игрока в консоль.",
        args: "",
        handler: (player) => {
            debug(player.inventory.items.map(x => x.id));
        }
    },
    "/invmoveitem": {
        access: 6,
        description: "Передать предмет от одного игрока к другому.",
        args: "[ид_игрока_из]:n [ид_игрока_к]:n [ид_предмета]:n",
        handler: (player, args, out) => {
            var playerFrom = mp.players.at(args[0]);
            if (!playerFrom || !playerFrom.character) return out.error(`Игрок_ИЗ не найден`);

            var playerTo = mp.players.at(args[1]);
            if (!playerTo || !playerTo.character) return out.error(`Игрок_К не найден`);

            var item = inventory.getItem(playerFrom, args[2]);
            if (!item) return out.error(`Предмет #${args[2]} не найден`);

            inventory.moveItemToPlayer(playerFrom, playerTo, item, (e) => {
                if (e) return out.error(e);

                out.info(`${player.name} передал ${inventory.getName(item.itemId)} от ${playerFrom.name} к ${playerTo.name}`);
            });
        }
    },
}
