let auth = call('auth');
let notifs = call('notifications');
let settings = call('settings');
let utils = call('utils');

module.exports = {
    "characterInit.done": (player) => {
        settings.apply(player, player.character.settings);
    },
    "settings.set": (player, modified) => {
        modified = JSON.parse(modified);
        for (var key in modified) {
            player.character.settings[key] = modified[key];
        }
        player.character.settings.save();
        settings.apply(player, modified);
    },
    "settings.password.set": (player, data) => {
        data = JSON.parse(data);
        var header = `Смена пароля`;
        if (!data.newPass || data.newPass.length < 6 || data.newPass.length > 20) return notifs.error(player, `Пароль должен состоять из 6-20 символов`, header);
        if (!auth.comparePassword(data.oldPass, player.account.password)) return notifs.error(player, `Старый пароль не совпадает`, header);
        if (auth.comparePassword(data.newPass, player.account.password)) return notifs.error(player, `Новый пароль совпадает со старым`, header);


        player.account.password = auth.hashPassword(data.newPass);
        player.account.passwordDate = new Date();
        player.account.save();

        notifs.success(player, `Пароль успешно изменен`, header);
        mp.events.call("player.password.changed", player);
    },
    "settings.email.set": async (player, email) => {
        var header = `Смена почты`;
        if (!email || email.length > 40) return notifs.error(player, `Email должен быть менее 40 символов`, header);
        var r = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
        if (!r.test(email)) return notifs.error(player, `Некорректный email`, header);

        var exists = await db.Models.Account.findOne({
            attributes: ['id'],
            where: {
                email: email,
                confirmEmail: 1
            }
        });
        if (exists != null) return notifs.error(player, `Email ${email} занят`, header);

        player.account.email = email;
        player.account.confirmEmail = 0;
        player.account.save();

        notifs.success(player, `Email успешно изменен`, header);
        mp.events.call("player.email.changed", player);
    },
    "settings.email.confirm": async (player) => {
        var header = `Подтверждение почты`;
        if (player.account.confirmEmail) return notifs.error(player, `Email уже подтвержден`, header);

        var exists = await db.Models.Account.findOne({
            attributes: ['id'],
            where: {
                email: player.account.email,
                confirmEmail: 1
            }
        });
        if (exists != null) return notifs.error(player, `Email ${email} занят`, header);

        let code = utils.randomInteger(100000, 999999);
        utils.sendMail(player.account.email, `Подтверждение электронной почты`, `Код подтверждения: <b>${code}</b>`);

        player.confirmCode = code;
        notifs.success(player, `Код подтверждения отправлен на ${player.account.email}`, header);
    },
    "settings.email.code.check": (player, code) => {
        var header = `Подтверждение почты`;
        if (player.account.confirmEmail) return notifs.error(player, `Email уже подтвержден`, header);
        if (!player.confirmCode) return notifs.error(player, `Код подтверждения не найден`, header);
        if (!code || code != player.confirmCode) return notifs.error(player, `Неверный код подтверждения`, header);

        player.account.confirmEmail = 1;
        player.account.save();

        notifs.success(player, `Email успешно подтвержден`, header);
        mp.events.call("player.email.changed", player);
    },
}
