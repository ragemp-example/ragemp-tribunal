"use strict";

mp.time = {
    lastMainTickTime: null,
    lastMinuteTickTime: null,

    mainTickTimer: null,
    minuteTickTimer: null,

    startMainTimer() {
        mp.timer.remove(this.mainTickTimer);
        this.mainTickTimer = mp.timer.addInterval(() => {
            mp.events.call("time.main.tick");
            this.lastMainTickTime = Date.now();
        }, 1000);
    },
    startMinuteTimer() {
        mp.timer.remove(this.minuteTickTimer);
        this.minuteTickTimer = mp.timer.addInterval(() => {
            mp.events.call("time.minute.tick");
            this.lastMinuteTickTime = Date.now();
        }, 60000);
    },
    initBinds() {
        mp.keys.bind(87, true, () => { // W
            this.checkTimerBroken();
        });
        mp.keys.bind(65, true, () => { // A
            this.checkTimerBroken();
        });
        mp.keys.bind(83, true, () => { // S
            this.checkTimerBroken();
        });
        mp.keys.bind(68, true, () => { // D
            this.checkTimerBroken();
        });
    },
    checkTimerBroken() {
        if (Date.now() - this.lastMainTickTime > 10000) this.startMainTimer();
        //if (Date.now() - this.lastMinuteTickTime > 70000) this.startMinuteTimer();
    },
};

mp.events.add("characterInit.done", () => {
    mp.time.startMainTimer();
    mp.time.startMinuteTimer();
    mp.time.initBinds();
});
