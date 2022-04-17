let money = require('./index');
let logger = call("logger");

module.exports = {
    "/addcash": {
        access: 6,
        description: "Дать наличности",
        args: "[id]:n [Кол-во]:n",
        handler: (player, args) => {
            let id = parseInt(args[0]);
            let number = parseInt(args[1]);
            if (isNaN(id)|| isNaN(number)) return player.call('notifications.push.error', ["Введите данные верно", "Ошибка передачи денег"]);
            if (mp.players.at(id) == null || mp.players.at(id).character == null) return player.call('notifications.push.error', ["Игрок с данным id отсутствует на сервере или не авторизовался", "Ошибка передачи денег"]);
            if (number < 0 || number > 100000000) return player.call('notifications.push.error', ["Введите сумму для передачи верно", "Ошибка передачи денег"]);
            money.addCash(mp.players.at(id), number, function(result) {
                if (!result) return player.call('notifications.push.error', ["По неизвестным причинам", "Ошибка передачи денег"]);
                player.call('notifications.push.success', ["Вы выдали " + number + "$ наличными", "Выдача денежных средств"]);
                mp.players.at(id).call('notifications.push.success', ["Вам дали " + number + "$ наличными", "Получены денежные средства"]);
            }, `Команда от админа #${player.character.id}`);
        }
    },
    "/addcashbynick": {
        access: 6,
        description: "Дать наличности",
        args: "[Кол-во]:n [nick]:s",
        handler: async (player, args) => {
            let character = await db.Models.Character.findOne({
                where: {
                    name: `${args[1]} ${args[2]}`
                }
            });
            if (character == null) player.call('notifications.push.error', ["Игрока с таким ником не существует", "Ошибка выдачи денег"]);
            money.addCashById(character.id, args[0], (result) => {
                if (!result) return player.call('notifications.push.error', ["По неизвестным причинам", "Ошибка выдачи денег"]);
                player.call('notifications.push.success', ["Вы выдали " + args[0] + "$ наличными", "Выдача денежных средств"]);
            }, `Команда от админа #${player.character.id}`)
        }
    },
    "/addmoney": {
        access: 6,
        description: "Пополнить банковский счет",
        args: "[id]:n [Кол-во]:n",
        handler: (player, args) => {
            let id = parseInt(args[0]);
            let number = parseInt(args[1]);
            if (isNaN(id)|| isNaN(number)) return player.call('notifications.push.error', ["Введите данные верно", "Ошибка пополнения счета"]);
            if (mp.players.at(id) == null || mp.players.at(id).character == null) return player.call('notifications.push.error', ["Игрок с данным id отсутствует на сервере или не авторизовался", "Ошибка пополнения счета"]);
            if (number < 0 || number > 100000000) return player.call('notifications.push.error', ["Введите сумму для передачи верно", "Ошибка пополнения счета"]);
            money.addMoney(mp.players.at(id), number, function(result) {
                if (!result) return player.call('notifications.push.error', ["По неизвестным причинам", "Ошибка пополнения счета"]);
                player.call('notifications.push.success', ["Вы перевели " + number + "$ на счет", "Выдача денежных средств"]);
                mp.players.at(id).call('notifications.push.success', ["Вам перевели " + number + "$ на счет", "Получены денежные средства"]);
            }, `Команда от админа #${player.character.id}`);
        }
    },
    "/removecash": {
        access: 6,
        description: "Отобрать наличность",
        args: "[id]:n [Кол-во]:n",
        handler: (player, args) => {
            let id = parseInt(args[0]);
            let number = parseInt(args[1]);
            if (isNaN(id)|| isNaN(number)) return player.call('notifications.push.error', ["Введите данные верно", "Ошибка снятия денег"]);
            if (mp.players.at(id) == null || mp.players.at(id).character == null) return player.call('notifications.push.error', ["Игрок с данным id отсутствует на сервере или не авторизовался", "Ошибка снятия денег"]);
            if (number < 0 || number > 100000000) return player.call('notifications.push.error', ["Введите сумму для снятия верно", "Ошибка снятия денег"]);
            money.removeCash(mp.players.at(id), number, function(result) {
                if (!result) return player.call('notifications.push.error', ["По неизвестным причинам", "Ошибка снятия денег"]);
                player.call('notifications.push.success', ["Вы отобрали " + number + "$ наличными", "Отъем денежных средств"]);
                mp.players.at(id).call('notifications.push.success', ["У вас отобрали " + number + "$ наличными", "Потеряны денежные средства"]);
            }, `Команда от админа #${player.character.id}`);
        }
    },
    "/removemoney": {
        access: 6,
        description: "Снять с банковского счета",
        args: "[id]:n [Кол-во]:n",
        handler: (player, args) => {
            let id = parseInt(args[0]);
            let number = parseInt(args[1]);
            if (isNaN(id)|| isNaN(number)) return player.call('notifications.push.error', ["Введите данные верно", "Ошибка снятия со счета"]);
            if (mp.players.at(id) == null || mp.players.at(id).character == null) return player.call('notifications.push.error', ["Игрок с данным id отсутствует на сервере или не авторизовался", "Ошибка снятия со счета"]);
            if (number < 0 || number > 100000000) return player.call('notifications.push.error', ["Введите сумму для снятия верно", "Ошибка снятия со счета"]);
            money.removeMoney(mp.players.at(id), number, function(result) {
                if (!result) return player.call('notifications.push.error', ["По неизвестным причинам", "Ошибка снятия со счета"]);
                player.call('notifications.push.success', ["Вы сняли " + number + "$ со счета", "Отъем денежных средств"]);
                mp.players.at(id).call('notifications.push.success', ["У вас сняли " + number + "$ со счета", "Потеряны денежные средства"]);
            }, `Команда от админа #${player.character.id}`);
        }
    },
    "/checkmoney": {
        access: 6,
        description: "Проверить наличные и счет",
        args: "[id]:n",
        handler: (player, args) => {
            let id = parseInt(args[0]);
            if (isNaN(id)) return player.call('notifications.push.error', ["Введите данные верно", "Ошибка проверки наличных и счета"]);
            if (mp.players.at(id) == null || mp.players.at(id).character == null) return player.call('notifications.push.error', ["Игрок с данным id отсутствует на сервере или не авторизовался", "Ошибка проверки наличных и счета"]);
            player.call('notifications.push.success', ["У игрока " + mp.players.at(id).character.cash + "$ наличными и " + mp.players.at(id).character.bank + "$ на банковском счете", "Состояние наличных и счета игрока"]);
        }
    },
};