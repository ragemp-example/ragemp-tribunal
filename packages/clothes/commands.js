let clothes = call('clothes');

module.exports = {
    "/cllist": {
        access: 1,
        description: "Список одежды на сервере.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[тип_одежды]",
        handler: (player, args, out) => {
            if (!clothes.getTypes().includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var list = clothes.list[1][args[0]].concat(clothes.list[0][args[0]]);

            var text = Object.keys(list[0].dataValues).join(" | ") + "<hr/>";

            list.forEach(el => {
                text += Object.values(el.dataValues).join(" | ") + "<br/>";
            });

            out.log(text, player);
        }
    },
    "/clname": {
        access: 1,
        description: "Изменить название одежды.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[тип_одежды] [ид_одежды]:n [название]",
        handler: (player, args, out) => {
            if (!clothes.getTypes().includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);

            var type = args[0];
            args.splice(0, 2);
            var name = args.join(" ");

            el.name = name;
            el.save();
            out.info(`${player.name} изменил название одежды типа ${type} #${el.id} (${el.name})`);
            clothes.updateClientList();
        }
    },
    "/clvar": {
        access: 1,
        description: "Изменить variation одежды.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[тип_одежды] [ид_одежды]:n [variation]:n",
        handler: (player, args, out) => {
            if (!clothes.getTypes().includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);

            el.variation = args[2];
            el.save();

            out.info(`${player.name} изменил variation одежды типа ${args[0]} #${el.id} (${el.variation})`);
            clothes.updateClientList();
        }
    },
    "/clprice": {
        access: 1,
        description: "Изменить цену одежды.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[тип_одежды] [ид_одежды]:n [цена]:n",
        handler: (player, args, out) => {
            if (!clothes.getTypes().includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);

            el.price = args[2];
            el.save();

            out.info(`${player.name} изменил цену на одежду типа ${args[0]} #${args[1]} ($${el.price})`);
            clothes.updateClientList();
        }
    },
    "/clclass": {
        access: 1,
        description: "Изменить класс одежды.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[тип_одежды] [ид_одежды]:n [класс]:n",
        handler: (player, args, out) => {
            if (!clothes.getTypes().includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);

            el.class = args[2];
            el.save();

            out.info(`${player.name} изменил класс одежды типа ${args[0]} #${args[1]} (${el.class})`);
            clothes.updateClientList();
        }
    },
    "/claddtext": {
        access: 1,
        description: "Добавить текстуру одежды.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[тип_одежды] [ид_одежды]:n [текстура]:n",
        handler: (player, args, out) => {
            if (!clothes.getTypes().includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);


            var textures = el.textures;
            if (textures.includes(args[2])) return out.error(`Одежда уже имеет текстуру ${args[2]}`, player);

            textures.push(args[2]);
            textures.sort((a, b) => {
                return a - b;
            });

            el.textures = textures;
            el.save();

            out.info(`${player.name} добавил текстуру одежды типа ${args[0]} #${args[1]} (${args[2]})`);
            clothes.updateClientList();
        }
    },
    "/cldeltext": {
        access: 1,
        description: "Удалить текстуру одежды.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[тип_одежды] [ид_одежды]:n [текстура]:n",
        handler: (player, args, out) => {
            if (!clothes.getTypes().includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);


            var textures = el.textures;
            var i = textures.indexOf(args[2]);
            if (i == -1) return out.error(`Одежда не имеет текстуру ${args[2]}`, player);

            textures.splice(i, 1);

            el.textures = textures;
            el.save();

            out.info(`${player.name} удалил текстуру одежды типа ${args[0]} #${args[1]} (${args[2]})`);
            clothes.updateClientList();
        }
    },
    "/cltorso": {
        access: 1,
        description: "Изменить торс одежды типа tops.",
        args: "[ид_одежды]:n [торс]:n",
        handler: (player, args, out) => {
            var el = clothes.getClothes("tops", args[0]);
            if (!el) return out.error(`Одежда типа tops #${args[0]} не найдена`, player);

            el.torso = args[1];
            el.save();

            out.info(`${player.name} изменил торс одежды типа tops #${args[0]} (${el.torso})`);
            clothes.updateClientList();
        }
    },
    "/clundershirt": {
        access: 1,
        description: "Изменить undershirt одежды типа tops.",
        args: "[ид_одежды]:n [undershirt]:n",
        handler: (player, args, out) => {
            var el = clothes.getClothes("tops", args[0]);
            if (!el) return out.error(`Одежда типа tops #${args[0]} не найдена`, player);

            el.undershirt = args[1];
            el.save();

            out.info(`${player.name} изменил undershirt одежды типа tops #${args[0]} (${el.undershirt})`);
            clothes.updateClientList();
        }
    },
    "/claddutext": {
        access: 1,
        description: "Добавить текстуру undershirt.<br/>",
        args: "[ид_одежды]:n [текстура]:n",
        handler: (player, args, out) => {
            var el = clothes.getClothes("tops", args[0]);
            if (!el) return out.error(`Одежда типа tops #${args[0]} не найдена`, player);


            var textures = el.uTextures;
            if (textures.includes(args[1])) return out.error(`Одежда уже имеет текстуру undershirt ${args[1]}`, player);

            textures.push(args[1]);
            textures.sort((a, b) => {
                return a - b;
            });

            el.uTextures = textures;
            el.save();

            out.info(`${player.name} добавил текстуру undershirt одежды типа tops #${args[0]} (${args[1]})`);
            clothes.updateClientList();
        }
    },
    "/cldelutext": {
        access: 1,
        description: "Удалить текстуру undershirt одежды.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[ид_одежды]:n [текстура]:n",
        handler: (player, args, out) => {
            var el = clothes.getClothes("tops", args[0]);
            if (!el) return out.error(`Одежда типа tops #${args[0]} не найдена`, player);


            var textures = el.uTextures;
            var i = textures.indexOf(args[1]);
            if (i == -1) return out.error(`Одежда не имеет текстуру undershirt ${args[1]}`, player);

            textures.splice(i, 1);

            el.uTextures = textures;
            el.save();

            out.info(`${player.name} удалил текстуру undershirt одежды типа tops #${args[0]} (${args[1]})`);
            clothes.updateClientList();
        }
    },
    "/clpockets": {
        access: 1,
        description: "Изменить карманы одежды.<br/>Типы:<br/>pants, shoes, tops<br/>Пример карманов:<br/>[2,2] - один карман размером 2x2<br/>[3,3,3,3] - два кармана размером 3x3",
        args: "[тип_одежды] [ид_одежды]:n [карманы]",
        handler: (player, args, out) => {
            if (!["pants", "shoes", "tops"].includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);

            var type = args[0];
            args.splice(0, 2);
            var pockets;
            try {
                pockets = JSON.parse(args.join(" "));
            } catch (e) {
                return out.error(`Неверный формат карманов.<br/>Пример: [4,4,5,5] - два кармана размерами 4x4 и 5x5.`, player);
            }
            if (pockets.length % 2 != 0) return out.error(`Количество размеров карманов должно быть четным`, player);
            el.pockets = pockets;
            el.save();
            out.info(`${player.name} изменил карманы одежды типа ${type} #${el.id} (${el.pockets})`);
        }
    },
    "/clclime": {
        access: 1,
        description: "Изменить климат, при которой можно носить одежду.<br/>Типы:<br/>hats, pants, shoes, tops<br/>Пример климата:<br/>[-10,10] - при ниже -10 будет мерзнуть, а при выше 10 будет жарко.",
        args: "[тип_одежды] [ид_одежды]:n [климат]",
        handler: (player, args, out) => {
            if (!["hats", "pants", "shoes", "tops"].includes(args[0])) return out.error(`Неверный тип одежды`, player);

            var el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);

            var type = args[0];
            args.splice(0, 2);
            var clime;
            try {
                clime = JSON.parse(args.join(" "));
            } catch (e) {
                return out.error(`Неверный формат климата.<br/>Пример: [-10,10] - при ниже -10 будет мерзнуть, а при выше 10 будет жарко.`, player);
            }
            if (clime.length != 2) return out.error(`Количество температур должно быть - 2`, player);
            el.clime = clime;
            el.save();
            out.info(`${player.name} изменил климат одежды типа ${type} #${el.id} (${el.clime})`);
        }
    },
    '/clupdatelist': {
        args: '',
        description: 'Обновить список одежды для клиентов',
        access: 6,
        handler: (player, args, out) => {
            clothes.updateClientList();
            out.info('Список одежды обновлен', player);
        }
    },
    "/cltexts": {
        access: 3,
        description: "Изменить кол-во текстур одежды.<br/>Типы:<br/>bracelets, ears, glasses, hats, masks, pants, shoes, ties, tops, watches",
        args: "[тип_одежды] [ид_одежды]:n [кол-во_текстур]:n",
        handler: (player, args, out) => {
            if (!clothes.getTypes().includes(args[0])) return out.error(`Неверный тип одежды`, player);

            let el = clothes.getClothes(args[0], args[1]);
            if (!el) return out.error(`Одежда типа ${args[0]} #${args[1]} не найдена`, player);

            let textures = [];
            for (let i = 0; i < args[2]; i++) {
                textures.push(i);
            }

            el.textures = textures;
            el.save();

            out.info(`${player.name} изменил кол-во текстур у одежды типа ${args[0]} #${args[1]} (${args[2]} шт.)`);
            clothes.updateClientList();
        }
    },
    '/setclothes': {
        args: '[componentNumber]:n [drawable]:n [texture]:n [palette]:n',
        description: 'Дебаг одежды и причесок',
        access: 6,
        handler: (player, args, out) => {
            player.setClothes(args[0], args[1], args[2], args[3]);
        }
    },
}
