let money;
let notifs;

const doctor = {
    x: 355.9098205566406,
    y: -573.7312622070312,
    z: 28.898839950561523,
    marker: {
        x: 355.2477,
        y: -572.7957,
        z: 27.7127,
        color: [255, 255, 125, 200]
    }
};

module.exports = {
    healthDecreased: 10,
    narcotismDecreasedPerSession: 10,
    sessionPrice: 300,
    init() {
        money = call('money');
        notifs = call('notifications');
        this.create();

        inited(__dirname)
    },
    create() {
        mp.blips.new(140, new mp.Vector3(doctor.x, doctor.y, doctor.z),
            {
                name: `Лечение наркозависимости`,
                shortRange: true,
                color: 75
            });
        mp.markers.new(1, new mp.Vector3(doctor.marker.x, doctor.marker.y, doctor.marker.z), 0.4,
            {
                direction: new mp.Vector3(doctor.marker.x, doctor.marker.y, doctor.marker.z),
                rotation: 0,
                color: doctor.marker.color,
                visible: true,
                dimension: 0
            });
        const shape = mp.colshapes.newSphere(doctor.marker.x, doctor.marker.y, doctor.marker.z + 1, 1.2);
        shape.pos = new mp.Vector3(doctor.marker.x, doctor.marker.y, doctor.marker.z);
        shape.isNarcotismDoctor = true;
    },
    treated(player) {
        if (player.character.cash < this.sessionPrice) return player.call('narcotism.treated.ans', [2]);
        if (!player.character.narcotism) return player.call('narcotism.treated.ans', [4]);
        if (player.character.lastNarcotismSession && (Date.now() - player.character.lastNarcotismSession) < 3600000)
            return player.call('narcotism.treated.ans', [3]);

        money.removeCash(player, this.sessionPrice, async (result) => {
            if (result) {
                player.character.narcotism = Math.clamp(player.character.narcotism - this.narcotismDecreasedPerSession, 0, Number.MAX_SAFE_INTEGER);
                await player.character.save();
                player.character.lastNarcotismSession = Date.now();
                mp.events.call("player.narcotism.changed", player);
                player.call('narcotism.treated.ans', [1]);
                notifs.success(player, 'Вы прошли сеанс излечения от наркозависимости');
                notifs.info(player, `До полного излечения: ${Math.round(player.character.narcotism / this.narcotismDecreasedPerSession)} сеансов`);
            } else {
                player.call('narcotism.treated.ans', [0]);
            }
        }, `Narcotism session by player with id ${player.id}`);
    },
    withdrawal(player) {
        player.health = Math.clamp(player.health - this.healthDecreased, 10, 100);
        // mp.events.call('animations.playById', player, 8306);
        player.call('effect', ['DrugsDrivingOut', 10000]);
        notifs.info(player, 'У вас ломка. Обратитесь к врачу, чтобы начать лечение');
    }
};