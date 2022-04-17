"use strict";
/// Функции модуля авторизации
const bcrypt = require('bcryptjs');

let emailCodes = new Map();
module.exports = {
    startCoinsBouns: 1000,
    accountIsOnline(id) {
        if (!id) return false;
        mp.players.forEach((player) => {
            if (player.account && player.account.id == id) return true;
        });
        return false;
    },
    getEmailCodes() {
        return emailCodes;
    },
    getEmailCode(email) {
        return emailCodes.get(email);
    },
    setEmailCodes(emailCodesTemp) {
        emailCodes = emailCodesTemp;
    },
    setEmailCode(email, code) {
        emailCodes.set(email, code);
    },
    hashPassword(passwordNotHashed) {
        return bcrypt.hashSync(passwordNotHashed, bcrypt.genSaltSync(3));
    },
    comparePassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    },
};
