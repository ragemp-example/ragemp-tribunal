"use strict";

mp.mood = {
    set(player, mood) {
        if (!mood) player.clearFacialIdleAnimOverride();
        else mp.game.invoke("0xFFC24B988B938B38", player.handle, mood, 0);
    },
};

mp.events.add({
    "entityStreamIn": (player) => {
        if (player.type != "player") return;
        mp.mood.set(player, player.getVariable("mood"));
    },
});

mp.events.addDataHandler("mood", (player, value) => {
    if (player.type != "player") return;
    mp.mood.set(player, player.getVariable("mood"));
});
