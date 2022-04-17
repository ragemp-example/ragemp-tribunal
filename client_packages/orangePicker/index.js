let insideTree = false;
let isPicking = false;

mp.orangePicker = {
    isInside() {
        return insideTree;
    },
    isPicking() {
        return isPicking;
    }
}

mp.events.add({
    'characterInit.done': () => {
        createPeds();
    },
    'orangePicker.tree.inside': (inside) => {
        insideTree = inside;
        if (inside) {
            mp.prompt.show('Нажмите <span>E</span> для того, чтобы сорвать апельсин');
        } else {
            mp.prompt.hide();
        }
    },
    'orangePicker.sell.inside': (price) => {
        if (!price) return mp.callCEFV(`selectMenu.show = false`);

        mp.callCEFV(`selectMenu.menus['orangePickerSell'].init(${price})`);
        mp.callCEFV(`selectMenu.showByName('orangePickerSell')`);
    },
    'orangePicker.picking.state': (state) => {
        isPicking = state;
    }
});

function createPeds() {
    [
        {
            model: "ig_old_man1a",
            position: {
                x: 2439.903076171875,
                y: 4651.26904296875,
                z: 32.69572830200195
            },
            heading: 320.8109130859375,
        },
        {
            model: "a_m_o_soucent_03",
            position: {
                x: 1221.8079833984375,
                y: -3005.345703125,
                z:5.8653564453125
            },
            heading: 96.65777587890625,
        },
    ].forEach(x => mp.events.call('NPC.create', x));
}

mp.keys.bind(0x45, true, () => { /// E
    if (!insideTree) return;
    if (mp.busy.includes()) return;
    if (mp.players.local.isJumping()) return mp.notify.warning('Нельзя собирать апельсины в прыжке');
    insideTree = false;
    mp.events.callRemote('orangePicker.pick');
    mp.prompt.hide();
});
