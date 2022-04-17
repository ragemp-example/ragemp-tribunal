"use strict";
let factions = require('../factions');
let jobs = require('../jobs');
let notifs = require('../notifications');
let timer = call('timer');
let casino = call('casino');
let utils = call('utils');

let CUSTOM_TIME;
let ticks = 0;

module.exports = {
    minutesForBonus: 180,
    bonusChips: 500,
    init() {
        this.initPayDayTimer();
        this.updateWorldTime();
    },
    initPayDayTimer() {
        let lastPayDayHour = new Date().getHours();
        timer.addInterval(() => {
            try {
                ticks++;
                mp.events.call(`time.main.tick`, ticks);
                let date = new Date();
                this.updateWorldTime();
                if (date.getMinutes() >= 0 && date.getMinutes() <= 3 && date.getHours() != lastPayDayHour) {
                    lastPayDayHour = date.getHours();
                    this.payDay();
                }
            } catch (e) {
                console.log(e);
            }
        }, 60000);
    },
    payDay() {
        this.factionPay();
        this.jobsPay();
        this.allBroadcast();
        mp.events.call('payday.done');
    },
    allBroadcast() {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (rec.getVariable("afk")) return notifs.error(rec, `PayDay не засчитан`, `ANTI-AFK`);
            let minutes = parseInt((Date.now() - rec.authTime) / 1000 / 60);
            rec.authTime = Date.now();
            notifs.info(rec, `Вы отыграли ${minutes} минут`, `PayDay`)
            rec.character.minutes += minutes;
            rec.character.bonusMinutes += minutes;
            rec.character.law++;
            rec.character.save();
            if (rec.character.bonusMinutes >= this.minutesForBonus) {
                this.giveBonus(rec);
            }
            mp.events.call("player.law.changed", rec);
        });
    },
    updateWorldTime() {
        if (!CUSTOM_TIME) {
            let date = new Date();
            mp.world.time.hour = utils.getMoscowHours();
            mp.world.time.minute = date.getMinutes();
        }
    },
    factionPay() {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (rec.getVariable("afk")) return;
            if (rec.character.factionId) factions.pay(rec);
        });
    },
    jobsPay() {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (rec.getVariable("afk")) return;
            if (rec.character.pay) jobs.pay(rec);
        });
    },
    setCustomTime(hours) {
        mp.world.time.hour = hours;
        CUSTOM_TIME = hours;
    },
    resetCustomTime() {
        CUSTOM_TIME = null;
        this.updateWorldTime();
    },
    giveBonus(player) {
        if (!player.character) return;
        casino.addChips(player, this.bonusChips, `Бонус за отыгранные ${this.minutesForBonus} мин.`)
        notifs.success(player, `Вы отыграли ${parseInt(this.minutesForBonus / 60)} часа и получили ${this.bonusChips} фишек для казино!`, 'Бонус от Tribunal RP');
        player.character.bonusMinutes = 0;
        player.character.save();
    }
};
