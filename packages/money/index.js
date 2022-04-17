"use strict";

let logger;
let bank;
/// ФОРМАТ ЛОГОВ [MONEY]
/// `[MONEY] 1000 add cash to | Just because`
/// `[${moduleName}] ${moneyCount} ${operation} ${moneyType} ${target} | ${reason}`
/// moduleName - название модуля
/// moneyCount - кол-во средств
/// operation - операция (add/remove)
/// moneyType - тип средств(cash/money)
/// target - цель к котрой применена операция(to - на текущего игрока/from - текущим игроком)
/// reason - причина

/// Функции модуля системы финансов игрока
module.exports = {
    init() {
        logger = call("logger");
        bank = call("bank");
    },
    /// player - игрок которому перевести средства
    /// number - количество средств
    /// callback - функция колбека, которая вызовется по завершению работы или в случае ошибки
    addCash(player, number, callbackT, reason = "") {
        if (typeof player == 'number') return this.addCashById(player, number, callbackT, reason);
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        }
        number = parseInt(number);
        if (isNaN(number)) return callback(false);
        if (number < 0 || number > 1000000000) return callback(false);
        if (player == null) return callback(false);
        if (player.character == null) return callback(false);

        let cash = player.character.cash;
        db.sequelize.transaction(t => {
            player.character.cash = player.character.cash + number;
            return player.character.save({transaction: t});
        }).then(result => {
            this.changing(player);
            logger.log(`+${number}$ CASH | ${reason}`, "money", player);
            callback(true);
        }).catch(err => {
            if (cash != null) {
                player.character.cash = cash;
            }
            callback(false);
        });
    },
    /// id - id персоонажа которому перевести средства
    /// number - количество средств
    /// callback - функция колбека, которая вызовется по завершению работы или в случае ошибки
    addCashById(id, number, callbackT, reason = "") {
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        };
        id = parseInt(id);
        number = parseInt(number);
        if (isNaN(number) || isNaN(id)) return callback(false);
        if (number < 0 || number > 1000000000 || id < 0 || id > 100000000) return callback(false);

        let player = mp.players.toArray().find( player => {
            if(player.character) {
                return player.character.id == id;
            }
            else {
                return false;
            }
        });
        if (player == null) {
            db.sequelize.transaction(t => {
                return db.Models.Character.findOne({ where: {id: id} , transaction: t}).then( character => {
                    character.cash = character.cash + number;
                    return character.save({transaction: t});
                });
            }).then(result => {
                logger.log(`+${number}$ CASH | ${reason}`, "money", id);
                callback(true);
            }).catch(err => {
                callback(false);
            });
        }
        else {
            this.addCash(player, number, callback, reason);
        }
    },
    addMoney(player, number, callbackT, reason = "") {
        if (typeof player == 'number') return this.addMoneyById(player, number, callbackT, reason);
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        };
        number = parseInt(number);
        if (isNaN(number)) return callback(false);
        if (number < 0 || number > 1000000000) return callback(false);
        if (player == null) return callback(false);
        if (player.character == null) return callback(false);

        let bank = player.character.bank;
        db.sequelize.transaction(t => {
            player.character.bank = player.character.bank + number;
            return player.character.save({transaction: t});
        }).then(result => {
            this.changing(player);
            logger.log(`+${number}$ BANK | ${reason}`, "money", player);
            callback(true);
        }).catch(err => {
            if (bank != null) {
                player.character.bank = bank;
            }
            callback(false);
        });
    },
    addMoneyById(id, number, callbackT, reason = "") {
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        };
        id = parseInt(id);
        number = parseInt(number);
        if (isNaN(number) || isNaN(id)) return callback(false);
        if (number < 0 || number > 1000000000 || id < 0 || id > 100000000) return callback(false);

        let player = mp.players.toArray().find( player => {
            if(player.character) {
                return player.character.id == id;
            }
            else {
                return false;
            }
        });
        if (player == null) {
            db.sequelize.transaction(t => {
                return db.Models.Character.findOne({ where: {id: id} , transaction: t}).then( character => {
                    character.bank = character.bank + number;
                    return character.save({transaction: t});
                });
            }).then(result => {
                logger.log(`+${number}$ BANK | ${reason}`, "money", id);
                callback(true);
            }).catch(err => {
                callback(false);
            });
        }
        else {
            this.addMoney(player, number, callback, reason);
        }
    },
    removeCash(player, number, callbackT, reason = "") {
        if (typeof player == 'number') return this.removeCashById(player, number, callbackT, reason);
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        };
        number = parseInt(number);
        if (isNaN(number)) return callback(false);
        if (number < 0 || number > 1000000000) return callback(false);
        if (player == null) return callback(false);
        if (player.character == null) return callback(false);

        let cash = player.character.cash;
        db.sequelize.transaction(t => {
            if (player.character.cash < number) throw new Error();
            player.character.cash = player.character.cash - number;
            return player.character.save({transaction: t});
        }).then(result => {
            this.changing(player);
            logger.log(`-${number}$ CASH | ${reason}`, "money", player);
            callback(true);
        }).catch(err => {
            if (cash != null) {
                player.character.cash = cash;
            }
            callback(false);
        });
    },
    removeCashById(id, number, callbackT, reason = "") {
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        }
        id = parseInt(id);
        number = parseInt(number);
        if (isNaN(number) || isNaN(id)) return callback(false);
        if (number < 0 || number > 1000000000 || id < 0 || id > 100000000) return callback(false);

        let player = mp.players.toArray().find( player => {
            if(player.character) {
                return player.character.id == id;
            }
            else {
                return false;
            }
        });
        if (player == null) {
            db.sequelize.transaction(t => {
                return db.Models.Character.findOne({ where: {id: id} , transaction: t}).then( character => {
                    if (character.cash < number) throw new Error();
                    character.cash = character.cash - number;
                    return character.save({transaction: t});
                });
            }).then(result => {
                logger.log(`-${number}$ CASH | ${reason}`, "money", id);
                callback(true);
            }).catch(err => {
                callback(false);
            });
        }
        else {
            this.removeCash(player, number, callback, reason);
        }
    },
    removeMoney(player, number, callbackT, reason = "") {
        if (typeof player == 'number') return this.removeMoneyById(player, number, callbackT, reason);
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        }
        number = parseInt(number);
        if (isNaN(number)) return callback(false);
        if (number < 0 || number > 1000000000) return callback(false);
        if (player == null) return callback(false);
        if (player.character == null) return callback(false);

        let bank = player.character.bank;
        db.sequelize.transaction(t => {
            if (player.character.bank < number) throw new Error();
            player.character.bank = player.character.bank - number;
            return player.character.save({transaction: t});
        }).then(result => {
            this.changing(player);
            logger.log(`-${number}$ BANK | ${reason}`, "money", player);
            callback(true);
        }).catch(err => {
            if (bank != null) {
                player.character.bank = bank;
            }
            callback(false);
        });
    },
    removeMoneyById(id, number, callbackT, reason = "") {
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        }
        id = parseInt(id);
        number = parseInt(number);
        if (isNaN(number) || isNaN(id)) return callback(false);
        if (number < 0 || number > 1000000000 || id < 0 || id > 100000000) return callback(false);

        let player = mp.players.toArray().find( player => {
            if (player.character) {
                return player.character.id == id;
            }
            else {
                return false;
            }
        });
        if (player == null) {
            db.sequelize.transaction(t => {
                return db.Models.Character.findOne({ where: {id: id} , transaction: t}).then(character => {
                    if (character.bank < number) throw new Error();
                    character.bank = character.bank - number;
                    return character.save({transaction: t});
                });
            }).then(result => {
                logger.log(`-${number}$ BANK | ${reason}`, "money", id);
                callback(true);
            }).catch(err => {
                callback(false);
            });
        }
        else {
            this.removeMoney(player, number, callback, reason);
        }
    },
    /// Для ироков, которые онлайн
    moveCash(playerFrom, playerTo, number, callbackT, reasonFrom = "", reasonTo = "") {
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        }
        number = parseInt(number);
        if (isNaN(number)) return callback(false);
        if (number < 0 || number > 1000000000) return callback(false);
        if (playerFrom == null || playerTo == null) return callback(false);
        if (playerFrom.character == null || playerTo.character == null) return callback(false);

        let cashFrom = playerFrom.character.cash;
        let cashTo = playerTo.character.cash;
        db.sequelize.transaction(t => {
            if (playerFrom.character.cash < number) throw new Error();
            playerFrom.character.cash = playerFrom.character.cash - number;
            playerTo.character.cash = playerTo.character.cash + number;
            return Promise.all([
                playerTo.character.save({transaction: t}),
                playerFrom.character.save({transaction: t})
            ]);
        }).then(result => {
            this.changing(playerFrom);
            this.changing(playerTo);
            logger.log(`-${number}$ CASH | ${reasonFrom}`, "money", playerFrom);
            logger.log(`+${number}$ CASH | ${reasonTo}`, "money", playerTo);
            callback(true);
        }).catch(err => {
            if (cashFrom != null) {
                playerFrom.character.cash = cashFrom;
            }
            if (cashTo != null) {
                playerTo.character.cash = cashTo;
            }
            callback(false);
        });
    },
    moveMoneyById(idFrom, idTo, number, callbackT, reasonFrom = "", reasonTo = "") {
        if (callbackT == null) return;
        let callback = (result) => {
            try {
                callbackT(result);
            }
            catch(e) {
                console.log(e);
            }
        };

        idFrom = parseInt(idFrom);
        idTo = parseInt(idTo);
        number = parseInt(number);
        if (isNaN(number) || isNaN(idFrom) || isNaN(idTo)) return callback(false);
        if (number < 0 || number > 1000000000 || idFrom < 0 || idFrom > 100000000 || idTo < 0 || idTo > 100000000) return callback(false);

        let playerFrom = mp.players.toArray().find(player => {
            if (player.character) {
                return player.character.id == idFrom;
            }
            else {
                return false;
            }
        });
        let playerTo = mp.players.toArray().find(player => {
            if (player.character) {
                return player.character.id == idTo;
            }
            else {
                return false;
            }
        });
        let bankFrom = null;
        if (playerFrom != null && playerFrom.character != null) bankFrom = playerFrom.character.bank;
        let bankTo = null;
        if (playerTo != null && playerTo.character != null) bankTo = playerTo.character.bank;

        db.sequelize.transaction(t => {
            if ((playerFrom != null && playerFrom.character != null) && (playerTo != null && playerTo.character != null)) {
                if (playerFrom.character.bank < number) throw new Error();
                playerFrom.character.bank = playerFrom.character.bank - number;
                playerTo.character.bank = playerTo.character.bank + number;
                return Promise.all([
                    playerFrom.character.save({transaction: t}),
                    playerTo.character.save({transaction: t})
                ]);
            }
            if ((playerFrom != null && playerFrom.character != null) && (playerTo == null || playerTo.character == null)) {
                if (playerFrom.character.bank < number) throw new Error();
                playerFrom.character.bank = playerFrom.character.bank - number;
                return Promise.all([
                    playerFrom.character.save({transaction: t}),
                    db.Models.Character.findOne({ where: {id: idTo} , transaction: t}).then(character => {
                        character.bank = character.bank + number;
                        return character.save({transaction: t});
                    })
                ]);
            }
            if ((playerFrom == null || playerFrom.character == null) && (playerTo != null && playerTo.character != null)) {
                playerTo.character.bank = playerTo.character.bank + number;
                return Promise.all([
                    db.Models.Character.findOne({ where: {id: idFrom} , transaction: t}).then(character => {
                        if (character.bank < number) throw new Error();
                        character.bank = character.bank - number;
                        return character.save({transaction: t});
                    }),
                    playerTo.character.save({transaction: t})
                ]);
            }
            if ((playerFrom == null || playerFrom.character == null) && (playerTo == null || playerTo.character == null)) {
                return Promise.all([
                    db.Models.Character.findOne({ where: {id: idFrom} , transaction: t}).then(character => {
                        if (character.bank < number) throw new Error();
                        character.bank = character.bank - number;
                        return character.save({transaction: t});
                    }),
                    db.Models.Character.findOne({ where: {id: idTo} , transaction: t}).then(character => {
                        character.bank = character.bank + number;
                        return character.save({transaction: t});
                    })
                ]);
            }
            throw new Error();
        }).then(result => {
            playerFrom != null && playerFrom.character != null && this.changing(playerFrom);
            playerTo != null && playerTo.character != null && this.changing(playerTo);
            if (playerFrom != null && playerFrom.character != null) {
                logger.log(`-${number}$ BANK | ${reasonFrom}`, "money", playerFrom);
            }
            else {
                logger.log(`-${number}$ BANK | ${reasonFrom}`, "money", idFrom);
            }
            if(playerTo != null && playerTo.character != null) {
                logger.log(`+${number}$ BANK | ${reasonTo}`, "money", playerTo);
            }
            else {
                logger.log(`+${number}$ BANK | ${reasonTo}`, "money", idTo);
            }
            callback(true);
        }).catch(err => {
            if (bankFrom != null) {
                playerFrom.character.bank = bankFrom;
            }
            if (bankTo != null) {
                playerTo.character.bank = bankTo;
            }
            callback(false);
        });
    },
    changing(player) {
        bank.updateBank(player);
        player.call("money.change", [player.character.cash, player.character.bank]);
    }
};
