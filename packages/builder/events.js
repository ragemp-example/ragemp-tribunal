let builder = require('./index');
let notify = call('notifications');
let jobs = call('jobs');
let money = call('money');

module.exports = {
    'init': () => {
        builder.init();
        inited(__dirname);
    },
    'builder.work.start': (player) => {
        let isBuilder = player.isBuilder;
        if (!isBuilder) {
            player.lostBuilderProp = false;
            builder.startWork(player);
            builder.sendToStorage(player);
        } else {
            builder.stopWork(player);
        }
    },
    'playerDeath': (player) => {
        builder.stopWork(player);
    },
    'builder.storage.enter': (player) => {
        if (!player.isBuilder) return notify.error(player, 'Вы не строитель', 'Стройка');
        builder.setDestination(player);
    },
    'builder.destination.enter': (player) => {
        if (!player.isBuilder) return notify.error(player, 'Вы не строитель', 'Стройка');
        player.lostBuilderProp = false;
        builder.removeProp(player);
        builder.sendToStorage(player);
        money.addCash(player, builder.pay + builder.calculateBonus(player) * jobs.bonusPay, (result) => {
            if (result) {
                jobs.addJobExp(player, builder.exp, 1);
            }
        }, `Зарплата на стройке x${jobs.bonusPay}`);
    },
    'builder.prop.lost': (player) => {
        player.call('builder.destination.destroy');

        player.lostBuilderProp = true;
        builder.sendToStorage(player);
    }
}