"use strict";


mp.prompt = {
    show: (text) => {
        mp.events.call("prompt.show", text);
    },
    hide: () => {
        mp.events.call("prompt.hide");
    },
    showByName: (name) => {
        mp.events.call("prompt.showByName", name);
    }
};


mp.events.add("prompt.show", (text) => {
    mp.callCEFV(`prompt.show(\`${text}\`)`);
});

mp.events.add("prompt.hide", () => {
    mp.callCEFV(`prompt.hide()`);
});

mp.events.add("prompt.showByName", (name) => {
    mp.callCEFV(`prompt.showByName(\`${name}\`)`);
});

mp.events.add("prompt.waitShowByName", (name, time = 5000) => {
    mp.timer.add(() => {
        mp.callCEFV(`prompt.showByName(\`${name}\`)`);
    }, time);
});
