const animDict = 'amb@prop_human_seat_chair_mp@male@generic@base';
const animName = 'base';
const removalOffset = 1;
const drawDistance = 30;
let insideSeatShape = false;
let showSeats = false;

mp.events.add({
    'entityStreamIn': (entity) => {
        if (entity.type !== 'player') return;
        let seatInfo = entity.getVariable('seatInfo') || false;
        if (seatInfo) {
            placeIntoSeat(entity, seatInfo);
        }
    },
    'seats.inside': (inside) => {
        insideSeatShape = inside;
        if (inside) {
            mp.prompt.show('Нажмите <span>O</span> для того, чтобы сесть');
        } else {
            mp.prompt.hide();
            if (mp.players.local.getVariable('seatInfo'))  {
                mp.prompt.show('Нажмите <span>O</span> для того, чтобы встать');
            }
        }
    },
    'render': () => {
        if (!showSeats) return;
        mp.colshapes.forEach(entity => {
            let seatId = entity.getVariable('seatId');
            if (!seatId) return;
            let pos = entity.getVariable('seatPos');
            if (mp.vdist(pos, mp.players.local.position) > drawDistance) return;
            mp.game.graphics.drawText(`SEAT #${seatId}`,
                [pos.x, pos.y, pos.z], {
                    font: 0,
                    color: [3, 252, 111, 200],
                    scale: [0.23, 0.23],
                    outline: true
                });
        });
    },
    'seats.show': (show) => {
        showSeats = show;
    }
})

mp.events.addDataHandler('seatInfo', (entity, value) => {
    let isSitting = !!value;
    if (isSitting) {
        placeIntoSeat(entity, value);
    } else {
        removeFromSeat(entity);
    }
});

mp.keys.bind(0x4F, true, () => { /// O
    if (insideSeatShape) {
        if (mp.busy.includes()) return;
        if (mp.players.local.isJumping()) return mp.notify.warning('Нельзя сесть в прыжке');
        insideSeatShape = false;
        mp.events.callRemote('seats.occupy');
        mp.prompt.hide();
    } else if (mp.players.local.getVariable('seatInfo')) {
        mp.prompt.hide();
        mp.events.callRemote('seats.leave');
    }
});

function placeIntoSeat(player, info) {
    if (!player) return;
    let { pos, rot, offset } = info;
    mp.game.streaming.requestAnimDict(animDict);
    player.freezePosition(true);
    player.position = new mp.Vector3(pos.x, pos.y, pos.z - offset);
    player.setHeading(rot);
    player.taskPlayAnim(animDict, animName, 4.0, 0, -1, 47, 1.0, false, false, false);
    if (player === mp.players.local) mp.prompt.show('Нажмите <span>O</span> для того, чтобы встать');
}

function removeFromSeat(player) {
    player.freezePosition(false);
    player.stopAnimTask(animDict, animName, 3);
    player.position = new mp.Vector3(player.position.x, player.position.y, player.position.z + removalOffset);
}