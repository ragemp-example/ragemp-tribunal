"use strict";

// ************** События взаимодействия с меню **************

// Вызов события необходимо прописать в [CEF] selectMenu.menu.handler(), если в этом есть необходимость.
mp.events.add({
    "selectMenu.handler": (menuName, eventName, e) => {
        e = JSON.parse(e);
        // TODO: Обработка событий...
    },
    "selectMenu.show": (menuName) => {
        mp.callCEFV(`selectMenu.showByName(\`${menuName}\`)`);
    },
    "selectMenu.hide": () => {
        mp.callCEFV(`selectMenu.show = false`);
    },
    "selectMenu.loader": (enable) => {
        mp.callCEFV(`selectMenu.loader = ${enable}`);
    },
    "selectMenu.notification": (text) => {
        mp.callCEFV(`selectMenu.notification = \`${text}\``);
    },
    "selectMenu.focusSound.play": () => {
        mp.game.audio.playSoundFrontend(-1, "NAV_UP_DOWN", "HUD_FRONTEND_DEFAULT_SOUNDSET", true);
    },
    "selectMenu.backSound.play": () => {
        mp.game.audio.playSoundFrontend(-1, "CANCEL", "HUD_FRONTEND_DEFAULT_SOUNDSET", true);
    },
    "selectMenu.selectSound.play": () => {
        mp.game.audio.playSoundFrontend(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", true);
    },
});
