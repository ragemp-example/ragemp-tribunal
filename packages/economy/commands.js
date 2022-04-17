"use strict";

let economy = require('./index.js');
let notifs = call("notifications");

module.exports = {
    "/economy": {
        access: 6,
        description: "Посмотреть все экономические факторы",
        args: "",
        handler: (player, args) => {
            let infoArray = new Array();
            activeServerModules.forEach(moduleName => {
                let info = economy.getByModuleName(moduleName);
                infoArray.push({name: moduleName, info: info});
            });
            player.call('economy.show', [JSON.stringify(infoArray)]);
        }
    },
}