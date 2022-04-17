const NATIVES = {
    GET_PLAYER_RADIO_STATION_INDEX: '0xE8AF77C4C06ADC93',
    SET_FRONTEND_RADIO_ACTIVE: '0xF7F26C6E9CC9EBB8',
    SET_RADIO_TO_STATION_INDEX: '0xA619B168B8A8570F'
}

let player = mp.players.local;
let radioSyncTimer;

mp.events.add({
    "playerEnterVehicle": () => {
        mp.timer.remove(radioSyncTimer);
        mp.timer.addInterval(syncRadio, 1000);
    },
    "playerLeaveVehicle": () => {
        mp.timer.remove(radioSyncTimer);
    }
});

function syncRadio() {
    try {
        let vehicle = player.vehicle;
        if (!vehicle) return;
        let radioIndex = vehicle.getVariable('radioIndex');
        let currentRadioIndex = mp.game.invoke(NATIVES.GET_PLAYER_RADIO_STATION_INDEX);
        if (player.handle == vehicle.getPedInSeat(-1)) {
            if (radioIndex != currentRadioIndex) mp.events.callRemote('vehicles.radio.set', currentRadioIndex);
        } else {
            if (radioIndex == null) {
                mp.events.callRemote('vehicles.radio.set', currentRadioIndex);
            } else if (radioIndex != currentRadioIndex) {
                if (radioIndex === 255) {
                    mp.game.audio.setRadioToStationName("OFF");
                } else {
                    mp.game.invoke(NATIVES.SET_FRONTEND_RADIO_ACTIVE, true);
                    mp.game.invoke(NATIVES.SET_RADIO_TO_STATION_INDEX, radioIndex);
                }
            }
        }
    } catch (err) {
        mp.chat.debug(err.message);
        mp.timer.remove(radioSyncTimer);
    }
}
