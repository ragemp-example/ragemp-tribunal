let objeditor = require('./index');
let notifs = call("notifications");

module.exports = {
    // for tests
    // apa_mp_h_tab_sidelrg_04
    // p_stinger_04
    // prop_tyre_spike_01

    "/objadd": {
        description: "Создать объект",
        args: "[model]:s",
        access: 5,
        handler: async (player, args) => {
            if (!player.objeditor) {
                player.objeditor = {
                    model: args[0],
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z,
                    rotX: 0,
                    rotY: 0,
                    rotZ: 0,
                    alpha: 255,
                    dimension: player.dimension,
                };
                player.objeditor.obj = objeditor.initObj(player.objeditor,true, player);

                notifs.info(player, "WASDZX - перемещение", "Управление созданием объекта");
                notifs.info(player, "shift + WASDZX - вращение", "Управление созданием объекта");
                notifs.info(player, "Введите команду еще раз что бы подтвердить создание объекта", "Создание объекта");
            } else {
                await objeditor.create(player.objeditor);
                player.objeditor = null;

                notifs.info(player, "Объект создан", "Создание объекта");
            }
        }
    },
    "/objaddeverywhere": {
        description: "Создать объект",
        args: "[model]:s",
        access: 5,
        handler: async (player, args) => {
            if (!player.objeditor) {
                player.objeditor = {
                    model: args[0],
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z,
                    rotX: 0,
                    rotY: 0,
                    rotZ: 0,
                    alpha: 255,
                    dimension: null,
                };
                player.objeditor.obj = objeditor.initObj({
                    model: args[0],
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z,
                    rotX: 0,
                    rotY: 0,
                    rotZ: 0,
                    alpha: 255,
                    dimension: player.dimension,
                }, true, player);

                notifs.info(player, "WASDZX - перемещение", "Управление созданием объекта");
                notifs.info(player, "shift + WASDZX - вращение", "Управление созданием объекта");
                notifs.info(player, "Введите команду еще раз что бы подтвердить создание объекта во всех измерениях", "Создание объекта");
            } else {
                await objeditor.create(player.objeditor);
                player.objeditor = null;

                notifs.info(player, "Объект создан во всех измерениях", "Создание объекта");
            }
        }
    },
    "/objremove": {
        description: "Удалить объект",
        args: "[id]:n",
        access: 5,
        handler: async (player, args) => {
            let result = await objeditor.remove(args[0]);
            if (result) {
                notifs.info(player, "Объект удален", "Удаление объекта");
            } else {
                notifs.info(player, "Объекта с таким id не существует", "Удаление объекта");
            }
        }
    },
    "/objshow": {
        description: "Показать id объектов",
        args: "",
        access: 5,
        handler: async (player, args) => {
            objeditor.showObjects(player);
        }
    },
    "/objhide": {
        description: "Скрыть id объектов",
        args: "",
        access: 5,
        handler: async (player, args) => {
            objeditor.hideObjects(player);
        }
    },
    "/gotoobj": {
        description: "Перейти к объекту",
        args: "[id]:n",
        access: 5,
        handler: async (player, args) => {
            objeditor.goto(player, args[0]);
        }
    },
};