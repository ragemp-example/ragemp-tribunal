"use strict";

mp.carrier = {
    bizOrderBlip: null,

    initStartJob() {
        var pedInfo = {
            model: "s_m_m_cntrybar_01",
            position: {
                x: 905.0872802734375,
                y: -1575.5552978515625,
                z: 30.81341552734375
            },
            heading: 45.43087387084961,
            marker: {
                x: 904.468017578125,
                y: -1575.1195068359375,
                z: 29.826210021972656,
                color: [255, 255, 125, 128],
                enterEvent: "carrier.jobshape.enter",
                leaveEvent: "carrier.jobshape.leave"
            },
        };
        mp.events.call('NPC.create', pedInfo);
    },
    setLoadInfo(data) {
        this.initBizOrdersInfo(data);
        var price = [`$${data.productPrice}`];
        var sell = [`-${Math.ceil((1 - data.productSellK) * 100)}%`];

        mp.callCEFV(`selectMenu.setItemValues('carrierLoadProducts', 'Купить', ${JSON.stringify(price)})`);
        mp.callCEFV(`selectMenu.setItemValues('carrierLoadProducts', 'Списать', ${JSON.stringify(sell)})`);
        mp.callCEFV(`selectMenu.showByName('carrierLoad')`);
    },
    setCropUnloadInfo(data) {
        var price = [`$${data.cropPrice}`];

        mp.callCEFV(`selectMenu.setItemValues('carrierCropUnload', 'Цена за 1 ед.', ${JSON.stringify(price)})`);
        mp.callCEFV(`selectMenu.showByName('carrierCropUnload')`);
    },
    initBizOrdersInfo(data) {

        var items = [];
        data.bizOrders.forEach(order => {
            items.push({
                text: order.bizName,
                values: [`${order.prodCount} ед.`],
            });
        });
        items.push({
            text: `Вернуться`
        });
        mp.callCEFV(`selectMenu.setItems('carrierLoadBizOrders', ${JSON.stringify(items)})`);
        mp.callCEFV(`selectMenu.setProp('carrierLoadBizOrders', 'bizOrders', ${JSON.stringify(data.bizOrders)})`);
    },
    setBizOrderWaypoint(pos) {
        if (this.bizOrderBlip && mp.blips.exists(this.bizOrderBlip)) {
            this.bizOrderBlip.destroy();
            this.bizOrderBlip = null;
        }
        if (!pos) return;

        this.bizOrderBlip = mp.blips.new(1, pos, {
            name: "Заказ",
            color: 60
        });
        this.bizOrderBlip.setRoute(true);
    },
};

mp.events.add({
    "characterInit.done": () => {
        mp.carrier.initStartJob();
    },
    "carrier.load.info.set": (data) => {
        mp.carrier.setLoadInfo(data);
    },
    "carrier.cropUnload.info.set": (data) => {
        mp.carrier.setCropUnloadInfo(data);
    },
    "carrier.jobshape.enter": () => {
        mp.events.call(`selectMenu.show`, `carrierJob`);
    },
    "carrier.jobshape.leave": () => {
        mp.events.call(`selectMenu.hide`);
    },
    "carrier.bizOrder.waypoint.set": (pos) => {
        mp.carrier.setBizOrderWaypoint(pos);
    },
});
