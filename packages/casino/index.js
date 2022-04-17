"use strict";

let money = call('money');
let notify = call('notifications')
let vehicles = call('vehicles');
let utils = call('utils');
let logger = call('logger');

let info = {
    x: 936.0476684570312,
    y: 47.1480598449707,
    z: 81.09574890136719,
    enter: {
        x: 936.0476684570312,
        y: 47.1480598449707,
        z: 81.09574890136719,
        toX: 1090.128662109375,
        toY: 208.46066284179688,
        toZ: -48.9999885559082,
        toD: 1,
        toH: 358.18463134765625
    },
    exit: {
        x: 1089.6820068359375,
        y: 205.87353515625,
        z: -48.999732971191406,
        d: 1,
        toX: 935.1140747070312,
        toY: 45.80738830566406,
        toZ: 81.09574890136719,
        toH: 140.51380920410156
    },
    area: {
        x: 1100.5877685546875,
        y: 219.75877380371094,
        z: -48.748653411865234
    }
}
let casinoArea;
let infoShape;
let luckyWheelShape;

module.exports = {
    minDiceChips: 100,
    maxDiceChips: 10000,
    slotMachineMinBet: 500,
    slotMachineMaxBet: 10000,
    chipsBuyPrice: 3,
    chipsSellPrice: 2,
    luckyWheelPosition: new mp.Vector3(1110.9149169921875, 229.26193237304688, -49.63581848144531),
    isLuckyWheelRolling: false,
    currentLuckyWheelPlayer: null,
    luckyWheelRollPrice: 3000,
    luckyWheelRollHours: 24,
    /// Все доступные призы с колеса
    availablePrizes: [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18],
    slotValues: [0, 1, 2, 3, 4, 5, 2, 6, 0, 1, 3, 4, 1, 6, 2, 4],
    mainVeh: 'felon',
    mysteryVeh: 'speedo2',
    prizesConfig: {
        0: {
            type: 'clothing',
            name: 'Кепка Casino',
            value: {
                itemId: 6,
                1: { // male
                    variation: 135,
                    texture: 0
                },
                0: { // female
                    variation: 134,
                    texture: 0
                },
            },
            chances: [0, 1, 2, 3],
        },
        1: {
            type: 'cash',
            name: 'Наличные суммой $50000',
            value: 50000,
            chances: [4, 5, 6, 7],
        },
        2: {
            type: 'vehicle',
            name: 'Автомобиль',
            value: '',
            chances: [8],
        },
        4: {
            type: 'clothing',
            name: 'Шорты Broker',
            value: {
                itemId: 8,
                1: { // male
                    variation: 117,
                    texture: 8,
                    pockets: [5, 4]
                },
                0: { // female
                    variation: 123,
                    texture: 8,
                    pockets: [5, 4]
                },
            },
            chances: [9, 10, 11, 12, 13, 14, 15],
        },
        5: {
            type: 'chips',
            name: 'Фишки для казино 25000 шт',
            value: 25000,
            chances: [16, 17, 18, 19],
        },
        6: {
            type: 'cash',
            name: 'Наличные суммой $40000',
            value: 40000,
            chances: [20, 21, 22, 23],
        },
        8: {
            type: 'clothing',
            name: 'Кепка Casino',
            value: {
                itemId: 6,
                1: { // male
                    variation: 135,
                    texture: 4
                },
                0: { // female
                    variation: 134,
                    texture: 4
                },
            },
            chances: [24, 25, 26, 27, 28, 29, 30],
        },
        9: {
            type: 'vehicle', // mystery
            name: 'Секретный автомобиль',
            value: '',
            chances: [31],
        },
        10: {
            type: 'chips',
            name: 'Фишки для казино 20000 шт',
            value: 20000,
            chances: [32, 33, 34, 35],
        },
        12: {
            type: 'clothing',
            name: 'Маска Casino',
            value: {
                itemId: 14,
                1: { // male
                    variation: 156,
                    texture: 0
                },
                0: { // female
                    variation: 157,
                    texture: 0
                },
            },
            chances: [36, 37, 38, 39],
        },
        13: {
            type: 'chips',
            name: 'Фишки для казино 15000 шт',
            value: 15000,
            chances: [40, 41, 42, 43],
        },
        14: {
            type: 'cash',
            name: 'Наличные суммой $30000',
            value: 30000,
            chances: [44, 45, 46, 47],
        },
        16: {
            type: 'cash', // discount
            name: 'Наличные суммой $10000',
            value: 10000,
            chances: [48, 49, 50, 51],
        },
        17: {
            type: 'chips',
            name: 'Фишки для казино 10000 шт',
            value: 10000,
            chances: [52, 53, 54, 55],
        },
        18: {
            type: 'cash',
            name: 'Наличные суммой $20000',
            value: 20000,
            chances: [56, 57, 58, 59],
        },
    },
    cashiers: [
        [1116.3602294921875, 221.7566375732422, -49.43516159057617],
        [1115.998046875, 220.13014221191406, -49.43516159057617],
        [1116.4232177734375, 218.1571807861328, -49.43516159057617]
    ],
    slotMachines: [
        {
            model: 'vw_prop_casino_slot_01a',
            pos:
                [1100.5103759765625, 230.36892700195312, -50.84077453613281],
            heading: 51.27527618408203
        },
        {
            model: 'vw_prop_casino_slot_02a',
            pos:
                [1101.262939453125, 231.63941955566406, -50.84080123901367],
            heading: 71.25366973876953
        },
        {
            model: 'vw_prop_casino_slot_03a',
            pos:
                [1101.3001708984375, 233.13919067382812, -50.84075164794922],
            heading: 98.67710876464844
        },
        {
            model: 'vw_prop_casino_slot_04a',
            pos:
                [1108.8233642578125, 239.53152465820312, -50.840789794921875],
            heading: 308.774169921875
        },
        {
            model: 'vw_prop_casino_slot_05a',
            pos:
                [1110.284814453125, 238.66675720214844, -50.84080123901367],
            heading: 347.21246337890625
        },
        {
            model: 'vw_prop_casino_slot_06a',
            pos: [1111.7760009765625, 238.5751953125, -50.84077072143555],
            heading: 19.308032989501953
        },
        {
            model: 'vw_prop_casino_slot_07a',
            pos:
                [1112.9979248046875, 239.45040893554688, -50.84077835083008],
            heading: 50.0139274597168
        },
        {
            model: 'vw_prop_casino_slot_08a',
            pos:
                [1120.8240966796875, 233.2279510498047, -50.84078598022461],
            heading: 251.42242431640625
        },
        {
            model: 'vw_prop_casino_slot_03a',
            pos:
                [1120.7730712890625, 231.73455810546875, -50.84078598022461],
            heading: 291.0202331542969
        },
        {
            model: 'vw_prop_casino_slot_04a',
            pos:
                [1121.530517578125, 230.3941650390625, -50.840797424316406],
            heading: 319.34185791015625
        }
    ],
    init() {
        mp.blips.new(617, new mp.Vector3(info.x, info.y, info.z),
            {
                name: "Diamond Casino",
                shortRange: true,
                color: 26
            });

        let enter = mp.colshapes.newSphere(info.enter.x, info.enter.y, info.enter.z, 1.5);
        enter.onEnter = (player) => {
            utils.setPlayerPosition(player, new mp.Vector3(info.enter.toX, info.enter.toY, info.enter.toZ))
            player.dimension = info.enter.toD;
            player.heading = info.enter.toH;
        }

        mp.markers.new(2, new mp.Vector3(info.enter.x, info.enter.y, info.enter.z - 0.3), 0.75, {
            rotation: new mp.Vector3(0, 180, 0),
            dimension: 0
        });

        let exit = mp.colshapes.newSphere(info.exit.x, info.exit.y, info.exit.z, 1.5);
        exit.dimension = info.exit.d;
        exit.onEnter = (player) => {
            utils.setPlayerPosition(player, new mp.Vector3(info.exit.toX, info.exit.toY, info.exit.toZ));
            player.dimension = 0;
            player.heading = info.exit.toH;
        }

        mp.markers.new(2, new mp.Vector3(info.exit.x, info.exit.y, info.exit.z - 0.05), 0.75, {
            rotation: new mp.Vector3(0, 180, 0),
            dimension: info.exit.d
        });

        casinoArea = mp.colshapes.newSphere(info.area.x, info.area.y, info.area.z, 100);
        casinoArea.dimension = 1;
        casinoArea.onEnter = (player) => {
            let data = this.slotMachines.map(x => {
                return {
                    model: x.model,
                    pos: x.pos,
                    heading: x.heading
                }
            });
            player.call('casino.area.enter', [true, data]);
        }
        casinoArea.onExit = (player) => {
            player.call('casino.area.enter', [false]);
        }
        luckyWheelShape = mp.colshapes.newSphere(this.luckyWheelPosition.x, this.luckyWheelPosition.y, this.luckyWheelPosition.z, 1.8);
        luckyWheelShape.dimension = 1;
        luckyWheelShape.onEnter = (player) => {
            player.call('casino.luckywheel.enter', [true]);
            player.call('prompt.show', [`Нажмите <span>E</span> для того, чтобы крутить колесо за ${this.luckyWheelRollPrice.toString()} <i class="fas fa-coins"></i>`]);
        }
        luckyWheelShape.onExit = (player) => {
            player.call('casino.luckywheel.enter', [false]);
            player.call("prompt.hide");
        }

        this.createSlotMachinesColshapes();
        this.createCashierColshapes();
        this.setVehicleValues();
    },
    isPlayerInCasinoArea(player) {
        return casinoArea.isPointWithin(player.position);
    },
    async loadCharacterPrizes(player) {
        if (!player.character) return;
        let prizes = await db.Models.CharacterPrize.findAll({
            where: {
                characterId: player.character.id
            }
        });
        player.character.prizes = prizes;
        console.log(`[CASINO] Для персонажа ${player.character.name} загружено ${prizes.length} призов`);
    },
    giveLuckyWheelPrize(player, prizeId) {
        if (!player.character) return;
        let prize = this.prizesConfig[prizeId];
        switch (prize.type) {
            case 'cash':
                money.addCash(player, prize.value, (result) => {
                    if (!result) {
                        notify.error(player, 'Ошибка начисления денег');
                    }
                }, 'Выигрыш в колесе удачи');
                break;
            case 'chips':
                this.addChips(player, prize.value, 'Выигрыш в колесе удачи');
                break;
            case 'clothing':
            case 'vehicle':
                this.saveLuckyWheelPrize(player, prizeId);
                break;
            default:
                notify.error(player, 'Неизвестный тип приза, обратитесь к разработчикам');
                break;
        }
        notify.success(player, `Ваш приз - ${prize.name}!`);
        notify.info(player, `${prize.type === 'cash' || prize.type === 'donate' || prize.type === 'chips' ?
            'Приз выдан вам на руки' : 'Чтобы использовать приз, нажмите L -> Мои призы'}`);
    },
    async saveLuckyWheelPrize(player, prizeId) {
        if (!player.character) return;
        let prize = await db.Models.CharacterPrize.create({
            characterId: player.character.id,
            prizeId: prizeId
        });
        player.character.prizes.push(prize);
    },
    async removePrize(player, index) {
        if (!player.character) return;
        player.character.prizes[index].destroy();
        player.character.prizes.splice(index, 1);
    },
    addChips(player, count, reason = '') {
        if (!player.character) return;
        player.character.casinoChips += count;
        player.character.save();
        logger.log(`+${count} фишек (${reason})`, 'casino', player);
        player.call('casino.chips.changed', [player.character.casinoChips]);
    },
    removeChips(player, count, reason = '') {
        if (!player.character) return;
        player.character.casinoChips -= count;
        player.character.save();
        logger.log(`-${count} фишек (${reason})`, 'casino', player);
        player.call('casino.chips.changed', [player.character.casinoChips]);
    },
    createCashierColshapes() {
        this.cashiers.forEach(current => {
            let shape = mp.colshapes.newSphere(current[0], current[1], current[2], 0.85)
            shape.dimension = 1;
            shape.onEnter = (player) => {
                player.call('casino.cashier.show', [true]);
            }
            shape.onExit = (player) => {
                player.call('casino.cashier.show', [false]);
            }
        });
    },
    createSlotMachinesColshapes() {
        for (let i = 0; i < this.slotMachines.length; i++) {
            let machine = this.slotMachines[i];
            let shape = mp.colshapes.newSphere(machine.pos[0], machine.pos[1], machine.pos[2], 1.3);
            shape.dimension = 1;
            shape.isSlotMachine = true;
            shape.slotMachineIndex = i;

            shape.onEnter = (player) => {
                player.call('casino.slotmachine.enter', [true]);
                player.currentSlotMachineIndex = i;
            }
            shape.onExit = (player) => {
                player.call('casino.slotmachine.enter', [false]);
                player.currentSlotMachineIndex = null;
                if (player == this.slotMachines[i].currentPlayer) {
                    this.slotMachines[i].currentPlayer = null;
                    this.slotMachines[i].isSpinning = false;
                }
            }
        }
    },
    getSlotMachineResult() {
        let result = '';
        for (let i = 0; i < 3; i++) {
            result += this.slotValues[utils.randomInteger(0, this.slotValues.length - 1)].toString();
        }
        return result;
    },
    getSlotMachinePrize(res, bet) {
        let multiplier;
        switch (res) {
            case '222':
                multiplier = 8;
                break;
            case '111':
                multiplier = 16;
                break;
            case '333':
                multiplier = 25;
                break;
            case '666':
                multiplier = 50;
                break;
            case '000':
                multiplier = 75;
                break;
            case '444':
                multiplier = 100;
                break;
            case '555':
                multiplier = 200;
                break;
            default:
                multiplier = 0;
                break
        }
        return bet * multiplier;
    },
    setVehicleValues() {
        this.prizesConfig[2].value = this.mainVeh;
        this.prizesConfig[9].value = this.mysteryVeh;
    },
    async spawnMainVehicle() {
        let veh = {
            modelName: this.mainVeh,
            x: 1100.0374755859375  ,
            y: 219,
            z: -49.428985595703125,
            h: 181.2264862060547,
            d: 1,
            color1: 111,
            color2: 111,
            license: 0,
            key: "casino",
            owner: 0,
            fuel: 40,
            mileage: 0,
            plate: 'TRIBUNAL',
            destroys: 0,
            isLocked: true
        }
        await vehicles.spawnVehicle(veh);
    }
}