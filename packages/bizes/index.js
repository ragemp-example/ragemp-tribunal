"use strict";

let fs = require('fs');
let path = require('path');

let bizes = [];
let bizesModules = [];

/// biz types
/// 0 - АЗС
/// 1 - Супермаркет
/// 4 - Магазин одежды
/// 5 - Магазин оружия
/// 6 - Парикмахерская
/// 7 - Магазин масок
/// 8 - Тату-салон
/// 9 - Los Santos Customs
/// 10 - Клубы
/// 11 - Нефтевышки


let utils;
let timer;
let money;
let notifications;
let factions;
let carrier;
let economy;

/// Economic constants
let maxProductPriceMultiplier = 2.0;
let minProductPriceMultiplier = 1.2;
let factionPayMultiplier = 0.01;
let dropBizMultiplier = 0.6;
let dropBizOrderMultiplier = 0.8;


let getBizById = function(id) {
    return bizes.find(x => x.info.id == id);
};
let getBizByCharId = function(characterId) {
    return bizes.find(x => x.info.characterId == characterId);
};
let getBizByPlayerPos = function(player) {
    return bizes.find(x => player.dist(new mp.Vector3(x.info.x, x.info.y, x.info.z)) <= 10);
};
let getDateDays = function(date) {
    let dateNow = new Date();
    dateNow = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.ceil(Math.abs(date.getTime() - dateNow.getTime()) / (1000 * 3600 * 24));
};
let getBizRent = function(biz) {
    return biz.info.price * bizesModules[biz.info.type].rentPerDayMultiplier;
};
let setBizRentMultiplier = function (bizModuleName, multiplier) {
    if (multiplier < 0 || multiplier > 0.5) return false;
    economy.setByType([{type: `${bizModuleName}.rentPerDayMultiplier`, value: multiplier}], true);
    return true;
};
let dropBiz = function(biz, sellToGov = false) {
    if (biz == null) return;
    if (biz.info.characterId == null) return;
    let characterId = biz.info.characterId;
    biz.info.characterId = null;
    biz.info.characterNick = null;
    biz.info.date = null;
    biz.info.cashBox = 0;
    biz.info.save().then(() => {
        if (money == null) return console.log("[bizes] Biz dropped " + biz.info.id + ". But player didn't getmoney");
        money.addMoneyById(characterId, biz.info.price * dropBizMultiplier, function(result) {
            if (result) {
                console.log("[bizes] Biz dropped " + biz.info.id);
                let player = mp.players.toArray().find(x => x.character != null && characterId == x.character.id);
                if (player != null) {
                    mp.events.call('player.biz.changed', player);
                    if (sellToGov) {
                        player.call('biz.sell.toGov.ans', [1]);
                    } else {
                        notifications.warning(player, "Ваш бизнес отобрали за неуплату налогов", "Внимание");
                        player.call('phone.app.remove', ["biz", biz.info.id]);
                    }
                }
                else {
                    notifications.save(characterId, "warning", "Ваш бизнес отобрали за неуплату налогов", "Внимание");
                }
            } else {
                console.log("[bizes] Biz dropped " + biz.info.id + ". But player didn't getmoney");
            }
        }, sellToGov ? `Продажа бизнеса #${biz.info.id} государству` : `Слет бизнеса #${biz.info.id}`);
    });
};
let dropAllBizes = async () => {
    for (let i = 0; i < bizes.length; i++) {
        bizes[i].info.characterId = null;
        bizes[i].info.characterNick = null;
        bizes[i].info.date = null;
        bizes[i].info.cashBox = 0;
        await bizes[i].info.save();
    }
};
let setTimer = function(biz) {
    if (biz == null) return;
    if (biz.info.characterId == null) return;
    if (biz.info.date == null) return dropBiz(biz);
    if (biz.info.date.getTime() - new Date().getTime() <= 10000) return dropBiz(biz);
    biz.timer != null && timer.remove(biz.timer);
    biz.timer = timer.add(async function() {
        dropBiz(biz);
    }, biz.info.date.getTime() - new Date().getTime());
};
let getDropDate = function(daysNumber) {
    let date = new Date();
    date.setTime(Date.now() + (daysNumber * 1000 * 3600 * 24));
    return date;
};
let getBizInfoForApp = function(biz) {
    if (biz == null) return null;
    if (bizesModules[biz.info.type] == null) return null;
    let minMultiplier = bizesModules[biz.info.type].minProductPriceMultiplier == null ? minProductPriceMultiplier : bizesModules[biz.info.type].minProductPriceMultiplier;
    let maxMultiplier = bizesModules[biz.info.type].maxProductPriceMultiplier == null ? maxProductPriceMultiplier : bizesModules[biz.info.type].maxProductPriceMultiplier;
    if (bizesModules[biz.info.type].business.isFactionOwner) {
        return {
            id: biz.info.id,
            name: biz.info.name,
            type: getTypeName(biz.info.type),
            pos: [biz.info.x, biz.info.y, biz.info.z],
            resourcesMax: biz.info.productsMaxCount,
            resources: biz.info.productsCount,
            statistics: biz.info.BizStatistics,
            order: biz.info.productsOrder && { productsCount: biz.info.productsOrder, productsPrice: biz.info.productsOrderPrice },
            resourcePriceMin: bizesModules[biz.info.type].productPrice * minMultiplier,
            resourcePriceMax: bizesModules[biz.info.type].productPrice * maxMultiplier,
            improvements: []
        };
    }
    else {
        return {
            id: biz.info.id,
            name: biz.info.name,
            type: getTypeName(biz.info.type),
            cashBox: biz.info.cashBox,
            pos: [biz.info.x, biz.info.y, biz.info.z],
            days: getDateDays(biz.info.date),
            rent: getBizRent(biz),
            resourcesMax: biz.info.productsMaxCount,
            resources: biz.info.productsCount,
            price: biz.info.price,
            statistics: biz.info.BizStatistics,
            order: biz.info.productsOrder && { productsCount: biz.info.productsOrder, productsPrice: biz.info.productsOrderPrice },
            resourcePriceMin: bizesModules[biz.info.type].productPrice * minMultiplier,
            resourcePriceMax: bizesModules[biz.info.type].productPrice * maxMultiplier,
            improvements: []
        };
    }
};
let getBizInfoForBank = function(biz) {
    if (biz == null) return null;
    if (bizesModules[biz.info.type] == null) return null;
    return {
        id: biz.info.id,
        name: biz.info.name,
        type: getTypeName(biz.info.type),
        cashBox: biz.info.cashBox,
        days: getDateDays(biz.info.date),
        rent: getBizRent(biz),
    };
};
let getResourceName = function(type) {
    return bizesModules[type].business.productName;
};
let getResourcePrice = function(type) {
    return bizesModules[type].productPrice;
};
let getResourcePos = function (type) {
    return {x: 2703.896728515625, y: 1568.430419921875, z: 24.52433967590332};
};
let getTypeName = function(type) {
    return bizesModules[type].business.name;
};
let bizUpdateCashBox = async function(id, money) {
    let biz = getBizById(id);
    if (biz == null) return;
    let factionMoney = 0;
    if (biz.info.factionId != null && factions != null && money > 0) {
        factionMoney = money * factionPayMultiplier;
        if (factionMoney < 1) {
            if (factionMoney * 10 >= 5) factionMoney = 1;
            else factionMoney = 0;
        }
        else {
            factionMoney = parseInt(factionMoney);
        }
        if (factionMoney > 0) {
            factions.addCash(biz.info.factionId, factionMoney);
        }
    }
    let bizMoney = money - factionMoney;
    biz.info.cashBox += bizMoney;

    if (factions != null && biz.info.characterId == null) {
        if (biz.info.cashBox > 0) {
            factions.addCash(1, biz.info.cashBox);
            biz.info.cashBox = 0;
        }
    }

    let currentDay = biz.info.BizStatistics.find(x => x.date.toLocaleDateString() == new Date().toLocaleDateString());
    if (currentDay == null) {
        currentDay = {
            bizId: biz.info.id,
            date: new Date(),
            money: bizMoney
        };
        currentDay = await db.Models.BizStatistics.create(currentDay);
        biz.info.BizStatistics.unshift(currentDay);
    } else {
        currentDay.money += bizMoney;
        await currentDay.save();
    }
    await biz.info.save();
    let isFactionBiz = bizesModules[biz.info.type].business.isFactionOwner;
    let player;
    if (!isFactionBiz) {
        player = mp.players.toArray().find(player => player != null && player.character != null && player.character.id === biz.info.characterId);
    }
    else {
        player = mp.players.toArray().find(player => player != null && player.character != null && factions.isLeader(player) && player.character.factionId === biz.info.factionId);
    }
    player != null && player.call("biz.app.update", [biz.info.cashBox, biz.info.productsCount, isFactionBiz]);
    player != null && player.call("biz.statistics.update", [currentDay.date, currentDay.money, isFactionBiz]);
};
let addProducts = async function(id, count) {
    let biz = getBizById(id);
    if (biz == null) return false;
    biz.info.productsCount += count;
    if (biz.info.productsCount > biz.info.productsMaxCount) biz.info.productsCount = biz.info.productsMaxCount;
    await biz.info.save();
    return true;
};
let removeProducts = async function(id, count) {
    let biz = getBizById(id);
    if (biz == null) return false;
    if (biz.info.productsCount < count) return false;
    biz.info.productsCount -= count;
    await biz.info.save();

    if (biz.info.characterId == null && biz.info.productsCount < biz.info.productsMaxCount / 2 && biz.info.productsOrder == null) {
        let min = bizesModules[biz.info.type].productPrice * (bizesModules[biz.info.type].minProductPriceMultiplier == null ? minProductPriceMultiplier : bizesModules[biz.info.type].minProductPriceMultiplier);
        let max = bizesModules[biz.info.type].productPrice * (bizesModules[biz.info.type].maxProductPriceMultiplier == null ? maxProductPriceMultiplier : bizesModules[biz.info.type].maxProductPriceMultiplier);
        let countOrder = biz.info.productsMaxCount -  biz.info.productsCount;
        if (await createOrder(biz, countOrder, (max + min) / 2, true) !== 1) return console.log("[BIZES] Auto creating order error");
        console.log("[BIZES] Order created automatically");
    }
    return true;
};
let createOrder = async function(biz, count, price, isAuto) {
    if (biz == null) return 0;
    if (biz.info.productsOrder != null) return 0;
    if (biz.info.productsCount + count > biz.info.productsMaxCount) return 3;
    let min = bizesModules[biz.info.type].productPrice * (bizesModules[biz.info.type].minProductPriceMultiplier == null ? minProductPriceMultiplier : bizesModules[biz.info.type].minProductPriceMultiplier);
    let max = bizesModules[biz.info.type].productPrice * (bizesModules[biz.info.type].maxProductPriceMultiplier == null ? maxProductPriceMultiplier : bizesModules[biz.info.type].maxProductPriceMultiplier);
    if (price <= min || price >= max) return 0;
    if (!bizesModules[biz.info.type].business.isFactionOwner) {
        if (!isAuto && parseInt(price * count) > biz.info.cashBox) return 0;

        biz.info.productsOrder = count;
        biz.info.productsOrderPrice = parseInt(price * count);
        biz.info.cashBox -= biz.info.productsOrderPrice;
    }
    else {
        if (parseInt(price * count) > factions.getFaction(biz.info.factionId).cash) return 0;
        biz.info.productsOrder = count;
        biz.info.productsOrderPrice = parseInt(price * count);
        let faction = factions.getFaction(biz.info.factionId);
        faction.cash -= biz.info.productsOrderPrice;
        await faction.save();
    }
    carrier != null && carrier.addBizOrder(biz);
    await biz.info.save();
    return 1;
};
let destroyOrder = async function(id) {
    let biz = getBizById(id);
    if (biz == null) return false;
    if (biz.isOrderTaken) return false;
    if (!bizesModules[biz.info.type].business.isFactionOwner) {
        biz.info.cashBox += biz.info.productsOrderPrice * dropBizOrderMultiplier;
    }
    else {
        let faction = factions.getFaction(biz.info.factionId);
        faction.cash += biz.info.productsOrderPrice * dropBizOrderMultiplier;
        await faction.save();
    }

    biz.info.productsOrder = null;
    biz.info.productsOrderPrice = null;
    carrier != null && carrier.removeBizOrderByBizId(biz.info.id);
    await biz.info.save();
    let isFactionBiz = bizesModules[biz.info.type].business.isFactionOwner;
    let player;
    if (!isFactionBiz) {
        player = mp.players.toArray().find(player => player != null && player.character != null && player.character.id === biz.info.characterId);
    }
    else {
        player = mp.players.toArray().find(player => player != null && player.character != null && factions.isLeader(player) && player.character.factionId === biz.info.factionId);
    }
    player != null && player.call("biz.app.update", [biz.info.cashBox, biz.info.productsCount, isFactionBiz]);
    return true;
};
let getOrder = function(id) {
    let biz = getBizById(id);
    if (biz == null) return false;
    if (biz.isOrderTaken) return true;
    biz.isOrderTaken = true;
    let isFactionBiz = bizesModules[biz.info.type].business.isFactionOwner;
    let player;
    if (!isFactionBiz) {
        player = mp.players.toArray().find(player => player != null && player.character != null && player.character.id === biz.info.characterId);
    }
    else {
        player = mp.players.toArray().find(player => player != null && player.character != null && factions.isLeader(player) && player.character.factionId === biz.info.factionId);
    }
    player != null && player.call("biz.order.take", [true, isFactionBiz]);
    return true;
};
let dropOrder = function(id) {
    let biz = getBizById(id);
    if (biz == null) return false;
    if (!biz.isOrderTaken) return true;
    biz.isOrderTaken = false;
    let isFactionBiz = bizesModules[biz.info.type].business.isFactionOwner;
    let player;
    if (!isFactionBiz) {
        player = mp.players.toArray().find(player => player != null && player.character != null && player.character.id === biz.info.characterId);
    }
    else {
        player = mp.players.toArray().find(player => player != null && player.character != null && factions.isLeader(player) && player.character.factionId === biz.info.factionId);
    }
    player != null && player.call("biz.order.take", [false, isFactionBiz]);
    return true;
};
let readyOrder = async function(id, productsNumber) {
    let biz = getBizById(id);
    if (biz == null) return null;
    if (!biz.isOrderTaken) return null;
    let addedProducts = 0;
    if (productsNumber > biz.info.productsOrder) productsNumber = biz.info.productsOrder;
    if (biz.info.productsCount + productsNumber > biz.info.productsMaxCount) {
        addedProducts = biz.info.productsMaxCount - biz.info.productsCount;
        biz.info.productsCount = biz.info.productsMaxCount;
    }
    else {
        addedProducts = productsNumber;
        biz.info.productsCount += productsNumber;
    }
    let pay = null;
    if (productsNumber < biz.info.productsOrder) {
        pay = biz.info.productsOrderPrice;
        biz.info.productsOrderPrice = parseInt((1 - productsNumber/biz.info.productsOrder) * biz.info.productsOrderPrice);
        pay -= biz.info.productsOrderPrice;
        biz.info.productsOrder = biz.info.productsOrder - productsNumber;
    }
    else {
        pay = biz.info.productsOrderPrice;
        biz.info.productsOrder = null;
        biz.info.productsOrderPrice = null;
    }

    await biz.info.save();
    let player;
    let isFactionBiz = bizesModules[biz.info.type].business.isFactionOwner;
    if (!isFactionBiz) {
        player = mp.players.toArray().find(player => player != null && player.character != null && player.character.id === biz.info.characterId);
    }
    else {
        player = mp.players.toArray().find(player => player != null && player.character != null && factions.isLeader(player) && player.character.factionId === biz.info.factionId);
    }
    player != null && player.call("biz.order.complete", [addedProducts, pay, isFactionBiz]);
    player != null && player.call("biz.app.update", [biz.info.cashBox, biz.info.productsCount, isFactionBiz]);
    return {productsOrder: biz.info.productsOrder, productsOrderPrice: biz.info.productsOrderPrice, pay: pay};
};

