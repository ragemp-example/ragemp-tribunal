let client = require('taxi/client.js');
let driver = require('taxi/driver.js');


let peds = [{
    model: "a_m_m_prolhost_01",
    position: {
        x: 894.924560546875,
        y: -179.1186065673828,
        z: 74.70025634765625
    },
    heading: 238.2574462890625,
    defaultScenario: 'WORLD_HUMAN_STAND_MOBILE_UPRIGHT'
}
];

mp.events.add('characterInit.done', () => {
    peds.forEach((current) => {
        mp.events.call('NPC.create', current);
    })
});


mp.events.add('taxi.jobmenu.show', (state) => {
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["taxiJobMenu"])`);
    switch (state) {
        case 0:
            mp.callCEFV(`selectMenu.menu.items[0].text = 'Устроиться на работу'`);
            break;
        case 1:
            mp.callCEFV(`selectMenu.menu.items[0].text = 'Уволиться с работы'`);
            break;
    }
    mp.callCEFV(`selectMenu.show = true`);
});


mp.events.add('taxi.jobmenu.close', () => {
    mp.callCEFV(`selectMenu.show = false`);
});


mp.events.add('taxi.jobmenu.employment', () => {
    mp.events.call('taxi.jobmenu.close');
    mp.events.callRemote('taxi.employment');
});

mp.events.add('taxi.rent.show', (price) => {
    mp.callCEFV(`acceptWindow.header = 'Вы хотите арендовать такси за $${price}?';`);
    mp.callCEFV(`acceptWindow.name = 'taxi_rent';`);
    mp.callCEFV(`acceptWindow.show = true;`);
    mp.busy.add('taxi_rent', true);
});

mp.events.add('taxi.rent.close', () => {
    mp.callCEFV(`acceptWindow.show = false;`);
    mp.busy.remove('taxi_rent');
});

