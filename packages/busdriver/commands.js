let bus = require('./index');

module.exports = {
    "/bus": {
        description: "Телепорт к автостанции",
        access: 6,
        args: "",
        handler: (player, args) => {
            player.position = new mp.Vector3(432.8280944824219, -645.812255859375, 28.725753784179688);
        }
    },
    "/addstop": {
        description: "Добавить автобусную остановку",
        access: 5,
        args: "[название]",
        handler: async (player, args) => {
            let data = await db.Models.BusStop.create({
                x: player.position.x,
                y: player.position.y,
                z: player.position.z + 2,
                name: args.join(' ')
            });
            bus.createBusStop(data);
            player.call('chat.message.push', [`!{#ffffff}Создана остановка с ID: ${data.id}`]);
        },
    },
    "/delstop": {
        description: "Удалить автобусную остановку",
        access: 5,
        args: "[ID]",
        handler: async (player, args) => {
            let id = parseInt(args[0]);
            if (isNaN(id)) return;
            await db.Models.BusStop.destroy({
                where: {
                    id: id
                }
            })
            mp.labels.forEach((current) => {
                if (current.busStopId == id) {
                    current.destroy();
                }
            })
        },
    },
    "/rc": {
        description: "Редактор маршрутов",
        access: 5,
        args: "",
        handler: (player, args) => {
            player.call('routecreator.show');
        },
    }
}