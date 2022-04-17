"use strict";

let notifs;
let objeditor;
let admin;

module.exports = {
    speedingFine: 100,
    init() {
        notifs = call("notifications");
        objeditor = call("objeditor");
        admin = call("admin");
    },
    create(player, speedLimit) {
        if (player.speedingradarObj != null) return notifs.info(player, "Нельзя установить еще один радар, пока не будет уничтожен текущий", "Радар");
        player.speedingradarObj = objeditor.initTempObj({
            model: "prop_air_lights_04a",
            x: player.position.x,
            y: player.position.y,
            z: player.position.z - 1,
            rotX: 0,
            rotY: 0,
            rotZ: player.heading - 180,
            alpha: 255,
            dimension: player.dimension,
        }, 10 * 30000, () => {
            notifs.info(player, "Истекло время работы радара и он был собран", "Радар");
            player.speedingradarObj = null;
            player.speedingradar.colshape.destroy();
            player.speedingradar.colshapeChecker.destroy();
            player.speedingradar = null;
        });

        let colshape = mp.colshapes.newCircle(player.position.x, player.position.y, 50, player.dimension);
        colshape.speedingradarObj = player.speedingradarObj;

        let angle = 360 - player.heading;
        angle = angle * Math.PI / 180;
        let colshapeChecker = mp.colshapes.newCircle(player.position.x + 6 * Math.sin(angle), player.position.y + 6 * Math.cos(angle), 6, player.dimension);
        colshapeChecker.setVariable('speedingradars.speedLimit', speedLimit);
        colshapeChecker.setVariable('speedingradars.copId', player.character.id);

        notifs.info(player, "Радар установлен", "Радар");
        notifs.info(player, "Радар будет уничтожен, если вы далеко от него отойдете или через 10 минут", "Радар");

        player.speedingradar = {
            colshape: colshape,
            colshapeChecker: colshapeChecker,
        }
    },
    remove(player) {
        if (!player.speedingradarObj) return;
        objeditor.destroyTempObj(player.speedingradarObj);
        player.speedingradarObj = null;
        player.speedingradar.colshape.destroy();
        player.speedingradar.colshapeChecker.destroy();
        player.speedingradar = null;
    },
    check(player, speed, speedLimit, copId) {
        if (speed > speedLimit) {
            let cop = admin.findPlayerByCharacterId(copId);
            if (cop == null) return;
            mp.events.call('mapCase.pd.fines.give', cop, JSON.stringify({
                recId: player.character.id,
                recName: player.character.name,
                cause: `Превышение скорости на ${speed - speedLimit} км/ч`,
                price: this.speedingFine
            }));
        }
    },
};