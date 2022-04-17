"use strict";

let channelNumber = null;
let volumeLevel = 1.0;
let isShow = false;


mp.attachmentMngr.register("takeRadio", "prop_cs_walkie_talkie", 58867, new mp.Vector3(0.06, 0.04, 0.01), new mp.Vector3(-15, 0, -145));


mp.events.add('characterInit.done', function () {
    for (let i = 0; i < 100; i++) {
        mp.speechChannel.addChannel('radio' + i, 0, false, false, volumeLevel);
    }
    mp.keys.bind(0x4B, true, radioSetHud);                  // K

});


mp.events.add('player.faction.changed', function () {
    if (!mp.factions.isStateFaction(mp.players.local.getVariable('factionId')))  {
        radioHideHud();
        mp.callCEFV(`radio.show = false;`);

        if (channelNumber == null) return;
        mp.events.callRemote('radioSet.disconnect', channelNumber);
    }
});

mp.events.add('radioSet.connect', function (channel) {
    channelNumber = channel;
    mp.events.callRemote('radioSet.connect', channelNumber);
    mp.speechChannel.setVoiceVolumeChannel('radio' + channelNumber, volumeLevel);
});

mp.events.add('radioSet.disconnect', function () {
    if (channelNumber == null) return;
    mp.events.callRemote('radioSet.disconnect', channelNumber);
    channelNumber = null;
});

mp.events.add('radioSet.volumeUp', function () {
    if (!channelNumber) return;
    volumeLevel += 0.1;
    volumeLevel = parseFloat(volumeLevel.toFixed(1));
    if (volumeLevel > 1.0) volumeLevel = 1.0;
    mp.speechChannel.setVoiceVolumeChannel('radio' + channelNumber, volumeLevel);
});

mp.events.add('radioSet.volumeDown', function () {
    if (!channelNumber) return;
    volumeLevel -= 0.1;
    volumeLevel = parseFloat(volumeLevel.toFixed(1));
    if (volumeLevel < 0) volumeLevel = 0;
    mp.speechChannel.setVoiceVolumeChannel('radio' + channelNumber, volumeLevel);
});


mp.events.add("playerDeath", (player) => {
    if (player.remoteId === mp.players.local.remoteId) {
        if (mp.busy.includes('phone')) {
            radioHideHud();
        }
    }
});

let radioSetHud = () => {
    if (!mp.factions.isStateFaction(mp.players.local.getVariable('factionId'))) return;
    if (!isShow) {
        radioShowHud();
    }
    else {
        radioHideHud();
    }
};

let radioShowHud = () => {
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    let player = mp.players.local;
    if (player.getVariable("knocked")) return;
    if (!player.getHealth()) return;

    if (!mp.busy.add('radio')) return;
    mp.callCEFV(`radio.show = true;`);
    isShow = true;

    playHoldAnimation(true);
};

let radioHideHud = () => {
    if (mp.game.ui.isPauseMenuActive()) return;
    if (!mp.busy.includes('radio')) return;


    mp.callCEFV(`radio.show = false;`);
    mp.busy.remove('radio');
    isShow = false;

    playHoldAnimation(false);
};

let playHoldAnimation = (state, timeout) => { /// Анимация держания рации
    if (mp.players.local.vehicle) return;
    if (state) {
        if (!timeout) timeout = 0;
        mp.timer.add(()=> {
            mp.events.callRemote('animations.play', 'amb@code_human_wander_texting@male@base', 'static', 1, 49);
            mp.attachmentMngr.addLocal("takeRadio");
        }, timeout);
    }
    else {
        mp.attachmentMngr.removeLocal("takeRadio");
        mp.events.callRemote('animations.stop');
    }
}