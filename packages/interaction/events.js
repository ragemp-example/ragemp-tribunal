let interaction = require("./index.js");
let money = call('money');
let utils = call('utils');
let notifs = call('notifications')

module.exports = {
    "interaction.money.give": (player, targetId, sum) => {
        let target = mp.players.at(targetId);

        if (!target) return player.call('interaction.money.ans', [0]);
        if (target == player) return player.call('interaction.money.ans', [5]);
        
        let value = parseInt(sum);

        if (!value || isNaN(value)) return player.call('interaction.money.ans', [1]);
        if (value < 1 || value > 5000) return player.call('interaction.money.ans', [1]);

        if (player.character.cash < value) return player.call('interaction.money.ans', [2]);

        if (utils.vdist(player.position, target.position) > 5) return player.call('interaction.money.ans', [6]);

        let minutes = parseInt((Date.now() - player.authTime) / 1000 / 60) + player.character.minutes;
        if (minutes < interaction.minutesToPay)
            return notifs.error(player, `Вам нужно отыграть еще ${interaction.minutesToPay - minutes} мин. для передачи денег`, `Деньги`);

        if (player.lastPayTime) {
            let now = new Date();
            let diff = (now - player.lastPayTime) / 1000;
            if (diff < interaction.payTime) {
                player.call('interaction.money.ans', [7]);
                return notifs.error(player, `Ожидайте ${Math.ceil(interaction.payTime - diff)} сек`, `Деньги`);
            }
        }

        money.moveCash(player, target, value, function(result) {
            if (result) {
                player.call('interaction.money.ans', [4]);
                target.call('notifications.push.success', [`+$${value} от ID: ${player.id}`, `Деньги`]);
                player.lastPayTime = new Date();
            } else {
                player.call('interaction.money.ans', [3]);
            }
        }, `Передача денег на руки от игрока #${player.character.id} игроку #${target.character.id}`, `Передача денег на руки от игрока #${player.character.id} игроку #${target.character.id}`);
    }
}