"use strict";


mp.dev = {
    eval(code, playerId) {
        var result = eval(code);
        mp.events.callRemote(`dev.eval.result`, result, playerId);
    },
};

mp.events.add({
    "dev.eval": (code, playerId) => {
        mp.dev.eval(code, playerId);
    },
});
