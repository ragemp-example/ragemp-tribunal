const materials = require('./index');

module.exports = {
    "/mwstart": {
        access: 6,
        description: "Начать войну за материалы",
        args: "",
        handler: (player, args) => {
            materials.start();
        }
    },
    "/mwend": {
        access: 6,
        description: "Закончить войну за материалы",
        args: "",
        handler: (player, args) => {
            materials.end();
        }
    },
}