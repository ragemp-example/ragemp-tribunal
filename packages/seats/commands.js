let seats = require('./index');
let notify = call('notifications');

module.exports = {
    "/testseat": {
        description: "Включить/отключить тестовый режим сидения",
        access: 5,
        args: "[offset]:n",
        handler: (player, args, out) => {
            if (!player.isSitting) {
                player.setVariable('seatInfo', { pos: player.position, rot: player.heading, offset: args[0] });
                player.isSitting = true;
                player.seatOffset = args[0];
                out.info(`Вы сели со смещением ${args[0]}`, player);
            } else {
                player.setVariable('seatInfo', null);
                player.isSitting = false;
                out.info('Вы встали', player);
            }
        }
    },
    "/saveseat": {
        description: "Сохранить место для сидения",
        access: 5,
        args: "",
        handler: async (player, args, out) => {
            if (!player.isSitting) return out.error(`Вы не заняли место`, player);;
            const offset = player.seatOffset;
            await seats.saveSeat(player.position.x, player.position.y, player.position.z + offset, player.heading, offset, player.dimension);
            notify.success(player, 'Место для сидения создано');
            player.setVariable('seatInfo', null);
            player.isSitting = false;
        }
    },
    "/showseats": {
        description: "Включить/отключить отображение сидений",
        access: 5,
        args: "",
        handler: (player, args, out) => {
            if (!player.showSeats) {
                player.showSeats = true;
                out.info(`Отображение ID сидений вкл.`, player);
                player.call('seats.show', [true]);
            } else {
                player.showSeats = false;
                out.info('Отображение ID сидений выкл.', player);
                player.call('seats.show', [false]);
            }
        }
    },
    "/delseat": {
        description: "Удалить место для сидения",
        access: 5,
        args: "[id]:n",
        handler: (player, args, out) => {
            seats.removeSeat(player, args[0]);
        }
    },
}