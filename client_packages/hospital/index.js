let isInHealingShape = false;

mp.events.add({
    'characterInit.done': () => {
        createPed();
    },
    'hospital.healing.enter': (enter, price) => {
        isInHealingShape = enter;
        if (enter) {
            mp.prompt.show(`Нажмите <span>E</span> для того, чтобы вылечиться за $${price}`);
        } else {
            mp.prompt.hide();
        }
    }
})

function createPed() {
    mp.events.call('NPC.create', {
        model: "s_m_m_paramedic_01",
        position: {
            x: 308.9210205078125,
            y: -594.1929321289062,
            z: 43.28398132324219
        },
        heading: 42.83399200439453
    });
}

mp.keys.bind(0x45, true, () => { /// E
    if (!isInHealingShape) return;
    if (mp.busy.includes()) return;
    isInHealingShape = false;
    mp.events.callRemote('hospital.healing.heal');
    mp.prompt.hide();
});