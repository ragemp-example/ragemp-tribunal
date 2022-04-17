const utils = call('utils');
const timer = call('timer');

module.exports = {
    buyers: [
        {
            pedPos: new mp.Vector3(387.5819091796875, 3585.215087890625, 33.292259216308594),
            pedRot: 357.90631103515625,
            shapePos: new mp.Vector3(387.6160888671875, 3585.74267578125, 32.1)
        },
        {
            pedPos: new mp.Vector3(69.65772247314453, 6663.0673828125, 31.72060775756836),
            pedRot: 239.43161010742188,
            shapePos: new mp.Vector3(70.44880676269531, 6662.640625, 30.76929473876953)
        },
        {
            pedPos: new mp.Vector3(2335.686279296875, 4859.6279296875, 41.808223724365234),
            pedRot: 229.6477813720703,
            shapePos: new mp.Vector3(2336.264892578125, 4859.1494140625, 40.808223724365234)
        },
        {
            pedPos: new mp.Vector3(-229.531494140625, -1377.465087890625, 31.258243560791016),
            pedRot: 209.30380249023438,
            shapePos: new mp.Vector3(-228.98959350585938, -1378.5703125, 30.258243560791016)
        },
        {
            pedPos: new mp.Vector3(420.2254333496094, -2063.947021484375, 22.13327407836914),
            pedRot: 42.19989776611328,
            shapePos: new mp.Vector3(419.6973571777344, -2063.355712890625, 21.115114212036133)
        },
    ],
    activeRobberies: [],
    logs: [],
    robberyDestroyTime: 5 * 60 * 1000,
    // Содержимое ящиков при грабеже дома
    houseRobberyContents: [
        {
            name: 'Мебель',
            price: 180
        },
        {
            name: 'Одежда',
            price: 200
        },
        {
            name: 'Бытовая техника',
            price: 220
        },
        {
            name: 'Компьютер',
            price: 240
        },
        {
            name: 'Картина',
            price: 270
        },
        {
            name: 'Ювелирные изделия',
            price: 360
        },
    ],
    // Содержимое ящиков при грабеже бизнеса
    bizRobberyContents: [
        {
            name: 'Мебель',
            price: 180
        },
        {
            name: 'Компьютер',
            price: 240
        },
        {
            name: 'Кассовый аппарат',
            price: 360
        },
    ],
    // Мин. количество ящиков в доме
    minRobberyBoxes: 20,
    // Макс. количество ящиков в доме
    maxRobberyBoxes: 20,
    // КД на грабеж
    robberyInterval: 60 * 60 * 1000,
    maxBoxesInVehicle: 20,
    houseAlarmChance: 0.3,
    bizAlarmChance: 0.6,
    alarmTime: 30,
    boxPickTime: 10,
    init() {
        this.initBuyerColshapes();
    },
    createRobberyColshape(info) {
        let shape = mp.colshapes.newSphere(info.pos.x, info.pos.y, info.pos.z, 1.5);
        shape.robberyInfo = { placeId: info.placeId, isHouse: info.isHouse };
        shape.dimension = info.dimension;
        let marker = mp.markers.new(1, new mp.Vector3(info.pos.x, info.pos.y, info.pos.z - 1.5), 1,
            {
                color: [255, 200, 82, 128],
                visible: true,
                dimension: info.dimension
            });

        let boxes = this.generateRobberyBoxes(info.isHouse);
        let label = mp.labels.new(`Предметы: ~y~${boxes.length} шт.`, new mp.Vector3(info.pos.x, info.pos.y, info.pos.z - 0.3),
            {
                los: false,
                font: 0,
                drawDistance: 5,
            });
        label.dimension = info.dimension;

        this.activeRobberies.push({
            placeId: info.placeId,
            isHouse: info.isHouse,
            boxes: boxes,
            shape: shape,
            marker: marker,
            label: label
        });
        this.logs.push({
            isHouse: info.isHouse,
            placeId: info.placeId,
            date: new Date()
        });
        timer.add(() => {
            this.destroyRobbery(info.isHouse, info.placeId);
        }, this.robberyDestroyTime);
    },
    generateRobberyBoxes(isHouse) {
        let boxes = [];
        let count = utils.randomInteger(this.minRobberyBoxes, this.maxRobberyBoxes);
        for (let i = 0; i < count; i++) {
            boxes.push(this.getRandomBoxContent(isHouse));
        }
        return boxes;
    },
    getRandomBoxContent(isHouse) {
        let contents = isHouse ? this.houseRobberyContents : this.bizRobberyContents;
        return contents[utils.randomInteger(0, contents.length - 1)];
    },
    updateRobberyLabel(robbery) {
        robbery.label.text = `Предметы: ~y~${robbery.boxes.length} шт.`;
    },
    initBuyerColshapes() {
        for (let i = 0; i < this.buyers.length; i++) {
            let buyer = this.buyers[i];
            let pos = buyer.shapePos;
            mp.markers.new(1, pos, 0.5,
                {
                    color: [255, 158, 89, 128],
                    visible: true,
                    dimension: 0
                });
            let shape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.2);
            shape.isRobberyBuyer = true;
            shape.robberyBuyerId = i;
        }
    },
    canPlaceBeRobbed(isHouse, id) {
        let res = {
            result: true,
            info: ''
        };
        let activeRobbery = this.activeRobberies.find(x => x.isHouse === isHouse && x.placeId === id);
        let log = this.logs.find(x => x.isHouse === isHouse && x.placeId === id);
        if (activeRobbery) {
            res.result = false;
            res.info = 'Ограбление уже идет';
        } else if (log) {
            let lastDate = log.date;
            let now = new Date();
            let diff = now - lastDate;
            if (diff < this.robberyInterval) {
                res.result = false;
                let interval = this.robberyInterval - diff;
                res.info = `Ограбление будет доступно через ${interval > 60000 ?
                    `${(interval / (1000 * 60)).toFixed(1)} мин` : `${Math.round(interval / 1000)} сек`}`
            }
        }
        return res;
    },
    destroyRobbery(isHouse, id) {
        let index = this.activeRobberies.findIndex(x => x.placeId === id && x.isHouse === isHouse);
        if (index === -1) return;
        let robbery = this.activeRobberies[index];
        let { shape, marker, label } = robbery;
        if (mp.colshapes.exists(shape)) shape.destroy();
        if (mp.markers.exists(marker)) marker.destroy();
        if (mp.labels.exists(label)) label.destroy();
        this.activeRobberies.splice(index, 1);
    },
    isPlaceBeingRobbed(isHouse, id) {
        !!this.activeRobberies.find(x => x.placeId === id && x.isHouse === isHouse);
    }
}