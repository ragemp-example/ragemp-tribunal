let inventory = call('inventory');
let notify = call('notifications');
let utils = call('utils');
let jobs = call('jobs');

module.exports = {
    constructionPos: new mp.Vector3(-510.4581298828125, -1001.6305541992188, 23.550525665283203 - 1),
    storagePos: new mp.Vector3(-503.84027099609375, -928.8458862304688, 24.479595184326172 - 1),
    destinations: [
        new mp.Vector3(-470.97589111328125, -866.0007934570312, 23.964038848876953),
        new mp.Vector3(-444.9719543457031, -862.4215087890625, 25.898115158081055),
        new mp.Vector3(-466.9960632324219, -899.710205078125, 29.39282989501953),
        new mp.Vector3(-443.4554443359375, -966.9302368164062, 25.90326499938965),
        new mp.Vector3(-435.0010070800781, -1010.7155151367188, 25.89981460571289),
        new mp.Vector3(-434.5411071777344, -1017.3577270507812, 25.89808464050293),
        new mp.Vector3(-445.92718505859375, -1074.3037109375, 23.617738723754883),
        new mp.Vector3(-495.6345520019531, -1062.8223876953125, 23.550498962402344),
        new mp.Vector3(-487.76715087890625, -1039.353271484375, 29.131715774536133),
        new mp.Vector3(-468.1754150390625, -957.2962036132812, 38.68375778198242),
    ],
    clothes: {
        0: [{
            type: 'clothes',
            params: [4, 90, 2]
        },
        {
            type: 'clothes',
            params: [11, 56, 0]
        },
        {
            type: 'clothes',
            params: [3, 30, 0]
        },
        {
            type: 'clothes',
            params: [6, 27, 0]
        },
        {
            type: 'prop',
            params: [0, 145, 1]
        },
        ],
        1: [{
            type: 'clothes',
            params: [4, 93, 2]
        },
        {
            type: 'clothes',
            params: [11, 49, 0]
        },
        {
            type: 'clothes',
            params: [3, 44, 0]
        },
        {
            type: 'clothes',
            params: [6, 29, 0]
        },
        {
            type: 'prop',
            params: [0, 144, 1]
        },
        ],
    },
    exp: 0.05,
    pay: 5,
    init() {
        this.createConstruction();
    },
    createConstruction() {
        let pos = this.constructionPos;

        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
        colshape.onEnter = (player) => {
            let isBuilder = player.isBuilder;
            player.call('builder.menu.show', [true, isBuilder]);
        };
        colshape.onExit = (player) => {
            player.call('builder.menu.show', [false]);
        };

        mp.markers.new(1, pos, 0.5, {
            color: [54, 184, 255, 70]
        });

        mp.blips.new(566, pos, {
            color: 47,
            name: `Стройка`,
            shortRange: 10,
            scale: 1
        });
    },
    startWork(player) {
        player.isBuilder = true;
        this.setWorkClothes(player);
        notify.success(player, 'Вы начали рабочий день', 'Стройка');
    },
    stopWork(player) {
        if (!player.isBuilder) return;
        player.isBuilder = false;
        this.removeWorkClothes(player);
        player.call('builder.work.stop');
        if (player.builderPropIndex) {
            this.removeProp(player)
        }
        notify.warning(player, 'Рабочий день окончен', 'Стройка');
    },
    setWorkClothes(player) {
        inventory.clearAllView(player);
        player.inventory.denyUpdateView = true;

        let gender = player.character.gender;
        let clothes = this.clothes[gender];
        clothes.forEach(x => {
            let params = x.params;
            if (x.type == 'clothes') {
                player.setClothes(params[0], params[1], params[2], 0);
            } else {
                player.setProp(params[0], params[1], params[2]);
            }
        });
    },
    removeWorkClothes(player) {
        player.inventory.denyUpdateView = false;
        inventory.clearAllView(player);
        inventory.updateAllView(player);
    },
    sendToStorage(player) {
        notify.info(player, 'Отправляйтесь на склад', 'Стройка');
        player.call('builder.storage.create', [this.storagePos]);
    },
    addProp(player) {
        let index = utils.randomInteger(1, 3);
        player.addAttachment('buildingProp' + index);
        player.builderPropIndex = index;
    },
    removeProp(player) {
        player.addAttachment('buildingProp' + player.builderPropIndex, true);
    },
    setDestination(player) {
        this.addProp(player);
        let destination;
        if (player.lostBuilderProp) {
            destination = player.lastBuilderDestination;
        } else {
            let index = utils.randomInteger(0, this.destinations.length - 1);
            destination = this.destinations[index];
            player.lastBuilderDestination = destination;
        }
        player.call('builder.destination.create', [destination]);
        notify.info(player, 'Отнесите груз на точку', 'Стройка');
    },
    calculateBonus(player) {
        let skill = jobs.getJobSkill(player, 1).exp;
        return parseInt(this.pay * 0.5 * skill / 100);
    }
}