"use strict";


let idBiz = null;
let cost = null;


mp.keys.bind(0x42, true, function() {           // B
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    if (mp.players.local.vehicle) return;
    mp.events.callRemote('biz.menu.open');
});

mp.events.add("biz.menu.open", (info) => {
    if (mp.busy.includes()) return;
    if (!mp.busy.add("biz.info")) return;
    info.area = mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(info.pos[0], info.pos[1], info.pos[2]));
    mp.callCEFR("biz.menu", []);
    mp.callCEFR("biz.load", [info]);
});

mp.events.add("biz.menu.close", (fromServer) => {
    mp.busy.remove("biz.info");
    if (fromServer) {
        mp.callCEFR("biz.menu.close", []);
    }
    else {
        mp.events.callRemote("biz.menu.close");
    }
});

mp.events.add("biz.buy", () => {
    mp.events.callRemote("biz.buy");
});
mp.events.add("biz.buy.ans", (ans, owner, actions) => {
    mp.callCEFR("biz.buy.ans", [ans, owner, actions]);
});

mp.events.add("biz.actions", (action) => {
    mp.events.callRemote("biz.actions", action);
});

mp.events.add("biz.app.update", (cashBox, productsCount, isFaction) => {
    mp.callCEFR("biz.cashbox.update", [cashBox, isFaction]);
    mp.callCEFR("biz.products.update", [productsCount, isFaction]);
});


/// Actions
let bizId = null;
mp.events.add("biz.finance.show", (bizParameters) => {
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["bizEconomic"]);`);
    bizParameters.params.forEach(param => {
        let values = [];
        let step = param.isInteger ? 1 : 0.1;
        for (let i = param.min; i < param.max + step; i += step) {
            values.push(i.toFixed(1));
        }
        let index = values.findIndex(x => x == param.current);
        mp.callCEFV(`selectMenu.menu.items.unshift({
            paramKey: "${param.key}",
            text: "${param.name}",
            values: [${values}],
            i: ${index},
            min: "${param.min.toFixed(1)}",
            max: "${param.max.toFixed(1)}",
        });`);
    });
    bizId = bizParameters.bizId;
    mp.callCEFV(`selectMenu.show = true`);
});
mp.events.add("biz.finance.save", (params) => {
    if (bizId != null) {
        let bizParameters = {
            bizId: bizId,
            params: JSON.parse(params)
        };
        bizId = null;
        mp.events.callRemote("biz.finance.save", JSON.stringify(bizParameters));
    }
});
mp.events.add("biz.finance.close", () => {
    bizId = null;
});

/// Phone app events
mp.events.add("biz.sell.toGov", (id) => {
    mp.events.callRemote("biz.sell.toGov", id);
});
mp.events.add("biz.sell.toGov.ans", (result) => {
    mp.callCEFR("biz.sell.toGov.ans", [result]);
});

mp.events.add("biz.sell.check", (idBizT, idOrNick, costT) => {
    idBiz = idBizT;
    cost = costT;
    mp.events.callRemote("biz.sell.check", idOrNick);
});
mp.events.add("biz.sell.check.ans", (nick) => {
    mp.callCEFR("biz.sell.check.ans", [nick, cost]);
});

mp.events.add("biz.sell", () => {
    mp.events.callRemote('biz.sell', idBiz, cost);
});
mp.events.add("biz.sell.stop", () => {
    mp.events.callRemote("biz.sell.stop");
});
mp.events.add("biz.sell.ans", (result) => {
    mp.callCEFR("biz.sell.ans", [result]);
});

mp.events.add("biz.order.add", (id, productCount, productPrice) => {
    mp.events.callRemote("biz.order.add", id, productCount, productPrice);
});
mp.events.add("biz.order.ans", (result, isFactionBis) => {
    !isFactionBis && mp.callCEFR("biz.order.ans", [result]);
});
mp.events.add("biz.order.cancel", (id) => {
    mp.events.callRemote("biz.order.cancel", id);
});
mp.events.add("biz.order.complete", (resources, sum, isFactionBis) => {
    !isFactionBis && mp.callCEFR("biz.order.complete", [resources, sum]);
});
mp.events.add("biz.order.take", (flag, isFactionBis) => {
    !isFactionBis && mp.callCEFR("biz.order.take", [flag]);
});

mp.events.add("biz.statistics.update", (date, money, isFactionBis) => {
    !isFactionBis && mp.callCEFR("biz.statistics.update", [date, money]);
});

/// Faction phone app events
mp.events.add("biz.faction.order.add", (id, productCount, productPrice) => {
    mp.events.callRemote("biz.order.add", id, productCount, productPrice, true);
});
mp.events.add("biz.order.ans", (result, isFactionBis) => {
    isFactionBis && mp.callCEFR("biz.faction.order.ans", [result]);
});
mp.events.add("biz.faction.order.cancel", (id) => {
    mp.events.callRemote("biz.order.cancel", id, true);
});
mp.events.add("biz.order.complete", (resources, sum, isFactionBis) => {
    isFactionBis && mp.callCEFR("biz.faction.order.complete", [resources, sum]);
});
mp.events.add("biz.order.take", (flag, isFactionBis) => {
    isFactionBis && mp.callCEFR("biz.faction.order.take", [flag]);
});

mp.events.add("biz.statistics.update", (date, money, isFactionBis) => {
    isFactionBis && mp.callCEFR("biz.faction.statistics.update", [date, money]);
});