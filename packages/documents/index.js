"use strict";

const PASS_ID = 180182000000;
const CARPASS_ID = 1703190000;
const LIC_ID = 7501000000;
const GUNLIC_ID = 0;
const MEDCARD_ID = 828410000000;
const BADGE_ID = 10000;

module.exports = {
    fibLeaderSign: "Bizns Men",
    async init() {
    },
    getPassIdentificator() {
        return PASS_ID;
    },
    getCarPassIdentificator() {
        return CARPASS_ID;
    },
    getLicIdentificator() {
        return LIC_ID;
    },
    getGunLicIdentificator() {
        return GUNLIC_ID;
    },
    getMedCardIdentificator() {
        return MEDCARD_ID;
    },
    getBadgeIdentificator() {
        return BADGE_ID;
    },
}