"use strict";
/// Модуль авторизации игрока
let auth = require("./index.js");
let utils;
let notifs;
let whitelist;

module.exports = {
    "init": () => {
        utils = call("utils");
        notifs = call("notifications");
        whitelist = call("whitelist");
        inited(__dirname);
    },
    /// Заморозка игрока перед авторизацией
    'player.joined': async (player) => {
        player.dimension = player.id + 1;

        if (!whitelist.isEmpty) {
            if (whitelist.isEnabled()) {
                if (whitelist.isInWhiteList(player.socialClub)) {
                    console.log(`[WHITELIST] ${player.socialClub} зашел на сервер по вайтлисту`);
                }
                else {
                    console.log(`[WHITELIST] ${player.socialClub} пытался войти, но его нет в вайтлисте`);
                    player.call('notifications.push.error', [`Social Club ${player.socialClub} не находится в вайтлисте`]);
                    player.kick("Kicked");
                    return;
                }
            }
        }

        let ban = await db.Models.Ban.findOne({
            where: {
                [Op.or]: {
                    ip: player.ip,
                    socialClub: player.socialClub,
                    serial: player.serial,
                }
            }
        });
        if (ban) {
            player.notify(`Вы заблокированы! (${ban.reason || "-"})`);
            player.kick();
            return;
        }

        player.call('auth.init', []);
    },
    'auth.login': async (player, data) => {
        //  data = '{"loginOrEmail":"Carter", "password":"123123"}';
        data = JSON.parse(data);
        data.loginOrEmail = data.loginOrEmail.toLowerCase();
        if (!data.loginOrEmail || data.loginOrEmail.length == 0) {
            /// Заполните поле логина или почты!
            return player.call('auth.login.result', [0]);
        }

        let regLogin = /^[0-9a-z_\.-]{5,20}$/i;
        let regEmail = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
        if (!regLogin.test(data.loginOrEmail) && !regEmail.test(data.loginOrEmail)) {
            /// Некорректное значение логина или почты!
            return player.call('auth.login.result', [1]);
        }

        if (data.password.length < 6 || data.password.length > 20) {
            /// Неверный пароль!
            return player.call('auth.login.result', [2]);
        }

        let account = await db.Models.Account.findOne({
            where: {
                [Op.or]: {
                    login: data.loginOrEmail,
                    [Op.and]: {
                        email: data.loginOrEmail,
                        confirmEmail: 1
                    }
                },
            },
        });

        if (!account) {
            /// Неверный логин или пароль
            return player.call('auth.login.result', [4]);
        }
        if (!auth.comparePassword(data.password, account.password)) {
            /// Неверный логин или пароль
            return player.call('auth.login.result', [4]);
        }
        if (account.socialClub != player.socialClub)
            /// Неверный Social Club
            return player.call('auth.login.result', [5]);

        if (auth.accountIsOnline(account.id))
            /// Аккаунт уже авторизован
            return player.call('auth.login.result', [6]);

        if (account.clearBanDate) {
            if (Date.now() < account.clearBanDate.getTime()) {
                // Аккаунт заблокирован
                return player.call('auth.login.result', [8]);
            } else {
                account.clearBanDate = null;
                account.save();
                notifs.success(player, `Аккаунт был разблокирован. Не нарушайте правила.`);
            }
        }

        player.account = account;
        /// Вход в аккаунт выполнен успешно
        player.call('auth.login.result', [7, {
            donate: player.account.donate
        }]);
        mp.events.call('auth.done', player);
    },
    'auth.register': async (player, data) => {
        // data = '{"login":"Carter","email":"test@mail.ru","password":"123123","emailCode":-1}';
        data = JSON.parse(data);
        data.login = data.login.toLowerCase();

        /// Вы уже зарегистрировали учетную запись!
        if (player.accountRegistrated) return player.call('auth.register.result', [0]);
        /// Логин должен состоять из 5-20 символов!
        if (!data.login || data.login.length < 5 || data.login.length > 20) return player.call('auth.register.result', [1]);
        /// Пароль должен состоять из 6-20 символов!
        if (!data.password || data.password.length < 6 || data.password.length > 20) return player.call('auth.register.result', [2]);
        /// Email должен быть менее 40 символов!
        if (!data.email || data.email.length > 40) return player.call('auth.register.result', [3]);

        let r = /^[0-9a-z_\.-]{5,20}$/i;
        /// Некорректный логин!
        if (!r.test(data.login)) return player.call('auth.register.result', [4]);
        /// Некорректный email!
        r = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
        if (!r.test(data.email)) return player.call('auth.register.result', [5]);

        let account = await db.Models.Account.findOne({
            attributes: ["login", "email", "socialClub", "confirmEmail"],
            where: {
                [Op.or]: {
                    login: data.login,
                    socialClub: player.socialClub,
                    [Op.and]: {
                        email: data.email,
                        confirmEmail: 1
                    }
                }
            }
        });

        if (account) {
            if (account.login == data.login) {
                /// Логин занят
                return player.call('auth.register.result', [6]);
            } else if (account.email == data.email && account.confirmEmail) {
                /// Email занят
                return player.call('auth.register.result', [7]);
            } else if (account.socialClub == player.socialClub) {
                /// Аккаунт с Social Club ${player.socialClub} уже зарегистрирован
                return player.call('auth.register.result', [8, player.socialClub]);
            }
        } else {
            player.account = await db.Models.Account.create({
                login: data.login,
                socialClub: player.socialClub,
                password: auth.hashPassword(data.password),
                email: data.email,
                regIp: player.ip,
                lastIp: player.ip,
                confirmEmail: 0,
                slots: 3,
                donate: auth.startCoinsBouns,
            });
            player.accountRegistrated = true;
            /// Аккаунт зарегестрирован успешно
            player.call('auth.register.result', [9]);
        }
    },
    "auth.email.confirm": (player, state) => {
        if (!state) return mp.events.call('auth.done', player);
        /// На данный момент подтвердить почту невозможно
        if (utils == null) return player.call('auth.email.confirm.result', [2]);
        let code = utils.randomInteger(100000, 999999);
        utils.sendMail(player.account.email, `Подтверждение электронной почты`, `Код подтверждения: <b>${code}</b>`);
        auth.setEmailCode(player.account.email, code);
    },
    "auth.email.confirm.code": (player, code) => {
        if (code && auth.getEmailCode(player.account.email) == code) {
            player.account.confirmEmail = 1;
            db.Models.Account.update({
                confirmEmail: 1,
            }, {
                where: {
                    login: player.account.login
                }
            });
            /// Подтверждение почты прошло успешно
            player.call('auth.email.confirm.result', [1]);
            mp.events.call('auth.done', player);
        } else {
            /// Код подтверждения неверный
            player.call('auth.email.confirm.result', [0]);
        }
    },
    "auth.recovery": async (player, loginOrEmail) => {
        if (!loginOrEmail || loginOrEmail.length == 0) {
            /// Заполните поле логина или почты!
            return player.call('auth.recovery.result', [0]);
        }

        let regLogin = /^[0-9a-z_\.-]{5,20}$/i;
        let regEmail = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
        if (!regLogin.test(loginOrEmail) && !regEmail.test(loginOrEmail)) {
            /// Некорректное значение логина или почты!
            return player.call('auth.recovery.result', [1]);
        }

        let account = await db.Models.Account.findOne({
            where: {
                [Op.or]: {
                    login: loginOrEmail,
                    [Op.and]: {
                        email: loginOrEmail,
                        confirmEmail: 1
                    }
                },
            },
        });

        if (!account) {
            /// Неверный логин или пароль
            return player.call('auth.recovery.result', [2]);
        }

        let code = utils.randomInteger(100000, 999999);
        utils.sendMail(account.email, `Восстановление аккаунта`, `Код подтверждения: <b>${code}</b>`);
        player.recovery = {
            code: code,
            account: account,
            access: false,
            attempts: 0,
            attemptsMax: 5,
        };

        // код отправлен
        player.call('auth.recovery.result', [3]);
    },
    "auth.recovery.confirm": (player, code) => {
        code = parseInt(code);
        if (player.recovery.code != code) {
            player.recovery.attempts++;
            if (player.recovery.attempts >= player.recovery.attemptsMax) {
                // Превышено количество попыток
                player.call('auth.recovery.result', [9]);
                player.kick();
                return;
            }
            /// Неверный код подтверждения
            return player.call('auth.recovery.result', [4]);
        }
        delete player.recovery.code;
        player.recovery.access = true;

        // код подтвержден
        player.call('auth.recovery.result', [5]);
    },
    "auth.recovery.password": (player, password) => {
        /// Пароль должен состоять из 6-20 символов!
        if (!password || password.length < 6 || password.length > 20) return player.call('auth.recovery.result', [6]);
        if (!player.recovery.access) {
            // Подтвердите код
            return player.call('auth.recovery.result', [7]);
        }


        player.recovery.account.password = auth.hashPassword(password);
        player.recovery.account.save();
        delete player.recovery;

        // Аккаунт восстановлен
        player.call('auth.recovery.result', [8]);
    },
};
