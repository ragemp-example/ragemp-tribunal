const oilrigs = require('./index');
const notify = call('notifications');
const carrier = call('carrier');
const money = call('money');
const bizes = call('bizes');
const jobs = call('jobs');

module.exports = {
    "init": async () => {
        await oilrigs.init();
    },
    "bizes.done": () => {
        oilrigs.initBizBlips();
    },
    "economy.done": () => {
        oilrigs.initSellPrice();
        oilrigs.createSellMarker();
    },
    "oilrigs.work.start": (player) => {
        oilrigs.toggleWork(player);
    },
    "oilrigs.oil.buy": (player, amount) => {
        if (!player.currentOilRigId) return;
        if (amount < 0 || isNaN(amount)) return notify.error(player, 'Неверное количество');

        let veh = player.vehicle;
        if (!veh || veh.key !== "job" || veh.owner !== 4
            || !carrier.isOilTanker(veh)) return notify.warning(player, 'Чтобы закупить нефть, вы должны находиться в нефтевозе');

        let id = player.currentOilRigId;
        let rig = oilrigs.getRigById(id);
        if (bizes.getBizById(rig.info.bizId).info.characterId === player.character.id)
            return notify.error(player, 'Нельзя купить нефть у самого себя');

        let { current, max } = veh.oil;
        if (current + amount > max) return notify.error(player, 'Нефтевоз не может вместить столько нефти');
        if (amount > rig.info.oil) return notify.error(player, 'На нефтевышке нет столько нефти');

        let price = amount * rig.info.oilPrice;
        if (price > player.character.cash) return notify.error(player, 'У вас недостаточно денег');

        money.removeCash(player, price, async (res) => {
            if (!res) return notify.error(player, 'Финансовая ошибка');
            await oilrigs.updateOilRig(id, -amount);
            veh.oil.current += amount;
            carrier.updateOilTankerLabel(veh);
            oilrigs.updateCashbox(id, price);
            oilrigs.updateLabel(id);
            notify.success(player, `Вы купили ${amount} баррелей нефти`);
        }, `Покупка нефти на вышке #${id}`);
    },
    "oilrigs.oil.sell": (player, amount) => {
        if (!player.isInOilSell) return;
        if (amount < 0 || isNaN(amount)) return notify.error(player, 'Неверное количество');

        let veh = player.vehicle;
        if (!veh || veh.key !== "job" || veh.owner !== 4
            || !carrier.isOilTanker(veh)) return notify.warning(player, 'Чтобы продать нефть, вы должны находиться в нефтевозе');

        let { current } = veh.oil;
        if (amount > current) return notify.error(player, 'У вас нет столько нефти');

        let price = oilrigs.currentSellPrice * amount;

        money.addCash(player, price, async (res) => {
            if (!res) return notify.error(player, 'Финансовая ошибка');
            veh.oil.current -= amount;
            carrier.updateOilTankerLabel(veh);
            oilrigs.sellStats.currentHour += amount;
            notify.success(player, `Вы продали ${amount} баррелей нефти`);

            if (amount >= carrier.barrelsMax) {
                jobs.addJobExp(player, oilrigs.skill);
            }
        }, `Продажа нефти на точке сбыта`);
    },
    "payday.done": () => {
        oilrigs.updateSellPrice();
    }
};