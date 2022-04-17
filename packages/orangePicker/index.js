let notify = call('notifications');
let inventory = call('inventory');
let jobs = call('jobs');
let money = call('money');
let animations = call('animations');
let timer = call('timer');

module.exports = {
    pickTimeout: 60000,
    exp: 0.02,
    orangePrice: 3,
    priceBonus: 0.5,
    plantationPos: new mp.Vector3(2440.34326171875, 4651.7646484375, 32.6902961730957 - 1),
    sellPos: new mp.Vector3(1221.004638671875, -3005.477294921875, 5.865359306335449 - 1),
    trees: [
        {
            pos: new mp.Vector3(2443.888671875, 4671.8056640625, 33.33464050292969),
        },
        {
            pos: new mp.Vector3(2434.8349609375, 4678.42919921875, 33.3737907409668),
        },
        {
            pos: new mp.Vector3(2420.21484375, 4674.26513671875, 33.8305549621582),
        },
        {
            pos: new mp.Vector3(2422.177490234375, 4686.15771484375, 33.72201919555664),
        },
        {
            pos: new mp.Vector3(2424.076171875, 4697.08935546875, 33.07291793823242),
        },
        {
            pos: new mp.Vector3(2413.06982421875, 4706.93359375, 33.00762176513672),
        },
        {
            pos: new mp.Vector3(2404.92626953125, 4703.6298828125, 33.37284469604492),
        },
        {
            pos: new mp.Vector3(2389.969482421875, 4691.6484375, 33.89961624145508),
        },
        {
            pos: new mp.Vector3(2423.837158203125, 4659.173828125, 33.485618591308594),
        },
        {
            pos: new mp.Vector3(2407.486572265625, 4676.578125, 33.9757194519043),
        },
        {
            pos: new mp.Vector3(2402.14990234375, 4688.0078125, 33.68896484375),
        },
        {
            pos: new mp.Vector3(2381.58544921875, 4700.13525390625, 33.909912109375),
        },
        {
            pos: new mp.Vector3(2402.12353515625, 4716.65673828125, 33.15338897705078),
        },
        {
            pos: new mp.Vector3(2383.552978515625, 4713.4072265625, 33.638282775878906),
        },
        {
            pos: new mp.Vector3(2386.70556640625, 4723.96923828125, 33.6566162109375),
        },
        {
            pos: new mp.Vector3(2386.671875, 4735.72607421875, 33.2503547668457),
        },
        {
            pos: new mp.Vector3(2367.19873046875, 4716.255859375, 34.293601989746094),
        },
        {
            pos: new mp.Vector3(2358.983154296875, 4723.33642578125, 34.563865661621094),
        },
        {
            pos: new mp.Vector3(2364.936767578125, 4729.18408203125, 34.176002502441406),
        },
        {
            pos: new mp.Vector3(2374.6982421875, 4734.61181640625, 33.72031021118164),
        },
        {
            pos: new mp.Vector3(2350.84912109375, 4733.73828125, 34.83156967163086),
        },
        {
            pos: new mp.Vector3(2367.12890625, 4750.82177734375, 33.86412811279297),
        },
        {
            pos: new mp.Vector3(2354.072509765625, 4760.0732421875, 34.32911682128906),
        },
        {
            pos: new mp.Vector3(2343.7373046875, 4756.21044921875, 34.81784439086914),
        },
        {
            pos: new mp.Vector3(2339.864501953125, 4741.5341796875, 35.06253433227539),
        },
        {
            pos: new mp.Vector3(2325.082763671875, 4747.04052734375, 36.0021858215332),
        },
        {
            pos: new mp.Vector3(2325.93896484375, 4761.1396484375, 35.976409912109375),
        },
        {
            pos: new mp.Vector3(2328.02978515625, 4770.54248046875, 36.032691955566406),
        },
        {
            pos: new mp.Vector3(2339.29345703125, 4766.76171875, 35.17251968383789),
        },
    ],
    init() {
        this.createPlantationMarker();
        this.createSellMarker();
        this.createTrees();
    },
    createPlantationMarker() {
        let pos = this.plantationPos;
        mp.markers.new(1, pos, 0.5, {
            color: [252, 144, 3, 120]
        });
        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
        colshape.onEnter = (player) => {
            player.call(`browserExecute`, [`modal.showByName('orangePicker_help')`]);
        };
        colshape.onExit = (player) => {
            player.call(`browserExecute`, ['modal.show = false']);
        };
        mp.blips.new(1, pos, {
            color: 47,
            name: `Апельсиновая плантация`,
            shortRange: 10,
            scale: 1
        });
    },
    createSellMarker() {
        let pos = this.sellPos;
        mp.markers.new(1, pos, 0.5, {
            color: [252, 144, 3, 120]
        });
        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
        colshape.onEnter = (player) => {
            player.call(`orangePicker.sell.inside`, [this.orangePrice]);
            player.insideOrangePickerSell = true;
        };
        colshape.onExit = (player) => {
            player.call(`orangePicker.sell.inside`);
            player.insideOrangePickerSell = false;
        };
        mp.blips.new(108, pos, {
            color: 47,
            name: `Сбыт апельсинов`,
            shortRange: 10,
            scale: 1
        });
    },
    createTrees() {
        for (let i = 0; i < this.trees.length; i++) {
            let pos = this.trees[i].pos;
            let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 2);
            colshape.onEnter = (player) => {
                if (player.vehicle) return;
                player.call('orangePicker.tree.inside', [true]);
                player.orangeTreeId = i;
            };
            colshape.onExit = (player) => {
                player.call('orangePicker.tree.inside', [false]);
                player.orangeTreeId = null;
            };
        }
    },
    pick(player, treeId) {
        let tree = this.trees[treeId];
        let now = new Date();

        if (tree.lastPickTime && now - tree.lastPickTime < this.pickTimeout)
            return notify.warning(player, 'Апельсины еще не созрели, отправляйтесь к другому дереву');

        player.call('orangePicker.picking.state', [true]);
        animations.playAnimationById(player, 551);
        timer.add(() => {
            if (!mp.players.exists(player)) return;
            animations.stopAnimation(player);
            inventory.addItem(player, 147, {satiety: 15}, (e) => {
                if (e) return notify.error(player, e);
                tree.lastPickTime = now;
                notify.success(player, 'Вы сорвали апельсин');
                jobs.addJobExp(player, this.exp, 5);
                player.call('orangePicker.picking.state', [false]);
            });
            }, 1000);
    },
    sellItems(player) {
        let header = 'Порт';
        let out = (text) => {
            notify.error(player, text, header);
        };
        if (!player.insideOrangePickerSell) return out(`Вы не у точки скупки`);

        let items = inventory.getArrayByItemId(player, 147);
        if (!items.length) return out(`Вы не имеете апельсинов`);

        let exp = jobs.getJobSkill(player, 5).exp;
        let pay = items.length * this.orangePrice;
        pay *= (1 + this.priceBonus * (exp / 100));
        money.addCash(player, pay * jobs.bonusPay, (res) => {
            if (!res) return out(`Ошибка начисления наличных`);

            items.forEach(item => inventory.deleteItem(player, item));
            notify.success(player, `Продано ${items.length} апельсинов`, header);
        }, `Продажа ${items.length} апельсинов x${jobs.bonusPay}`);
    }
}