let currentParkingId;
let blipsInfo = [];
let blips = [];

mp.events.add('parkings.menu.show', (parkingId) => {
    currentParkingId = parkingId;
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["parkingMenu"])`);
    mp.callCEFV(`selectMenu.show = true`);
});

mp.events.add('parkings.menu.close', () => {
    mp.callCEFV(`selectMenu.show = false`);
});

mp.events.add('parkings.vehicle.get', () => {
    mp.events.callRemote('parkings.vehicle.get', currentParkingId);
});

mp.events.add('parkings.blips.init', (data) => {
    if (blipsInfo.length > 0) return;
    blipsInfo = data;
    data.forEach((blip) => {
        createBlip(blip);
    });
});

mp.events.add('parkings.blips.private.set', (id) => {
    let oldIndex = blips.findIndex(x => x.data.id == id);
    let old = blips[oldIndex];
    let blip = mp.blips.new(267, new mp.Vector3(old.data.x, old.data.y, old.data.z),
        {
            name: "Подземная парковка",
            shortRange: true,
            color: 74
        });
    blip.data = old.data;
    blip.isPrivate = true;
    blips.splice(oldIndex, 1);
    blips.push(blip);
    if (old) old.destroy();
});

mp.events.add('parkings.blips.private.clear', () => {
    let oldIndex = blips.findIndex(x => x.isPrivate);
    let old = blips[oldIndex];
    if (!old) return;
    let blip = mp.blips.new(267, new mp.Vector3(old.data.x, old.data.y, old.data.z),
        {
            name: "Подземная парковка",
            shortRange: true
        });
    blip.data = old.data;
    blips.splice(oldIndex, 1);
    blips.push(blip);
    if (old) old.destroy();
})

function createBlip(data) {
    let blip = mp.blips.new(267, new mp.Vector3(data.x, data.y, data.z),
        {
            name: "Подземная парковка",
            shortRange: true,
        });
    blip.data = data;
    blips.push(blip);
}