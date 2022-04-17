"use strict";

mp.walking = {
    setWalkingStyle(player, style) {
        if (!style) {
            player.resetMovementClipset(0.0);
        } else {
            if (!mp.game.streaming.hasClipSetLoaded(style)) {
                mp.game.streaming.requestClipSet(style);
                while (!mp.game.streaming.hasClipSetLoaded(style)) mp.game.wait(0);
            }

            player.setMovementClipset(style, 0.0);
        }
    }
};

mp.events.add({
    "entityStreamIn": (player) => {
        if (player.type != "player") return;
        mp.walking.setWalkingStyle(player, player.getVariable("walking"));
    },
});

mp.events.addDataHandler("walking", (player, value) => {
    if (player.type != "player") return;
    mp.walking.setWalkingStyle(player, player.getVariable("walking"));
});
