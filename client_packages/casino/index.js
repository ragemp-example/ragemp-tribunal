let luckywheel = require('casino/luckywheel');
let slotmachines = require('casino/slotmachines');

let isInCasinoArea = false;

let peds = [{
    model: "S_F_Y_Casino_01",
    position: {
        x: 1117.347900390625,
        y: 220.00143432617188,
        z: -49.43511962890625,
        d: 1
    },
    heading: 83.14864349365234,
},
{
    model: "U_F_M_CasinoShop_01",
    position: {
        x: 1117.5516357421875,
        y: 221.25894165039062,
        z: -49.43511962890625,
        d: 1
    },
    heading: 65.33145904541016,
},
{
    model: "U_F_M_CasinoCash_01",
    position: {
        x: 1117.6053466796875,
        y: 218.67056274414062,
        z: -49.43511962890625,
        d: 1
    },
    heading: 108.19071960449219,
},
];


let cashierMarkers = [
    [1116.3602294921875, 221.7566375732422, -49.43516159057617],
    [1115.998046875, 220.13014221191406, -49.43516159057617],
    [1116.4232177734375, 218.1571807861328, -49.43516159057617]
];

cashierMarkers.forEach(x => {
    mp.markers.new(1, new mp.Vector3(x[0], x[1], x[2] - 1.15), 0.4,
        {
            color: [71, 145, 255, 140],
            visible: true,
            dimension: 1
        });
});

mp.events.add({
    "casino.area.enter": (enter) => {
        isInCasinoArea = enter;
        if (enter) {
            let items = [{
                text: `Бросить кости`,
                icon: `dice.svg`
            }];
            mp.callCEFV(`interactionMenu.addItems('player_interaction', ${JSON.stringify(items)})`);
            removeUnnecessaryObjects();
        } else {
            mp.callCEFV(`interactionMenu.deleteItem('player_interaction', 'Бросить кости'`);
        }
    },
    "casino.dice.offer.create": () => {
        let entity = mp.getCurrentInteractionEntity();
        if (!entity || entity.type != 'player') return;
        mp.callCEFV(`inputWindow.name = 'dice';
        inputWindow.header = "Игра в кости (ID: ${entity.remoteId})";
        inputWindow.hint = "Введите кол-во фишек";
        inputWindow.inputHint = "Сумма игры...";
        inputWindow.value = "";
        inputWindow.show = true;
        inputWindow.playerId = ${entity.remoteId}
        `);
    },
    "casino.dice.text.show": (data) => {
        data = JSON.parse(data);
        data.senderName = mp.chat.correctName(data.senderName);
        data.targetName = mp.chat.correctName(data.targetName);
        mp.events.call('chat.message.push',
            `!{#dd90ff}${data.senderName}[${data.senderId}] и ${data.targetName}[${data.targetId}] бросили кости. Результат: !{#fff5a6}${data.senderCount}:${data.targetCount}`);
    },
    "characterInit.done": () => {
        peds.forEach((current) => {
            mp.events.call('NPC.create', current);
        })
    },
    "casino.cashier.show": (show) => {
        if (show) {
            mp.events.call('selectMenu.show', 'casinoCashier');
        } else {
            mp.callCEFV(`selectMenu.show = false`);
        }
    },
    'casino.prizes.show': (prizes) => {
        let items = [];
        prizes.forEach((prize) => {
            items.push({
                text: prize
            });
        });
        items.push({ text: 'Закрыть' });
        mp.callCEFV(`selectMenu.setItems('casinoPrizes', ${JSON.stringify(items)});`)
        mp.events.call('selectMenu.show', 'casinoPrizes');
    },
    'casino.prizes.use': (index) => {
        mp.events.callRemote('casino.prizes.use', index);
    },
    'casino.chips.menu.show': (type, price) => {
        let items = [{
            text: `Цена ${type === 'buy' ? 'покупки' : 'продажи'}`,
            values: [`$${price} за 1 шт.`]
        },
        {
            text: 'Введите количество',
            values: [''],
            type: 'editable'
        },
        {
            text: type === 'buy' ? 'Купить' : 'Продать'
        },
        {
            text: 'Закрыть'
        }]
        mp.callCEFV(`selectMenu.setItems('casinoChips', ${JSON.stringify(items)});`)
        mp.events.call('selectMenu.show', 'casinoChips');
    }
});


function removeUnnecessaryObjects() {
    ['vw_prop_casino_stool_02a', 'vw_prop_casino_3cardpoker_01',
        'vw_prop_casino_3cardpoker_01b', 'vw_prop_casino_blckjack_01',
        'vw_prop_casino_blckjack_01b', 'vw_prop_casino_roulette_01',
        'vw_prop_casino_roulette_01b'].forEach(name => {
            mp.game.entity.createModelHide(mp.players.local.position.x, mp.players.local.position.y,
                mp.players.local.position.z, 150, mp.game.joaat(name), true);
        });
}