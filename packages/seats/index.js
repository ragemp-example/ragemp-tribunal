const notify = call('notifications');

module.exports = {
    seatObjects: [],
    async init() {
        await this.loadSeats();
    },
    async loadSeats() {
        this.seatObjects = await db.Models.Seat.findAll();
        for (let i = 0; i < this.seatObjects.length; i++) {
            this.seatObjects[i].shape = this.createSeat(this.seatObjects[i]);
        }
        console.log(`[SEATS] Загружены сидения: ${this.seatObjects.length} шт.`)
    },
    createSeat(data) {
        let { id, x, y, z, dimension } = data;
        let colshape = mp.colshapes.newSphere(x, y, z, 1);
        colshape.dimension = dimension;
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            player.call('seats.inside', [true]);
            player.seatId = id;
        };
        colshape.onExit = (player) => {
            player.call('seats.inside', [false]);
            if (!player.getVariable('seatInfo')) {
                player.seatId = null;
            }
        };
        colshape.setVariable('seatId', id);
        colshape.setVariable('seatPos', {x: x, y: y, z: z});
        return colshape;
    },
    occupySeat(player, seatId) {
        let seat = this.seatObjects.find(x => x.id === seatId);
        if (!seat) return notify.error(player, 'Место не найдено');
        if (seat.currentPlayer && mp.players.exists(seat.currentPlayer)) {
            notify.error(player, 'Место уже занято');
        } else {
            seat.currentPlayer = player;
            player.setVariable('seatInfo', { pos: new mp.Vector3(seat.x, seat.y, seat.z), rot: seat.rot, offset: seat.offset });
            notify.info(player, 'Вы заняли место');
        }
    },
    leaveSeat(player, seatId) {
        let seat = this.seatObjects.find(x => x.id === seatId);
        if (!seat.currentPlayer) return;
        seat.currentPlayer = null;
        player.setVariable('seatInfo', null);
        notify.info(player, 'Вы освободили место');
    },
    async saveSeat(x, y, z, rot, offset, dimension) {
        let seat = await db.Models.Seat.create({ x: x, y: y, z: z, offset: offset, rot: rot, dimension: dimension});
        seat.shape = this.createSeat(seat);
        this.seatObjects.push(seat);
    },
    removeSeat(player, seatId) {
        let seatIndex = this.seatObjects.findIndex(x => x.id === seatId);
        let seat = this.seatObjects[seatIndex];
        if (!seat) return notify.error(player, 'Место с таким ID не найдено');
        seat.shape.destroy();
        seat.destroy();
        this.seatObjects.splice(seatIndex, 1);
        notify.success(player, 'Место удалено');
    }
}