module.exports = {
    maxProductPriceMultiplier: maxProductPriceMultiplier,
    minProductPriceMultiplier: minProductPriceMultiplier,
    factionPayMultiplier: factionPayMultiplier,
    dropBizMultiplier: dropBizMultiplier,
    dropBizOrderMultiplier: dropBizOrderMultiplier,

    async init() {
        utils = call("utils");
        timer = call("timer");
        money = call("money");
        notifications = call('notifications');
        factions = call("factions");
        carrier = call("carrier");
        economy = call("economy");

        for (let file of fs.readdirSync(path.dirname(__dirname))) {
            if (file !== 'base' && !ignoreModules.includes(file) && fs.existsSync(path.dirname(__dirname) + "/" + file + '/index.js')) {
                let objects = require('../' + file + '/index');
                if (objects.business != null && objects.business.type != null && objects.business.name != null && objects.business.productName != null && objects.rentPerDayMultiplier != null && objects.productPrice != null) {
                    bizesModules[objects.business.type] = call(file);
                }
            }
        }

        console.log("[BIZES] load bizes from DB");
        let bizesInfo = await db.Models.Biz.findAll({
            include: [db.Models.BizStatistics]
        });
        let loadedCount = 0;
        for (let i = 0; i < bizesInfo.length; i++) {
            if (!bizesModules[bizesInfo[i].type]) continue;

            let biz = await this.addBiz(bizesInfo[i]);
            setTimer(biz);
            loadedCount++;
        }
        mp.events.call("bizes.done");
        console.log("[BIZES] " + loadedCount + " bizes loaded");
    },
    async createBiz(name, price, type, position) {
        let biz = await db.Models.Biz.create({
            name: name,
            price: price,
            type: type,
            cashBox: 0,
            productsCount: 0,
            productsMaxCount: 10000,
            x: position.x,
            y: position.y,
            z: position.z
        }, {});
        biz = await db.Models.Biz.findOne({
            where: {
                id: biz.id
            },
            include: [db.Models.BizStatistics]
        });
        const bizId = biz.id;
        biz = await this.addBiz(biz);
        setTimer(biz);
        console.log("[BIZES] added new biz");
        return bizId;
    },
    isHaveBiz(characterId) {
        return bizes.findIndex(x => x.info.characterId === characterId) !== -1;
    },
    async addBiz(bizInfo) {
        let colshape = mp.colshapes.newSphere(bizInfo.x, bizInfo.y, bizInfo.z, 4.0);
        let colshapeOrder = mp.colshapes.newSphere(bizInfo.x, bizInfo.y, bizInfo.z, 20.0);
        colshape.isBiz = true;
        colshape.bizId = bizInfo.id;
        colshapeOrder.isOrderBiz = true;
        colshapeOrder.bizId = bizInfo.id;
        bizInfo.BizStatistics = bizInfo.BizStatistics.sort((x, y) => {
            if (x.date.getTime() < y.date.getTime()) {
                return 1;
            }
            if (x.date.getTime() > y.date.getTime()) {
                return -1;
            }
            return 0;
        });
        bizes.push({
            colshape: colshape,
            colshapeOrder: colshapeOrder,
            info: bizInfo
        });
        if (bizInfo.BizStatistics.length !== 0) {
            if (bizInfo.BizStatistics[0].date.toLocaleDateString() != new Date().toLocaleDateString()) {
                await bizUpdateCashBox(bizInfo.id, 0);
            }
        } else {
            await bizUpdateCashBox(bizInfo.id, 0);
        }
        return bizes[bizes.length - 1];
    },
    sellBiz(biz, cost, seller, buyer, callback) {
        biz.info.characterId = buyer.character.id;
        biz.info.characterNick = buyer.character.name;
        biz.info.cashBox = 0;
        biz.info.date = getDropDate(1);
        setTimer(biz);
        biz.info.save().then(() => {
            if (money == null) return;
            money.moveCash(buyer, seller, cost, function(result) {
                if (result) {
                    callback(true);
                    mp.events.call('player.biz.changed', seller);
                    mp.events.call('player.biz.changed', buyer);
                    let bizInfo = getBizInfoForApp(biz);
                    bizInfo != null && buyer.call('phone.app.add', ["biz", bizInfo]);
                } else {
                    callback(false);
                }
            }, `Покупка бизнеса #${biz.info.id} у персонажа #${seller.character.id}`, `Продажа бизнеса #${biz.info.id} персонажу #${buyer.character.id}`);
        });
    },
    getBizById: getBizById,
    getBizByCharId: getBizByCharId,
    getBizByPlayerPos: getBizByPlayerPos,
    getTypeName: getTypeName,
    getResourceName: getResourceName,
    getResourcePrice: getResourcePrice,
    getResourcePos: getResourcePos,
    getDropDate: getDropDate,
    getBizInfoForApp: getBizInfoForApp,
    getBizInfoForBank: getBizInfoForBank,
    getDateDays: getDateDays,
    getBizRent: getBizRent,
    setBizRentMultiplier: setBizRentMultiplier,
    getBizesFactionIds() {
        return bizes.map((elem) => elem.info.factionId);
    },
    getFactionId(bizId) {
        return getBizById(bizId).info.factionId;
    },
    setFactionId(bizId, factionId) {
        let biz = getBizById(bizId);
        if (biz == null) return;
        biz.info.factionId = factionId;
        biz.info.save();
    },
    getBizesCount() {
        return bizes.length;
    },
    getBizesByFactionId(factionId) {
        return bizes.filter(x => x.info.factionId === factionId);
    },
    getBizesForBizWar(factionId) {
        return bizes.filter(x => x.info.factionId !== factionId && x.info.type != 10).map(x => {
            return {
                id: x.info.id,
                name: x.info.name,
                factionId: x.info.factionId,
            };
        });
    },
    getBizCount() {
        return bizes.length;
    },
    getNearBiz(player, range = 10) {
        let nearBiz;
        let minDist = 99999;
        bizes.forEach(biz => {
            let bizPos = new mp.Vector3(biz.info.x, biz.info.y, biz.info.z);
            let distance = player.dist(bizPos);
            if (distance < range && distance < minDist) {
                nearBiz = biz;
                minDist = distance;
            }
        });
        return nearBiz;
    },
    // получить бизнесы с заказами
    getOrderBizes() {
        let list = [];
        bizes.forEach(biz => {
            if (!biz.info.productsOrder || !biz.info.productsOrderPrice) return;
            list.push(biz);
        });
        return list;
    },
    setTimer: setTimer,
    /// Функция пополняющая кассу биза
    /// После каждой покупки передавать в нее стоимость покупки и id бизнеса
    bizUpdateCashBox: bizUpdateCashBox,

    addProducts: addProducts,
    removeProducts: removeProducts,
    getProductsAmount(id) {
        let biz = getBizById(id);
        if (biz == null) return null;
        return biz.info.productsCount;
    },
    getBizPosition(id) {
        let biz = getBizById(id);
        if (biz == null) return null;
        return new mp.Vector3(biz.info.x, biz.info.y, biz.info.z);
    },
    getBizParameters(charId, id) {
        let biz = getBizById(id);
        if (biz == null) return null;
        if (!bizesModules[biz.info.type].business.isFactionOwner) {
            if (biz.info.characterId !== charId) return null;
        }

        let params = bizesModules[biz.info.type].getBizParamsById(biz.info.id);
        if (params == null) return null;
        return {bizId: biz.info.id, params: params};
    },
    setBizParameters(charId, bizParameters) {
        let biz = getBizById(bizParameters.bizId);
        if (biz == null) return false;
        if (!bizesModules[biz.info.type].business.isFactionOwner) {
            if (biz.info.characterId !== charId) return false;
        }
        bizParameters.params.forEach(param => {
            bizesModules[biz.info.type].setBizParam(bizParameters.bizId, param.key, param.value);
        });
        mp.events.call("biz.finance.save.done", biz.info.id, biz.info.type);
        return true;
    },

    createOrder: createOrder,
    getOrder: getOrder,
    dropOrder: dropOrder,
    destroyOrder: destroyOrder,
    readyOrder: readyOrder,

    bizesModules: bizesModules,
    dropBiz: dropBiz,
    dropAllBizes: dropAllBizes,

    async fillAllBizesProducts() {
        for (let index = 0; index < bizes.length; index++) {
            let biz = bizes[index];
            biz.info.productsCount = biz.info.productsMaxCount;
            await biz.info.save();

        }
    },
    async setBizesTypeMaxProducts(type, amount) {
        for (let index = 0; index < bizes.length; index++) {
            let biz = bizes[index];
            if (biz.info.type !== type) continue;
            biz.info.productsMaxCount = amount;
            await biz.info.save();
        }
    },
};
