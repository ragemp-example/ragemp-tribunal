"use strict";

let phone = require("./index.js");
module.exports = {
    "/buyphone": {
        access: 1,
        description: "Покупка телефона",
        args: "",
        handler: (player, args) => {
            mp.events.call("phone.buy", player);
        }
    },
    "/changephone": {
        access: 1,
        description: "change",
        args: "",
        handler: async (player, args) => {
            console.log(await phone.changeNumber(player, args[0]));
        }
    },
}