let currentFloor = null;
let floors = null;

mp.events.add({
    'elevators.inside': (current, floorArray) => {
        currentFloor = current;
        floors = floorArray;
        if (!current) mp.events.call('selectMenu.hide');
    }
});

mp.keys.bind(0x45, true, () => { /// E
    if (!currentFloor) return;
    if (mp.busy.includes()) return;
    let items = [];
    floors.forEach((floor) => {
        items.push({
            text: floor === currentFloor ? `${floor} (Вы здесь)` : floor
        });
    });
    mp.callCEFV(`selectMenu.setItems('elevatorFloors', ${JSON.stringify(items)});`)
    mp.events.call('selectMenu.show', 'elevatorFloors');
});