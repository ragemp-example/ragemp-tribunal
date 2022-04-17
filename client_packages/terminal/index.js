"use strict";


mp.terminal = {
    // Макс. кол-во сохраненных команд
    maxCmdsCount: 50,

    enable(enable) {
        mp.callCEFV(`terminal.enable = ${enable}`);
    },
    push(type, text) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`terminal.push(\`${type}\`, \`${text}\`)`);
    },
    debug(text) {
        this.push(`debug`, text);
    },
    initStorage() {
        if (mp.storage.data.terminal) return;
        mp.storage.data.terminal = {
            savedCmds: []
        };
    },
    initSavedCmds() {
        let cmds = mp.storage.data.terminal.savedCmds;
        mp.callCEFV(`terminal.initSavedCmds(${JSON.stringify(cmds)})`);
    },
    saveCmd(text) {
        let cmds = mp.storage.data.terminal.savedCmds;
        cmds.unshift(text);
        if (cmds.length > this.maxCmdsCount) cmds.pop();
    },
};

mp.events.add({
    "terminal.enable": mp.terminal.enable,
    "terminal.push": mp.terminal.push,
    "terminal.saveCmd": (text) => {
        mp.terminal.saveCmd(text);
    },
});


mp.terminal.initStorage();
mp.terminal.initSavedCmds();
