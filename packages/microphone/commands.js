let microphone = require('./index');
let notifs = call("notifications");

module.exports = {
    "/microphoneadd": {
        description: "Создать микрофон",
        args: "",
        access: 5,
        handler: async (player, args) => {
            await microphone.create(player);
        }
    },
    "/microphoneremove": {
        description: "Удалить микрофон",
        args: "",
        access: 5,
        handler: async (player, args) => {
            let result = await microphone.remove(player);
            if (result) {
                notifs.info(player, "Микрофон удален", "Удаление микрофона");
            } else {
                notifs.info(player, "Вы не находитесь рядом с микрофоном", "Удаление микрофона");
            }
        }
    },
};