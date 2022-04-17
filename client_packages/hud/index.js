"use strict";

let prevValues = {};
let ignoreValues = ['cold', 'heat'];
let hudState = false;
let playersListState = false;

mp.events.add('hud.load', () => {
    var anchor = mp.utils.getMinimapAnchor();
    var resolution = mp.game.graphics.getScreenActiveResolution(0, 0);
    mp.callCEFV(`hud.leftWeather = ${resolution.x * (anchor.rightX * 1.1)}`);
    mp.events.call('hud.enable', true);

    mp.keys.bind(0x74, true, function() { /// Включение/отключение худа на F5
        if (mp.busy.list.includes("carshow")) return;
        if (hudState) {
            mp.events.call('hud.enable', false);
            // mp.callCEFV('speedometer.show = false');
            mp.game.ui.displayRadar(false);
        } else {
            mp.events.call('hud.enable', true);
            if (mp.players.local.vehicle && mp.players.local.vehicle.getPedInSeat(-1) == mp.players.local.handle && mp.speedometerEnabled) {
                // mp.callCEFV('speedometer.show = true');
            }
            mp.game.ui.displayRadar(true);
        }
    });

    // список игроков на F9
    mp.keys.bind(0x78, true, function() {
        if (mp.game.ui.isPauseMenuActive()) return;
        if (playersListState) {
            mp.events.call('hud.players.list.show', false)
        } else {
            if (!mp.busy.includes()) {
                mp.events.callRemote('hud.players.list.show');
            }
        }
    });
});

mp.events.add('hud.enable', (state) => {
    mp.callCEFVN({
        "hud.show": state
    });
    hudState = state;
});

mp.events.add("hud.setData", (data) => {
    for (var key in data) {
        if (prevValues[key] == data[key] && !ignoreValues.includes(key)) continue;
        prevValues[key] = data[key];
        if (typeof data[key] == 'string') data[key] = `'${data[key]}'`;
        mp.callCEFV(`hud.${key} = ${data[key]}`);
    }
});

mp.events.add("time.main.tick", () => {
    var pos = mp.players.local.position;
    mp.events.call("hud.setData", {
        street: mp.utils.getStreetName(pos),
        region: mp.utils.getRegionName(pos)
    });
    if (mp.busy.includes("mapCase")) {
        mp.events.call("hud.setData", {
            'localPos.x': parseInt(pos.x),
            'localPos.y': parseInt(pos.y),
        });
    }
});

mp.events.add('render', () => {
    mp.game.ui.hideHudComponentThisFrame(1);
    mp.game.ui.hideHudComponentThisFrame(2);
    mp.game.ui.hideHudComponentThisFrame(3);
    mp.game.ui.hideHudComponentThisFrame(4);
    mp.game.ui.hideHudComponentThisFrame(6);
    mp.game.ui.hideHudComponentThisFrame(7);
    mp.game.ui.hideHudComponentThisFrame(8);
    mp.game.ui.hideHudComponentThisFrame(9);
    mp.game.ui.hideHudComponentThisFrame(13);
});

mp.events.add('hud.players.list.show', (state) => {
    mp.callCEFR('players.show', [state]);

    if (state) {
        mp.busy.add('playersList');
    } else {
        mp.busy.remove('playersList');
    }

    playersListState = state;
});

mp.events.add('hud.players.list.load', (players) => {
    mp.callCEFR('players.load', [players]);
})

mp.events.add('hud.players.list.add', (newPlayer) => {
    mp.callCEFR('players.add', [newPlayer]);
});

mp.events.add('hud.players.list.remove', (id) => {
    mp.callCEFR('players.remove', [id]);
});

mp.events.add('hud.players.list.update', (id, data) => {
    mp.callCEFR('players.update', [id, data]);
});

mp.events.call('hud.setData', {
    playerId: mp.players.local.remoteId
});
