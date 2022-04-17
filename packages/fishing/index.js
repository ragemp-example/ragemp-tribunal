let money;
let notifs;
let inventory;
let jobs;

const ROD_ID = 5;

const port = {
    x: -167.7662,
    y: -2687.0261,
    z: 6.0107,
};

module.exports = {
    init() {
        money = call('money');
        notifs = call('notifications');
        inventory = call('inventory');
        jobs = call('jobs');
        this.initFishersFromDB();
        this.initFishesFromDB();
        this.createPortPoint();
    },

    rodPrice: 100,

    fishes: [],

    fishers: [],

    colshapes: [],

    portPriceMultiplier: 1.5,
    exp: 0.05,
    // Прибавка к цене предмета в % (0.0-1.0) при фулл скилле
    priceBonus: 0.5,

    getRodId() {
        return ROD_ID;
    },

    async initFishesFromDB() {
        this.fishes = await db.Models.Fish.findAll();
    },

    async initFishersFromDB() {
        this.fishers = await db.Models.Fisher.findAll({
            raw: true
        });

        this.fishers.forEach(fisher => {
            let colshape = this.createFisherColshape(fisher);
            this.colshapes.push(colshape);
            this.createMarker(fisher);
            this.createBlip(fisher);
        });

        // mp.players.forEach(player => {
        //     player.call('fishing.fishers.init', [fishers]);
        // })
    },

    createFisherColshape(fisher) {
        let pos = new mp.Vector3(fisher.x, fisher.y, fisher.z);
        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 2);

        colshape.isFisher = true;

        return colshape;
    },

    createMarker(fisher) {
        let heading = fisher.heading + 90;

        let markerX = fisher.x + 0.8 * Math.cos(heading * Math.PI / 180.0);
        let markerY = fisher.y + 0.8 * Math.sin(heading * Math.PI / 180.0);

        mp.markers.new(1, new mp.Vector3(markerX, markerY, fisher.z - 1.2), 0.4, {
            direction: new mp.Vector3(markerX, markerY, fisher.z),
            rotation: 0,
            color: [255, 255, 125, 200],
            visible: true,
            dimension: 0
        });
    },

    createBlip(blip) {
        mp.blips.new(68, new mp.Vector3(blip.x, blip.y, blip.z), {
            name: 'Рыбалка',
            shortRange: true,
            color: 26
        });
    },

    createPortPoint() {
        mp.blips.new(108, new mp.Vector3(port.x, port.y, port.z),
            {
                name: `Сбыт рыбы`,
                shortRange: true,
                color: 26
            });
        mp.markers.new(1, new mp.Vector3(port.x, port.y, port.z - 1), 0.4,
            {
                direction: new mp.Vector3(port.x, port.y, port.z - 1),
                rotation: 0,
                color: [255, 255, 125, 200],
                visible: true,
                dimension: 0
            });
        const shape = mp.colshapes.newSphere(port.x, port.y, port.z, 2);
        shape.pos = new mp.Vector3(port.x, port.y, port.z);
        shape.isFishPortSell = true;
    },

    async buyRod(player) {

        if (player.character.cash < this.rodPrice) {
            return player.call('fishing.rod.buy.ans', [3]);
        }

        inventory.addItem(player, ROD_ID, { health: 100 }, (e) => {
            if (e) return player.call('fishing.rod.buy.ans', [2, e]);

            money.removeCash(player, this.rodPrice, (result) => {
                if (result) {
                    player.call('fishing.rod.buy.ans', [1]);
                    notifs.success(player, "Удочка добавлена в инвентарь", "Рыбалка");
                } else {
                    player.call('fishing.rod.buy.ans', [0]);
                }
            }, `Buy fishing rod by player with id ${player.id}`);
        });
    },

    async sellFish(player, isPort) {
        let fishes = inventory.getArrayByItemId(player, 15);
        let sum = 0;

        if (fishes && fishes.length > 0) {
            fishes.forEach(fish => {
                let fishName = inventory.getParam(fish, 'name').value;
                let fishWeight = inventory.getParam(fish, 'weight').value;
                let fishPrice = this.fishes.find(fish => fish.name == fishName).price;
                sum += fishPrice * fishWeight * 10;
            });

            sum = isPort ? parseInt(this.portPriceMultiplier * sum) : parseInt(sum);
            const exp = jobs.getJobSkill(player, 10).exp;
            sum *= (1 + this.priceBonus * (exp / 100));
            sum = parseInt(sum);

            money.addCash(player, sum * jobs.bonusPay, async function (result) {
                if (result) {
                    fishes.forEach(fish => inventory.deleteItem(player, fish.id));
                    player.call('fishing.fish.sell.ans', [1]);
                    return notifs.success(player, `Вы продали рыбы на ${sum}$`, 'Продажа')
                } else {
                    player.call('fishing.fish.sell.ans', [0]);
                    return notifs.error(player, 'Ошибка', 'Продажа');
                }
            }, `Sell fish by player with id ${player.id} x${jobs.bonusPay}`)
        } else {
            player.call('fishing.fish.sell.ans', [0]);
            return notifs.error(player, 'У вас нет рыбы', 'Ошибка');
        }
    },

    getFisherPosition(id) {
        let fisher = this.fishers.find(fisher => fisher.id == id);

        if (fisher) {
            return {
                x: fisher.x,
                y: fisher.y,
                z: fisher.z
            };
        }
    },
    addJobExp(player) {
        var skill = jobs.getJobSkill(player, 10);
        jobs.setJobExp(player, skill, skill.exp + this.exp);
    },
}