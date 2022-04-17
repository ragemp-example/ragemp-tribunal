let world = call('world');

module.exports = {
    "/worldadd": {
        access: 3,
        description: "Добавить объект мира. Позиция берется от игрока.<br/>Хеш - по-умолчанию ставить 0.<br/>Типы: 1 - дерево, 2 - камень",
        args: "[тип]:n [радиус]:n [хеш]:n [название]",
        handler: (player, args, out) => {
            args[0] = Math.clamp(args[0], 0, 2);
            args[2] = args[2].toString();
            var name = args.slice(3).join(" ");

            player.call(`world.objects.add`, [args[0], args[1], args[2], name]);
        }
    },
    "/worlddel": {
        access: 3,
        description: "Удалить объект мира. ID смотреть в /worldshow",
        args: "[ид]:n",
        handler: (player, args, out) => {
            if (!world.colshapes[args[0]]) return out.error(`Объект мира #${args[0]} не найден`, player);

            world.deleteObject(args[0]);
            mp.players.forEach(rec => {
                if (!rec.character || !rec.character.admin) return;
                rec.call(`world.objects.delete`, [args[0]]);
            });
            out.info(`${player.name} удалил объект мира #${args[0]}`);
        }
    },
    "/worldsetname": {
        access: 3,
        description: "Изменить название объекта мира. ID смотреть в /worldshow",
        args: "[ид]:n [название]",
        handler: (player, args, out) => {
            var obj = world.colshapes[args[0]].db;
            if (!obj) return out.error(`Объект мира #${args[0]} не найден`, player);

            args.shift();
            var name = args.join(" ");
            out.info(`${player.name} изменил название объекта мира #${obj.id} (${obj.name} => ${name})`);

            obj.name = name;
            obj.save();

            mp.players.forEach(rec => {
                if (!rec.character || !rec.character.admin) return;
                rec.call(`world.objects.params.set`, [obj.id, 'name', obj.name]);
            });
        }
    },
    "/worldsethash": {
        access: 3,
        description: "Изменить хеш объекта мира. ID смотреть в /worldshow",
        args: "[ид]:n [хеш]:n",
        handler: (player, args, out) => {
            var obj = world.colshapes[args[0]].db;
            if (!obj) return out.error(`Объект мира #${args[0]} не найден`, player);

            out.info(`${player.name} изменил хеш объекта мира #${obj.id} (${obj.hash} => ${args[1]})`);

            obj.hash = args[1];
            obj.save();
            mp.players.forEach(rec => {
                if (!rec.character || !rec.character.admin) return;
                rec.call(`world.objects.params.set`, [obj.id, 'hash', obj.hash]);
            });
        }
    },
    "/worldsetpos": {
        access: 3,
        description: "Изменить позицию объекта мира. Позиция берется от игрока.<br/>Хеш - по-умолчанию ставить 0.<br/>Типы: 1 - дерево, 2 - камень",
        args: "[ид]:n",
        handler: (player, args, out) => {
            if (!world.colshapes[args[0]]) return out.error(`Объект мира #${args[0]} не найден`, player);

            player.call(`world.objects.position.set`, [args[0]]);
        }
    },
    "/worldsetradius": {
        access: 3,
        description: "Изменить радиус объекта мира. ID смотреть в /worldshow",
        args: "[ид]:n [радиус]:n",
        handler: (player, args, out) => {
            var obj = world.colshapes[args[0]].db;
            if (!obj) return out.error(`Объект мира #${args[0]} не найден`, player);

            out.info(`${player.name} изменил радиус объекта мира #${obj.id} (${obj.radius} => ${args[1]})`);

            obj.radius = args[1];
            obj.save();
            mp.players.forEach(rec => {
                if (!rec.character || !rec.character.admin) return;
                rec.call(`world.objects.params.set`, [obj.id, 'radius', obj.radius]);
            });
            world.setObjectRadius(obj.id, obj.radius);
        }
    },
    "/worldshow": {
        access: 1,
        description: "Показать объекты мира в радиусе.",
        args: "[тип]:n [радиус]:n",
        handler: (player, args, out) => {
            var list = [];
            for (var objId in world.colshapes) {
                var el = world.colshapes[objId];
                if (el.db.type != args[0]) continue;
                if (player.dist(el.db.pos) < args[1]) list.push(el.db.dataValues);
            }
            out.log(`Объекты показаны на карте в радиусе ${args[1]} м. (${list.length} шт.)`, player);

            player.call(`world.objects.show`, [list]);
        }
    },
    // "/worlddoors": {
    //     description: "Вкл/выкл режим контроля дверей (позицию рекомендуется брать ближе к петлям двери).",
    //     access: 3,
    //     args: "",
    //     handler: (player, args, out) => {
    //         player.call(`world.doors.control.toggle`);
    //     }
    // },
}
