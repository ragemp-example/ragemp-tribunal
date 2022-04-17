"use strict";

let allowed;

module.exports = {
    enabled: true, /// Включение/отключение вайтлиста
    isEnabled() {
        return this.enabled;
    },
    getAllowed() {
        return allowed;
    },
    async init() {
        await this.loadWhiteList();
    },
    async loadWhiteList() {
        allowed = await db.Models.WhiteList.findAll();
        console.log(`[WHITELIST] Загружено ${allowed.length} записей вайтлиста.`);
        console.log(`[WHITELIST] Вход ${this.enabled ? 'по вайтлисту': 'свободный'}.`);
    },
    isInWhiteList(socialClub) {
        let nick = allowed.find(x => x.socialClub == socialClub);
        return nick ? true : false;
    },
    pushToAllowed(record) {
        allowed.push(record);
    },
    removeFromAllowed(socialClub) {
        let index = allowed.findIndex(x => x.socialClub == socialClub);
        allowed.splice(index, 1);
    }
}
