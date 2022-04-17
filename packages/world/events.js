let terminal = call('terminal');
let notifs = call('notifications');
let world = call('world');

module.exports = {
    "init": async () => {
        await world.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        player.call(`world.doors.init`, [world.doors]);
    },
    // "world.doors.create": (player, hash, pos) => {
    //     if (typeof pos == 'string') pos = JSON.parse(pos);
    //     if (!pos) return notifs.error(player, `Неверная позиция`);
    //     var oldDoor = world.getDoor(hash, pos);
    //     if (oldDoor) return notifs.error(player, `Дверь здесь уже создана`);
    //     world.createDoor(hash, pos);
    //     notifs.success(player, `Дверь создана`);
    // },
    // "world.doors.set": (player, id, locked) => {
    //     world.setDoorLocked(id, locked);
    // },
    "world.objects.add": (player, data) => {
        data = JSON.parse(data);
        world.addObject(data);
        terminal.info(`${player.name} добавил объект мира типа ${data.type}`);
    },
    "world.objects.position.set": (player, data) => {
        data = JSON.parse(data);
        world.setObjectPos(data);
        terminal.info(`${player.name} изменил позицию объекта мира #${data.id}`);
    },
}
