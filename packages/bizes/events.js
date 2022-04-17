"use strict";

let factions;
let prompt;
let money;
let notifications;
let phone;

let bizService = require('./index.js');
module.exports = {
    "init": async () => {
        factions = call("factions");
        prompt = call("prompt");
        money = call("money");
        notifications = call('notifications');
        phone = call("phone");
    },
    "factions.loaded": async () => {
        await bizService.init();
        inited(__dirname);
    },
    "player.joined": (player) => {
        player.biz = {
            at: null,
            buyerId: null,
            sellerId: null,
            sellingBizId: null,
            sellingBizCost: null
        };
    },
    "characterInit.done": async (player) => {
        let biz = bizService.getBizByCharId(player.character.id);
        if (biz != null) {
            if (bizService.getDateDays(biz.info.date) === 1) {
                notifications.info(player, "Ваш бизнес будет продан государству на следующий день за неуплату налогов", "Внимание");
            }
            if (bizService.getDateDays(biz.info.date) === 0) {
                notifications.info(player, "Ваш бизнес будет продан государству сегодня за неуплату налогов", "Внимание");
            }
            if (biz.info.characterNick != player.character.name) {
                biz.info.characterNick = player.character.name;
                await biz.info.save();
            }
        }
        if (player.character.admin !== 0 && player.character.admin !== 6) return;
        if (factions.isLeader(player)) {
            if (player.character.factionId) {
                let bizes = bizService.getBizesByFactionId(player.character.factionId);
                if (bizes.length === 0) return;
                let biz = bizes.find(biz => bizService.bizesModules[biz.info.type].business.isFactionOwner);
                if (biz) {
                    phone.addApp(player, "factionBiz", bizService.getBizInfoForApp(biz));
                }
            }
        }
    },
    "player.name.changed": async (player) => {
        let biz = bizService.getBizByCharId(player.character.id);
        if(biz != null) {
            biz.info.characterNick = player.character.name;
            await biz.info.save();
            player.call('biz.menu.close',[true]);
        }
    },
    "playerEnterColshape": (player, shape) => {
        if (!shape.isBiz) return;
        if (prompt != null) prompt.showByName(player, "biz_info_ask");
        if (player && player.biz) player.biz.at = shape.bizId;
    },
    "playerExitColshape": (player, shape) => {
        if (!shape.isBiz) return;
        player.call('biz.menu.close',[true]);
        if (prompt != null) prompt.hide(player);
        if (player && player.biz) player.biz.at = null;
    },
    "biz.menu.open": (player) => {
        if (player.biz.at == null) return;
        let biz = bizService.getBizById(player.biz.at);
        if (biz == null) return;
        let info = biz.info;
        if (prompt != null) prompt.hide(player);
        let actions = [];
        actions.push('robbery');

        if (bizService.bizesModules[info.type].business.isFactionOwner) {
            if (factions.isLeader(player)) {
                if (player.character.factionId) {
                    actions.push('finance');
                }
            }
            player.call("biz.menu.open", [{
                id: info.id,
                name: info.name,
                owner: info.factionId != null ? factions.getFaction(info.factionId).name : "Нет",
                type: bizService.getTypeName(info.type),
                actions: actions,
                pos: [info.x, info.y, info.z]
            }]);
        }
        else {
            if (info.characterId == null) {
                player.call("biz.menu.open", [{
                    id: info.id,
                    name: info.name,
                    faction: info.factionId != null ? factions && factions.getFaction(info.factionId).name : "",
                    type: bizService.getTypeName(info.type),
                    rent: info.price * bizService.bizesModules[info.type].rentPerDayMultiplier,
                    price: info.price,
                    actions: actions,
                    pos: [info.x, info.y, info.z]
                }]);
            }
            else {
                if (player.character.id === info.characterId) {
                    actions.push('finance');
                    if (info.type == 10) actions.push('open');
                    if (info.type == 11) actions.push('start');
                }
                player.call("biz.menu.open", [{
                    id: info.id,
                    name: info.name,
                    faction: info.factionId != null ? factions && factions.getFaction(info.factionId).name : "",
                    type: bizService.getTypeName(info.type),
                    rent: info.price * bizService.bizesModules[info.type].rentPerDayMultiplier,
                    owner: info.characterNick,
                    actions: actions,
                    pos: [info.x, info.y, info.z]
                }]);
            }
        }
    },
    "biz.buy": (player) => {
        if (money == null) return player.call('biz.buy.ans', [0, ""]);
        if (player.biz.at == null) return player.call('biz.buy.ans', [0, ""]);
        let biz = bizService.getBizById(player.biz.at);
        if (biz == null) return;
        let info = biz.info;
        if (bizService.bizesModules[info.type].business.isFactionOwner) return;
        if (info.characterId != null) return player.call('biz.buy.ans', [0, ""]);
        if (player.dist(new mp.Vector3(info.x, info.y, info.z)) > 10) return player.call('biz.buy.ans', [0, ""]);
        if (player.character.cash < info.price) return player.call('biz.buy.ans', [0, ""]);
        if (bizService.isHaveBiz(player.character.id)) return player.call('biz.buy.ans', [2, ""]);

        money.removeCash(player, info.price, async function(result) {
            if (!result) return player.call('biz.buy.ans', [0, ""]);
            info.characterId = player.character.id;
            info.characterNick = player.character.name;
            info.date = bizService.getDropDate(1);
            info.cashBox = 0;
            await bizService.destroyOrder(info.id);
            await info.save();

            let actions = [];
            if (player.character.id === info.characterId) actions.push('finance');
            player.call('biz.buy.ans', [1, player.character.name, actions]);

            bizService.setTimer(biz);
            mp.events.call('player.biz.changed', player);

            let bizInfo = bizService.getBizInfoForApp(biz);
            bizInfo != null && player.call('phone.app.add', ["biz", bizInfo]);
            notifications.info(player, "Оплатите имущество в банке в течение 24 часов, иначе оно будет продано", "Внимание");
        }, `Покупка бизнеса #${info.id} у государства`);
    },
    "biz.sell.toGov": (player, id) => {
        if (money == null) return player.call('biz.sell.toGov.ans', [0]);
        if (player == null) return;
        id = parseInt(id);
        if (isNaN(id)) return player.call('biz.sell.toGov.ans', [0]);
        let biz = bizService.getBizById(id);
        if (biz == null) return player.call('biz.sell.toGov.ans', [0]);
        let info = biz.info;
        if (bizService.bizesModules[info.type].business.isFactionOwner) return;
        if (player.dist(new mp.Vector3(info.x, info.y, info.z)) > 10) return player.call('biz.sell.toGov.ans', [3]);
        if (info.characterId !== player.character.id) return player.call('biz.sell.toGov.ans', [0]);
        bizService.dropBiz(biz, true);
    },
    "biz.sell.check": (player, idOrNick) => {
        let id = parseInt(idOrNick);
        if (isNaN(id)) {
            if (player.character.name == idOrNick) return player.call("biz.sell.check.ans", [null]);
            let buyer = mp.players.toArray().find(x => x.character != null && x.character.name == idOrNick);
            if (buyer == null) return player.call("biz.sell.check.ans", [null]);
            player.call("biz.sell.check.ans", [buyer.character.name]);
            player.biz.buyerId = buyer.id;      
        }
        else {
            if (id > 1000000) return player.call("biz.sell.check.ans", [null]);
            if (player.id == id) return player.call("biz.sell.check.ans", [null]);
            if (mp.players.at(id) == null) return player.call("biz.sell.check.ans", [null]);
            if (mp.players.at(id).character != null) {
                player.biz.buyerId = id;
                player.call("biz.sell.check.ans", [mp.players.at(id).character.name]);
            }
            else {
                player.call("biz.sell.check.ans", [null]);
            }
        }
    },
    "biz.sell": (player, bizId, cost) => {
        if (player.biz.buyerId == null) return player.call("biz.sell.ans", [0]);
        let buyer = mp.players.at(player.biz.buyerId);
        if (buyer == null) return player.call("biz.sell.ans", [0]);
        if (!mp.players.exists(buyer)) return player.call("biz.sell.ans", [0]);
        bizId = parseInt(bizId);
        cost = parseInt(cost);
        if (isNaN(bizId) || isNaN(cost)) return player.call("biz.sell.ans", [0]);
        if (buyer.character.cash < cost) return player.call("biz.sell.ans", [5]);
        if (bizService.isHaveBiz(buyer.character.id)) return player.call("biz.sell.ans", [6]);
        let biz = bizService.getBizById(bizId);
        if (biz == null) return player.call("biz.sell.ans", [0]);
        let info = biz.info;
        if (bizService.bizesModules[info.type].business.isFactionOwner) return player.call("biz.sell.ans", [0]);
        if (player.dist(new mp.Vector3(info.x, info.y, info.z)) > 10 ||
            buyer.dist(new mp.Vector3(info.x, info.y, info.z)) > 10) return player.call("biz.sell.ans", [3]);
        if (cost < info.price || cost > 1000000000) return player.call("biz.sell.ans", [4]);
        buyer.biz.sellerId = player.id;
        player.biz.sellingBizId = info.id;
        player.biz.sellingBizCost = cost;
        buyer.call('offerDialog.show', ["biz_sell", {
            name: player.character.name,
            price: cost
        }]);
    },
    "biz.sell.ans": (player, result) => {
        if (player.biz.sellerId == null) return;
        let seller = mp.players.at(player.biz.sellerId);
        if (seller == null) return;
        if (!mp.players.exists(seller)) return;
        if (seller.biz == null) return;
        if (seller.biz.buyerId == null) return;
        let biz = bizService.getBizById(seller.biz.sellingBizId);
        if (biz == null) return seller.call("biz.sell.ans", [0]);
        let info = biz.info;
        if (info.characterId != seller.character.id) return seller.call("biz.sell.ans", [0]);
        if (player.dist(new mp.Vector3(info.x, info.y, info.z)) > 10 ||
            seller.dist(new mp.Vector3(info.x, info.y, info.z)) > 10) return seller.call("biz.sell.ans", [3]);
        if (player.character.cash < info.price) return seller.call("biz.sell.ans", [5]);
        if (bizService.isHaveBiz(player.character.id)) return seller.call("biz.sell.ans", [6]);
        if (result == 2) return  seller.call("biz.sell.ans", [2]);

        bizService.sellBiz(biz, seller.biz.sellingBizCost, seller, player, function(ans) {
            if (ans) {
                seller.call("biz.sell.ans", [1]);
                notifications.info(player, "Оплатите имущество в банке в течение 24 часов, иначе оно будет продано", "Внимание");
            }
            else {
                seller.call("biz.sell.ans", [0]);
            }
            seller.biz.buyerId = null;
            seller.biz.sellingBizId = null;
            seller.biz.sellingBizCost = null;
            player.biz.sellerId = null;
        });
    },
    "biz.sell.stop": (player) => {
        if (player.biz.buyerId != null) {
            if (!mp.players.exists(mp.players.at(player.biz.buyerId))) return;
            mp.players.at(player.biz.buyerId).call("offerDialog.hide");
            mp.players.at(player.biz.buyerId).biz.sellerId = null;
        }
        player.biz.buyerId = null;
        player.biz.sellingBizId = null;
        player.biz.sellingBizCost = null;
    },
    "biz.order.add": async (player, id, productCount, productPrice, isFaction) => {
        productCount = parseInt(productCount);
        productPrice = parseFloat(productPrice);
        if (isNaN(productCount) || isNaN(productPrice)) return player.call("biz.order.ans", [0, isFaction]);
        let biz = bizService.getBizById(id);
        if (!bizService.bizesModules[biz.info.type].business.isFactionOwner) {
            if (biz.info.characterId !== player.character.id) return player.call("biz.order.ans", [0, isFaction]);
            if (biz.info.cashBox < parseInt(productPrice * productCount)) return player.call("biz.order.ans", [2, isFaction]);
        }
        else {
            if (!factions.isLeader(player)) return player.call("biz.order.ans", [0, isFaction]);
            if (factions.getFaction(biz.info.factionId).cash < parseInt(productPrice * productCount)) return player.call("biz.order.ans", [2, isFaction]);
        }
        player.call("biz.order.ans", [await bizService.createOrder(biz, productCount, productPrice), isFaction]);
    },
    "biz.order.cancel": async (player, id) => {
        id = parseInt(id);
        await bizService.destroyOrder(id);
    },
    "biz.actions": (player, action) => {
        switch(action) {
            case 'finance':
                if (player.biz.at == null) return notifications != null && notifications.error(player, "Вы находитесь не рядом с бизнесом", "Ошибка");
                let bizParameters = bizService.getBizParameters(player.character.id, player.biz.at);
                if (bizParameters == null) return notifications != null && notifications.error(player, "Экономические параметры бизнеса недоступны", "Ошибка");
                player.call("biz.finance.show", [bizParameters]);
                break;
        }
    },
    "biz.finance.save": (player, bizParameters) => {
        if (player.biz.at == null) return notifications != null && notifications.error(player, "Вы находитесь не рядом с бизнесом", "Ошибка");
        if (bizService.setBizParameters(player.character.id, JSON.parse(bizParameters))) {
            notifications != null && notifications.success(player, "Экономические параметры успешно изменены", "Успешно");
        }
        else {
            notifications != null && notifications.error(player, "Экономические параметры бизнеса недоступны", "Ошибка");
        }
    },
};