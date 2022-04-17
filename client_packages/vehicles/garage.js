let isInGarageVehicle = false;

mp.events.add('vehicles.garage', (state) => {
    isInGarageVehicle = state;
    if (state) mp.prompt.showByName('garage_control');
});

mp.keys.bind(0x45, true, () => { /// E
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    if (!isInGarageVehicle) return;
    isInGarageVehicle = false;
    mp.prompt.hide();
    mp.events.callRemote('vehicles.garage.leave');
});