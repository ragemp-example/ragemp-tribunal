let casino = require('./index.js');
let money = call('money');
let notify = call('notifications');
let utils = call('utils');
let timer = call('timer');
let inventory = call('inventory');
let vehicles = call('vehicles');
let houses = call('houses');
let parkings = call('parkings');
//let donate = call('donate');

module.exports = {
    "init": () => {
        casino.init();
        inited(__dirname);
    },
    "casino.dice.offer.send": (player, data) => {
        if (typeof (data) == 'string') data = JSON.parse(data);
        if (!data || !player.character) return;

        let target = mp.players.at(data.targetId);
        if (!target || !target.character) return notify.error(player, `Игрок не найден`);
        if (player == target) return notify.error(player, `Нельзя играть в кости с самим собой`); //comment for tests
        if (!casino.isPlayerInCasinoArea(player)) return notify.error(player, `Вы не в казино`);
        if (!casino.isPlayerInCasinoArea(target)) return notify.error(player, `Игрок не в казино`);
        if (player.dist(target.position) > 5) return notify.error(player, `Игрок далеко`);
        if (data.amount < casino.minDiceChips) return notify.warning(player, `Минимальная сумма: ${casino.minDiceChips} фишек`);
        if (data.amount > casino.maxDiceChips) return notify.warning(player, `Максимальная сумма: ${casino.maxDiceChips} фишек`);
        if (data.amount > player.character.casinoChips) return notify.error(player, `У вас недостаточно фишек`);
        if (data.amount > target.character.casinoChips) return notify.error(player, `У игрока недостаточно фишек`);
        if (player.hasActiveDiceOffer) return notify.error(player, `Вы уже отправили предложение`);
        if (target.hasActiveDiceOffer) return notify.error(player, `Игрок отправил предложение`);
        if (player.diceOffer) return notify.error(player, `Вам отправлено предложение`);
        if (target.diceOffer) return notify.error(player, `Игроку уже отправлено предложение`);

        notify.info(player, `Вы предложили игру в кости`);
        player.hasActiveDiceOffer = true;
        player.diceOfferTimeout = timer.add(() => {
            player.hasActiveDiceOffer = false;
        }, 10000);

        target.diceOffer = {
            senderId: player.id,
            senderCharacterId: player.character.id,
            amount: data.amount
        }
        target.call(`offerDialog.show`, [`dice`, {
            id: player.id,
            amount: data.amount
        }]);
    },
    "casino.dice.offer.accept": (player, accept) => {
        let target = player;
        if (!target.diceOffer || !target.character) return;
        let offer = player.diceOffer;
        let sender = mp.players.at(offer.senderId);
        if (!sender || !sender.character || sender.character.id != offer.senderCharacterId)
            return notify.error(player, `Игрок отключился`);

        timer.remove(sender.diceOfferTimeout);

        if (accept) {
            let winner, loser, isDraw;
            let targetCount = utils.randomInteger(1, 6);
            let senderCount = utils.randomInteger(1, 6);

            if (senderCount > targetCount) {
                winner = sender;
                loser = target;
            } else if (targetCount > senderCount) {
                winner = target;
                loser = sender;
            } else {
                notify.info(target, `Вы сыграли в ничью`);
                notify.info(sender, `Вы сыграли в ничью`);
                isDraw = true;
            }

            if (!isDraw) {
                casino.removeChips(loser, offer.amount, `Проигрыш в кости ID ${winner.character.id}`);
                casino.addChips(winner, offer.amount, `Победа в кости ${loser.character.id}`);
                notify.success(winner, `Поздравляем, вы выиграли!`);
                notify.warning(loser, `К сожалению, вы проиграли!`);
            }

            let data = {
                senderName: sender.name,
                senderId: sender.id,
                senderCount: senderCount,
                targetName: target.name,
                targetId: target.id,
                targetCount: targetCount
            }

            mp.players.forEachInRange(target.position, 5, (current) => {
                current.call(`casino.dice.text.show`, [JSON.stringify(data)]);
            });
        } else {
            notify.warning(sender, 'Игрок отказался от игры в кости');
            notify.warning(target, 'Вы отказались от игры в кости');
        }
        sender.hasActiveDiceOffer = false;
        delete target.diceOffer;
    },
    "playerQuit": (player) => {
        timer.remove(player.diceOfferTimeout);
        if (player === casino.currentLuckyWheelPlayer) {
            console.log(`[CASINO] Крутильщик рулетки вышел`)
            casino.isLuckyWheelRolling = false;
            casino.currentLuckyWheelPlayer = null;
        }

        let machine = casino.slotMachines.find(x => x.currentPlayer === player);
        if (machine) {
            console.log(`[CASINO] Крутильщик слот машины вышел`);
            machine.currentPlayer = null;
            machine.isSpinning = false;
        }
    },
    "casino.luckywheel.roll": (player) => {
        if (!player.character) return;
        if (player.character.casinoChips < casino.luckyWheelRollPrice)
            return notify.error(player, `Для прокрутки колеса нужно ${casino.luckyWheelRollPrice} фишек`);
        if (casino.isLuckyWheelRolling) return notify.error(player, 'Колесо уже крутят, подождите');

        let now = new Date();
        if (player.character.lastLuckyWheelRoll) {
            let hours = (now - player.character.lastLuckyWheelRoll) / (1000 * 60 * 60);
            if (hours <= casino.luckyWheelRollHours) {
                return notify.error(player, `Ожидайте ${Math.ceil(casino.luckyWheelRollHours - hours)} ч. до следующего прокрута`);
            }
        }
        player.character.lastLuckyWheelRoll = now;
        player.character.save();

        casino.currentLuckyWheelPlayer = player;
        casino.isLuckyWheelRolling = true;

        let rand = utils.randomInteger(0, casino.availablePrizes.length * 4 - 1);
        let index = null;
        for (let key in casino.prizesConfig) {
            if (casino.prizesConfig[key].chances.includes(rand)) {
                index = parseInt(key);
            }
        }

        player.currentLuckyWheelPrize = index;
        mp.players.forEachInRange(casino.luckyWheelPosition, 20, (current) => {
            current.call('casino.luckywheel.roll', [player.id, index]);
        });
    },
    "casino.luckywheel.roll.finish": (player) => {
        if (player.currentLuckyWheelPrize === null || player.currentLuckyWheelPrize === undefined) return;
        if (player.character.casinoChips < casino.luckyWheelRollPrice) {
            notify.error(player, `Для прокрутки колеса нужно ${casino.luckyWheelRollPrice} фишек`);
            player.currentLuckyWheelPrize = null;
            casino.currentLuckyWheelPlayer = null;
            casino.isLuckyWheelRolling = false;
            return;
        }
        casino.removeChips(player, casino.luckyWheelRollPrice, 'Прокрутка колеса');
        casino.giveLuckyWheelPrize(player, player.currentLuckyWheelPrize);
        player.currentLuckyWheelPrize = null;
        casino.currentLuckyWheelPlayer = null;
        casino.isLuckyWheelRolling = false;
    },
    "characterInit.done": (player) => {
        if (!player.character.prizes) player.character.prizes = [];
        casino.loadCharacterPrizes(player);
    },
    "casino.prizes.show": (player) => {
        if (!player.character) return;
        if (player.character.prizes.length == 0) return notify.warning(player, `У вас нет призов, их можно выиграть в колесе удачи`);
        let prizes = player.character.prizes.map(x => casino.prizesConfig[x.prizeId].name);
        player.call('casino.prizes.show', [prizes]);
    },
    "casino.prizes.use": async (player, index) => {
        if (!player.character) return;
        let prizeId = player.character.prizes[index].prizeId;
        let prize = casino.prizesConfig[prizeId];
        if (!prize) return notify.error(player, 'Неверный ID приза');
        if (prize.type == 'clothing') {
            let sex = player.character.gender ? 0 : 1;
            let params = {
                sex: sex,
                variation: prize.value[sex].variation,
                texture: prize.value[sex].texture,
                name: prize.name
            }
            if (prize.value[sex].pockets != null) params.pockets = JSON.stringify(prize.value[sex].pockets);
            if (prize.value[sex].torso != null) params.torso = prize.value[sex].torso;
            if (prize.value[sex].undershirt != null) {
                params.undershirt = prize.value[sex].undershirt;
                params.uTexture = 0;
            }

            inventory.addItem(player, prize.value.itemId, params, (e) => {
                if (e) return notify.error(player, e);
                casino.removePrize(player, index);
                notify.success(player, 'Вы получили приз!');
            });
        } else if (prize.type == 'vehicle') {
            let props = vehicles.getVehiclePropertiesByModel(prize.value);
            if (!vehicles.isAbleToBuyVehicle(player, props.vehType)) return notify.error(player, 'Достигнут лимит на транспорт');

            let hasHouse = houses.isHaveHouse(player.character.id);
            let carPlate = vehicles.generateVehiclePlate();
            let parking = parkings.getClosestParkingId(player, props.vehType);
            let now = new Date();

            let data = await db.Models.Vehicle.create({
                key: "private",
                owner: player.character.id,
                modelName: prize.value,
                color1: 111,
                color2: 111,
                x: 0,
                y: 0,
                z: 0,
                h: 0,
                parkingDate: hasHouse ? null : now,
                parkingId: parking,
                plate: carPlate,
                owners: 1,
                regDate: now
            });
            let veh = {
                key: "private",
                owner: player.character.id,
                modelName: prize.value,
                color1: 111,
                color2: 111,
                x: 0,
                y: 0,
                z: 0,
                h: 0,
                parkingId: parking,
                parkingDate: hasHouse ? null : now,
                fuel: 50,
                mileage: 0,
                plate: carPlate,
                engineState: 0,
                fuelState: 0,
                steeringState: 0,
                brakeState: 0,
                destroys: 0,
                owners: 1,
                regDate: now
            }
            veh.sqlId = data.id;
            veh.db = data;
            if (!hasHouse || props.vehType == 4 || props.vehType == 5) {
                mp.events.call('parkings.vehicle.add', veh);
            } else {
                vehicles.spawnHomeVehicle(player, veh);
            }
            player.vehicleList.push({
                id: data.id,
                name: props.name,
                plate: data.plate,
                regDate: data.regDate,
                owners: data.owners,
                vehType: props.vehType,
                price: props.price,
                parkingDate: data.parkingDate,
                dbInstance: data
            });

            inventory.fullDeleteItemsByParams(33, 'vehId', veh.db.id);
            inventory.addItem(player, 33, {
                owner: player.character.id,
                vehId: veh.db.id,
                vehName: props.name
            }, (e) => {
                if (e) notify.error(player, e);
            });
            casino.removePrize(player, index);
            notify.success(player, 'Автомобиль доставлен');
        }
    },
    "casino.slotmachine.occupy": (player) => {
        if (player.currentSlotMachineIndex == null || player.currentSlotMachineIndex == undefined) return;
        let machine = casino.slotMachines[player.currentSlotMachineIndex];
        if (machine.currentPlayer) return notify.error(player, 'Этот автомат уже занят', 'Игровой автомат');
        machine.currentPlayer = player;

        mp.players.forEachInRange(player.position, 10, (current) => {
            current.call('casino.slotmachine.animation.sitting', [player.id, player.currentSlotMachineIndex]);
        });

        player.call('casino.slotmachine.start', [{
            maxBet: casino.slotMachineMaxBet,
            minBet: casino.slotMachineMinBet,
            balance: player.character.casinoChips
        }]);
    },
    "casino.slotmachine.leave": (player) => {
        if (player.currentSlotMachineIndex == null || player.currentSlotMachineIndex == undefined) return;
        let machine = casino.slotMachines[player.currentSlotMachineIndex];
        if (machine.isSpinning) return notify.error(player, 'Нельзя выйти, пока идет игра', 'Игровой автомат');
        player.currentSlotMachineIndex = null;
        machine.currentPlayer = null;
        player.call('casino.slotmachine.leave');
    },
    "casino.slotmachine.spin": (player, bet) => {
        if (player.currentSlotMachineIndex == null || player.currentSlotMachineIndex == undefined) return;
        let machine = casino.slotMachines[player.currentSlotMachineIndex];
        if (machine.isSpinning) return notify.error(player, 'Игра уже идет', 'Игровой автомат');
        if (bet < casino.slotMachineMinBet || bet > casino.slotMachineMaxBet) return notify.error(player, 'Неверная ставка', 'Игровой автомат');
        if (bet > player.character.casinoChips) return notify.error(player, 'Недостаточно фишек', 'Игровой автомат');

        machine.isSpinning = true;
        let result = casino.getSlotMachineResult();
        player.currentSlotMachinePrize = casino.getSlotMachinePrize(result, bet);
        player.lastSlotMachineBet = bet;
        player.call('casino.slotmachine.spin.start', [result, player.currentSlotMachineIndex, bet]);
    },
    "casino.slotmachine.spin.finish": (player) => {
        if (player.currentSlotMachineIndex == null || player.currentSlotMachineIndex == undefined) return;
        if (player.currentSlotMachinePrize == null || player.currentSlotMachinePrize == undefined) return;
        let prize = player.currentSlotMachinePrize;
        let machine = casino.slotMachines[player.currentSlotMachineIndex];
        casino.removeChips(player, player.lastSlotMachineBet, 'Ставка в игровом автомате');
        if (prize == 0) {
            notify.warning(player, 'К сожалению, выиграть не удалось', 'Игровой автомат');
        } else {
            notify.success(player, `Поздравляем, вы выиграли ${prize} фишек!`, 'Игровой автомат');
            casino.addChips(player, prize, 'Выигрыш в автомате');
            player.call('casino.slotmachine.balance.update', [player.character.casinoChips]);
            player.call('casino.slotmachine.win');
        }
        machine.isSpinning = false;
    },
    "casino.chips.menu.buy": (player) => {
        player.call('casino.chips.menu.show', ['buy', casino.chipsBuyPrice]);
    },
    "casino.chips.menu.sell": (player) => {
        player.call('casino.chips.menu.show', ['sell', casino.chipsSellPrice]);
    },
    "casino.chips.buy": (player, count) => {
        if (!player.character) return;
        let value = parseInt(count);
        if (isNaN(value) || value < 1) return notify.error(player, 'Неверное количество');

        let price = casino.chipsBuyPrice * value;
        if (player.character.cash < price) return notify.error(player, `Недостаточно денег, нужно $${price}`);
        money.removeCash(player, price, (result) => {
            if (!result) return notify.error(player, 'Ошибка финансовой операции');
            casino.addChips(player, value, 'Покупка в казино');
            notify.success(player, `Вы купили ${value} фишек`);
        }, 'Покупка фишек в казино');
    },
    "casino.chips.sell": (player, count) => {
        if (!player.character) return;
        let value = parseInt(count);
        if (isNaN(value) || value < 1) return notify.error(player, 'Неверное количество');
        if (player.character.casinoChips < value) return notify.error(player, 'У вас недостаточно фишек');

        let price = casino.chipsSellPrice * value;
        money.addCash(player, price, (result) => {
            if (!result) return notify.error(player, 'Ошибка финансовой операции');
            casino.removeChips(player, value, 'Продажа в казино');
            notify.success(player, `Вы продали ${value} фишек`);
        }, 'Продажа фишек в казино');
    },
    "vehicles.loaded": () => {
        casino.spawnMainVehicle();
    }
}