let factions;
let timer;
let notify;
let vehicles;
let prompt;

const utils = require('../utils');

const startPoint = {
    x: 2937.428955078125,
    y: 319.94866943359375,
    z: 1.1060378551483154,
    // x: 1365.882080078125,
    // y: 1139.4222412109375,
    // z: 113.75904846191406
}

const materialsPoint = {
    x: 2784.89111328125,
    y: -1539.50634765625,
    z: 1.235637903213501,
    // x: 1375.3948974609375,
    // y: 1147.1817626953125,
    // z: 113.90577697753906
}

const trucksPoint = {
    x: -1204.5084228515625,
    y: -2052.91064453125,
    z: 13.924748420715332,
    // x: 1367.46240234375,
    // y: 1151.6317138671875,
    // z: 113.75896453857422
}

module.exports = {
    // количество лодок
    countBoats: 5,
    // количество грузовиков
    countTrucks: 5,
    vehicleMaxBox: 5,
    // время до появления лодок
    startTime: 1000*10,
    // спавн материалов
    materialsSpawnTime: 1000*60,
    // колчисетво материалов в единицу времени
    // materialsInBox: 100,
    maxBoxCount: 10,
    storage: {},

    timers: {},

    results: {},

    players: new Set(),

    init() {
        factions = call('factions');
        timer = call('timer');
        notify = call('notifications');
        vehicles = call('vehicles');
        prompt = call('prompt');

        inited(__dirname);
    },
    // начало войны
    start() {
        this.end();
        this.sendNotifications('Объявлена война за материалы');
        this.sendNotifications(`До появления лодок: ${this.startTime / 1000} сек.`);
        this.showTimer(true);

        mp.players.forEach(p => {
            if (!p.character) return;
            if (!factions.isCrimeFaction(p.character.factionId)) return;
            this.createBlipClient(p, startPoint, 'boats');
        })

        this.timers.boatsTimer = timer.add(async () => {
            this.showTimer(false);
            await this.spawnBoats();
            await this.spawnTrucks();
            this.createMaterialsPoint();
            this.storage.boxes = 0;
            this.storage.createdBoxes = 0;
            this.timers.materialsInterval = timer.addInterval(() => {
                this.timers.boxInterval && timer.remove(this.timers.boxInterval);
                this.timers.boxInterval = null;

                if (this.storage.createdBoxes >= this.maxBoxCount) {
                    timer.remove(this.timers.materialsInterval);
                    this.timers.materialsInterval = null;

                    this.updateLabel();

                    this.timers.boxInterval && timer.remove(this.timers.boxInterval);
                    this.timers.boxInterval = null;

                    return;
                }

                let i = 1;
                this.timers.boxInterval = timer.addInterval(() => {
                    this.updateLabel((this.materialsSpawnTime / 1000) - i);
                    i++;
                }, 1000);

                this.setMaterials(this.storage.boxes + 1);
                this.storage.createdBoxes += 1;
            }, this.materialsSpawnTime);
        }, this.startTime);
    },
    // конец войны
    end() {
        this.clearTimers();
        this.storage.boxes = null;
        this.players = new Set();
        this.destroyVehicles();
        this.destroyMaterialsPoint();
        mp.players.forEach(p => {
            if (!p.character) return;
            if (!factions.isCrimeFaction(p.character.factionId)) return;
            p.call('materialWar.blip.boats.destroy');
            p.call('materialWar.blip.materials.destroy');
            p.call('materialWar.blip.trucks.destroy');
            p.call('materialWar.blip.faction.destroy');
            p.call('materialWar.timer.show', [false]);
        });

        const sortable = Object.entries(this.results)
            .sort(([,a],[,b]) => b-a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        if (Object.keys(sortable).length === 0) return this.sendNotifications('Победитель не выявлен');

        this.sendNotifications(`Победили ${Object.keys(sortable)[0]}. Они захватили ${Object.values(sortable)[0]} ящиков с материалами`)
    },
    async spawnBoats() {
        for (let i = 0; i < this.countBoats; i++) {
            let color = utils.randomInteger(1, 158);
            let veh = {
                modelName: 'dinghy2',
                x: startPoint.x + 1*i,
                y: startPoint.y + 4*i,
                z: startPoint.z + 1,
                h: 90,
                d: 0,
                color1: color,
                color2: color,
                license: 0,
                key: "mwboat",
                owner: 0,
                fuel: 40,
                mileage: 0,
                plate: "TRP",
                destroys: 0,
            };
            veh = await vehicles.spawnVehicle(veh);
            veh.setVariable('mwVehicle', true);

            const handbrakeStatus = veh.engineStatus;
            veh.handbrakeStatus = !handbrakeStatus;
            veh.setVariable("handbrake", !handbrakeStatus);
        }
    },
    async spawnTrucks() {
        for (let i = 0; i < this.countTrucks; i++) {
            let color = 1;
            let veh = {
                modelName: 'youga2',
                x: trucksPoint.x + 1*i,
                y: trucksPoint.y + 4*i,
                z: trucksPoint.z,
                h: 90,
                d: 0,
                color1: color,
                color2: color,
                license: 0,
                key: "mwtruck",
                owner: 0,
                fuel: 40,
                mileage: 0,
                plate: "TRP",
                destroys: 0,
            };
            veh = await vehicles.spawnVehicle(veh);
            veh.setVariable('mwVehicle', true);
        }
    },
    setMaterials(count) {
        this.storage.boxes = count;
        this.updateLabel();
    },
    takeBox(player) {
        if (!p.character) return;
        if (!this.storage.boxes || this.storage.boxes === 0) return;
        if (!this.players.has(player.character.id)) return notify.error(player, 'Вам необходимо приехать на лодке');
        if (player.hasAttachment()) return;

        player.addAttachment('materialsBox');
        this.setMaterials(this.storage.boxes - 1);
        prompt.showByName(player, 'materials_box_put');

        if (this.storage.boxes === 0) {
            this.destroyMaterialsPoint();
            mp.players.forEach(p => {
                if (!p.character) return;
                if (!factions.isCrimeFaction(p.character.factionId)) return;

                this.destroyBlipClient(p, 'materials');
            });
        }
    },
    // отправить оповещения
    sendNotifications(message) {
        mp.players.forEach(p => {
            if (!p.character) return;
            if (!factions.isCrimeFaction(p.character.factionId)) return;

            notify.info(p, message, 'Война за материалы');
        });
    },
    // показать/скрыть таймер
    showTimer(state) {
        mp.players.forEach(p => {
            if (!p.character) return;
            if (!factions.isCrimeFaction(p.character.factionId)) return;

            p.call('materialWar.timer.show', [state, this.startTime]);
        });
    },
    createMaterialsPoint() {
        const { x, y, z } = materialsPoint;

        const shape = mp.colshapes.newSphere(x, y, z, 2.0);
        shape.onEnter = (player) => {
            this.takeBox(player);
        }

        materialsPoint.colshape = shape;

        materialsPoint.marker = mp.markers.new(1, new mp.Vector3(x, y, z - 1), 2, {
            rotation: new mp.Vector3(0, 0, 0),
            dimension: 0,
            color: [10, 205, 120, 128],
        });

        materialsPoint.label = mp.labels.new(`\n~b~Материалы:\n~w~0 ящиков`,
            new mp.Vector3(x, y, z), {
                los: false,
                font: 0,
                drawDistance: 10,
                dimension: materialsPoint.marker.dimension
            });
    },
    destroyMaterialsPoint() {
        materialsPoint.label && materialsPoint.label.destroy();
        materialsPoint.marker && materialsPoint.marker.destroy();
        materialsPoint.colshape && materialsPoint.colshape.destroy();

        materialsPoint.label = null;
        materialsPoint.marker = null;
        materialsPoint.colshape = null;
    },
    createBlipClient(player, position, name) {
        player.call(`materialWar.blip.${name}.add`, [position]);
    },
    destroyBlipClient(player, name) {
        player.call(`materialWar.blip.${name}.destroy`);
    },
    clearTimers() {
        Object.values(this.timers).forEach(t => {
            t && timer.remove(t);
        });

        this.timers = {};
    },
    destroyVehicles() {
        mp.vehicles.forEach(veh => {
            if (!veh.getVariable('mwVehicle')) return;

            veh.destroy();
        })
    },
    updateLabel(time) {
        materialsPoint.label.text = `\n~b~Материалы:\n~w~${this.storage.boxes} ящиков\nДо появления: ${time != null ? time : '-'} сек.`;
    },
    onEnterBoat(player) {
        if (!player.character) return;
        this.players.add(player.character.id);
        this.destroyBlipClient(player, 'boats');
        this.createBlipClient(player, materialsPoint, 'materials');
    },
    onExitBoat(player) {
        // const playerIndex = this.players.find(id => player.character.id === id);
        // if (playerIndex === -1) return;
        //
        // this.players.splice(playerIndex, 1);
        // this.destroyBlipClient(player, 'materials');
        // this.createBlipClient(player, startPoint, 'boats');
    },
    trucksPoint: trucksPoint
}