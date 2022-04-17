"use strict";

/// Инициализация перед авторизацией
mp.events.add('auth.init', () => {
    mp.gui.cursor.show(true, true);
    mp.players.local.freezePosition(true);
    mp.game.ui.displayRadar(false);
    mp.game.ui.displayHud(false);

    mp.players.local.position = new mp.Vector3(-871.5838623046875, -3367.291259765625, 93.1123275756836);
    mp.utils.cam.create(-891.6650390625, -3305.496826171875, 81.51831817626953, -914.5517578125, -3230.570556640625, 61.0429573059082);

    mp.callCEFV(`auth.show = true;`);
});

/// Вход в аккаунт
mp.events.add('auth.login', (data) => {
    mp.events.callRemote('auth.login', data);
});
/// Результат входа в аккаунт
mp.events.add('auth.login.result', (result, data) => {
    if (result == 7 && data) mp.callCEFV(`characterInfo.coins = ${data.donate}`);
    mp.callCEFV(`auth.showLoginResult(${result})`);
});

/// Регистрация аккаунта
mp.events.add('auth.register', (data) => {
    mp.events.callRemote('auth.register', data);
});
/// Результат регистрации аккаунта
mp.events.add('auth.register.result', (result, data) => {
    mp.callCEFV(`auth.showRegisterResult(${result})`);

    //temp
    //result == 9 && mp.events.call('auth.email.confirm', 0);
});

// Результат восстановление аккаунта
mp.events.add('auth.recovery.result', (result) => {
    mp.callCEFV(`auth.showRecoveryResult(${result})`);
});

/// Запрос на отправку кода подтверждения почты
mp.events.add('auth.email.confirm', (state) => {
    mp.events.callRemote('auth.email.confirm', state == 1);
    state == 0 && mp.callCEFV(`auth.show = false;`);
});
/// Запорос на проверку кода из письма
mp.events.add('auth.email.confirm.code', (code) => {
    mp.events.callRemote('auth.email.confirm.code', code);
});
/// Ответ проверки почты
mp.events.add('auth.email.confirm.result', (result) => {
    mp.callCEFV(`auth.showEmailConfirmResult(${result})`);
});
