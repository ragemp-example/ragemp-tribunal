let seats = require('./index');
let notify = call('notifications');

module.exports = {
    'init': () => {
        seats.init();
        inited(__dirname);
    },
    'seats.occupy': (player) => {
        if (!player.character) return;
        let seatId = player.seatId;
        if (!seatId) return notify.error(player, 'Вы не находитесь рядом с сидением');
        seats.occupySeat(player, seatId);
    },
    'seats.leave': (player) => {
        if (!player.character) return;
        let seatId = player.seatId;
        if (!seatId) return notify.error(player, 'Вы не занимаете сидение');
        seats.leaveSeat(player, seatId);
    },
}