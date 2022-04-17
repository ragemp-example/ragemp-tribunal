"use strict";
/// Подключение всех модулей на сервере

mp.gui.cursor.show(true, false);

/// Служебные модули
require('base');
require('utils');
require('browser');

let browserLoaded = false;
let initDone = false;

mp.events.add('render', () => {
    if (!browserLoaded || !initDone) {
        mp.game.graphics.drawText("Сервер загружается, подождите", [0.5, 0.5], {
            font: 0,
            color: [255,66,247, 200],
            scale: [0.5, 0.5],
            outline: true
        });
    }
});

/// Автоподключение клиентских модулей
mp.events.add('init', (activeModules) => {
    activeModules.forEach(moduleName => {
        require(moduleName);
    });
    if (browserLoaded) {
        mp.events.callRemote('player.joined');
    }
    initDone = true;
});

mp.events.add('browserDomReady', (browser) => {
    if (initDone) {
        mp.events.callRemote('player.joined');
    }
    browserLoaded = true;
});
mp.events.callRemote('player.join');