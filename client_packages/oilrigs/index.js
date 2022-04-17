mp.events.add({
    "characterInit.done": () => {
        createPed();
    }
});

function createPed() {
    mp.events.call('NPC.create', {
        model: "a_m_m_business_01",
        position: {
            x: 2832.701904296875,
            y: 1669.2535400390625,
            z: 24.59581756591797
        },
        heading: 192.4068145751953,
        defaultScenario: 'WORLD_HUMAN_AA_SMOKE'
    });
}