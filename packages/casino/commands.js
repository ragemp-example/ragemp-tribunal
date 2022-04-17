let casino = require('./index.js');
let utils = call('utils');
module.exports = {
    "/slotsm": {
        access: 6,
        description: "Моделирование прибыли на слот-машинах",
        args: "[размер_ставки]:n [количество_ставок]:n",
        handler: (player, args, out) => {
            let bet = args[0];
            let count = args[1];
            let income = 0;
            for (let i = 0; i < count; i++) {
                let res = casino.getSlotMachineResult();
                let prize = casino.getSlotMachinePrize(res, bet);
                income += prize;
            }
            out.info(`Размер ставки: ${bet} фишек`, player);
            out.info(`Количество ставок: ${count}`, player);
            out.info(`Потрачено: ${count * bet} фишек`, player);
            out.info(`Заработано: ${income} фишек`, player);
        }
    },
    "/smhelper": {
        access: 6,
        description: "Помощь при создании автоматов",
        args: "",
        handler: (player, args, out) => {
            let pos = player.position;
            let heading = player.heading;
            let zOffset = -1;
            if (!player.helperSlotObjects) player.helperSlotObjects = [];
            player.helperSlotObjects.push(mp.objects.new(mp.joaat('vw_prop_casino_slot_02a'),
                new mp.Vector3(pos.x, pos.y, pos.z + zOffset), {dimension: player.dimension, rotation: new mp.Vector3(0, 0, heading)}));

            let helperObject = {
                model: 'vw_prop_casino_slot_02a',
                pos: [pos.x, pos.y, pos.z + zOffset],
                heading: heading
            };
            console.log(helperObject);
        }
    },
    "/smhd": {
        access: 6,
        description: "Удалить последний автомат",
        args: "",
        handler: (player, args, out) => {
            if (!player.helperSlotObjects) return;
            let obj = player.helperSlotObjects.pop();
            if (mp.objects.exists(obj)) obj.destroy();
        }
    },
    "/wheelm": {
        access: 6,
        description: "Моделирование выигрышей в колесе удачи",
        args: "[количество_ставок]:n",
        handler: (player, args, out) => {
            let count = args[0];
            console.log(`${count} выигрышей:`);
            out.info(`${count} выигрышей:`, player);
            let resultIds = [];
            for (let i = 0; i < count; i++) {
                resultIds.push(utils.randomInteger(0, casino.availablePrizes.length * 4 - 1));
            }
            for (let i = 0; i < resultIds.length; i++) {
                let rand = resultIds[i];
                let index = null;
                for (let key in casino.prizesConfig) {
                    if (casino.prizesConfig[key].chances.includes(rand)) {
                        index = parseInt(key);
                    }
                }
                console.log(casino.prizesConfig[index].name);
                out.info(casino.prizesConfig[index].name, player);
            }
        }
    },
}