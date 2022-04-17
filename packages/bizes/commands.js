let bizService = require('./index.js');
let factions = call('factions');

module.exports = {
    "/bizdropall": {
        description: "Сбросить владельцев всех бизнесов",
        args: "",
        access: 6,
        handler: async (player, args) => {
            await bizService.dropAllBizes();
            player.call('notifications.push.info', ["У всех бизнесов очищен владелец", "Система бизнесов"]);
        }
    },
    "/createbiz": {
        access: 6,
        description: "Создать бизнес",
        args: "[name]:s [price]:n [type]:n",
        handler: (player, args) => {
            bizService.createBiz(args[0], parseInt(args[1]), parseInt(args[2]), player.position);
        }
    },
    "/updatebiz": {
        access: 6,
        description: "Обновить информацию о бизнесе",
        args: "[price]:n [type]:n [name]:s",
        handler: (player, args, out) => {
            let biz = bizService.getBizByPlayerPos(player);
            if (biz == null) {
                return out.error("Подойдите ближе к бизнесу", player);
            }
            let name = "";
            for (let i = 2; i < args.length; i++) {
                name += args[i];
                if (i < args.length - 1) name += " ";
            }
            biz.info.name = name;
            biz.info.price = parseInt(args[0]);
            biz.info.type = parseInt(args[1]);
            biz.info.save();
        }
    },
    "/updatebizprice": {
        access: 6,
        description: "Обновить цену на бизнес",
        args: "[price]:n",
        handler: (player, args, out) => {
            let biz = bizService.getBizByPlayerPos(player);
            if (biz == null) {
                return out.error("Подойдите ближе к бизнесу", player);
            }
            biz.info.price = parseInt(args[0]);
            biz.info.save();
        }
    },
    "/setbizfaction": {
        access: 5,
        description: "Установить влияние мафии на бизнес",
        args: "[factionId]:n",
        handler: (player, args, out) => {
            let biz = bizService.getBizByPlayerPos(player);
            if (biz == null) {
                return out.error("Подойдите ближе к бизнесу", player);
            }
            if (factions.getFaction(args[0]) == null) return out.error("Фракции с таким id не существует", player);
            biz.info.factionId = args[0];
            biz.info.save();
        }
    },
    "/gotobiz": {
        access: 1,
        description: "Перейти к бизнесу",
        args: "[id]:n",
        handler: (player, args) => {
            let position = bizService.getBizPosition(parseInt(args[0]));
            if (position) player.position = position;
        }
    },
    "/getbizid": {
        access: 1,
        description: "Получить id бизнеса в колшейпе которого находится игрок",
        args: "",
        handler: (player, args, out) => {
            let biz = bizService.getBizByPlayerPos(player);
            if (biz == null) {
                return out.error("Подойдите ближе к бизнесу", player);
            }
            else {
                return out.info("Вы находитесь у бизнеса с id " + biz.info.id, player);
            } 
        }
    },
    "/setbizprod": {
        access: 6,
        description: "Установить кол-во ресурсов бизнеса",
        args: "[id]:n [amount]:n",
        handler: async (player, args, out) => {
            let biz = bizService.getBizById(args[0]);
            if (biz == null) {
                return out.error("Бизнеса с таким id не существует", player);
            }
            biz.info.productsCount = args[1];
            await biz.info.save();
            out.info("Кол-во ресурсов устаовлено", player);
        }
    },
    "/fillbizprod": {
        access: 6,
        description: "Заполнить склад всем бизнесам",
        args: "",
        handler: async (player, args, out) => {
            await bizService.fillAllBizesProducts();
            out.info("Склады всех бизнесов заполнены", player);
        }
    },
    "/setbiztypemaxprod": {
        access: 6,
        description: "Установить размер склада всем бизнесам заданного типа",
        args: "[type]:n [amount]:n",
        handler: async (player, args, out) => {
            await bizService.setBizesTypeMaxProducts(args[0], args[1]);
            out.info("Размер склада всем бизнесам заданного типа установлен", player);
        }
    },
    "/getbizinfo": {
        access: 6,
        description: "Получить информацию о бизнесе по id",
        args: "[id]:n",
        handler: (player, args, out) => {
            let biz = bizService.getBizById(args[0]);
            if (biz == null) {
                out.error("Бизнеса с таким id не существует", player);
            }
            else {
                out.info("Информация о бизнесе #" + biz.info.id, player);
                let object = JSON.parse(JSON.stringify(biz.info));
                for (const key in object) {
                    if (!["x", "y", "z", "id", "BizStatistics"].includes(key)) {
                        const element = object[key];
                        out.info(`${key}: ${element}`, player);
                    }
                }
            } 
        }
    },
}

