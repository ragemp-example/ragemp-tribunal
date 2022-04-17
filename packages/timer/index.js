"use strict";
/// Глобальный таймер

const duration = 1000;
let timers = [];
let gId = 0;

let checker = null;

let error = false;

/// Функции глобального таймера
module.exports = {
    // setChecker(player) {
    //     checker = player;
    //     if (checker != null) checker.call('timer.check.start', [duration]);
    // },
    // getChecker() {
    //     return checker;
    // },
    // throwError() {
    //     error = true;
    // },
    init() {
        setInterval(async function() {
            if (error) throw new Error("ТЕСТОВАЯ ОШИБКА");
            for (let i = 0; i < timers.length; i++) {
                try {
                    if (timers[i].time <= Date.now()) {
                        let handler = timers[i].handler;
                        let logId = timers[i].isLog ? timers[i].id : null;
                        if (timers[i].interval != null) {
                            timers[i].time += timers[i].interval;
                        }
                        else {
                            if (logId) {
                                console.log(`Timer with id ${logId} removed before work`);
                            }
                            timers.splice(i, 1);
                            i--;
                        }
                        if (logId) {
                            console.log(`Timer with id ${logId} start`);
                        }
                        handler();
                        if (logId) {
                            console.log(`Timer with id ${logId} done`);
                        }
                    }
                }
                catch (error) {
                    timers.splice(i, 1);
                    i--;
                    console.log(error);
                }
            }
            if (checker != null) checker.call('timer.check.work', []);
        }, duration);
    },
    /// Добавление нового таймера
    /// handler желательно async
    /// return timer
    add(handler, time, isInterval = false, isLog = false) {
        if (handler == null) throw new Error("handler is null");
        if (typeof handler != "function") throw new Error("handler is not a function");
        time = parseInt(time);
        if (isNaN(time)) throw new Error("time is NaN");
        if (isInterval == null) throw new Error("isInterval is null");
        if (time === 0) {
            if (isLog) console.log(`Timer with timeout = 0 done`);
            handler();
            return;
        }
        let id = gId++;
        if (isLog) {
            console.log(`Add timer ${JSON.stringify({
                id: id,
                handler: handler,
                time: Date.now() + time,
                interval: isInterval ? time : null,
                isLog: isLog
            })}`);
        }
        timers.push({
            id: id,
            handler: handler,
            time: Date.now() + time,
            interval: isInterval ? time : null,
            isLog: isLog
        });
        return {
            id: id
        };
    },
    /// Удаление существующего таймера, до его срабатывания
    remove(timer) {
        if (timer == null) return;
        if (timer.id == null) return;
        let index = timers.findIndex(x => x.id === timer.id);
        if (index !== -1) {
            if (timers[index].isLog) {
                console.log(`Remove timer with id ${timers[index].id}`);
            }
            timers.splice(index, 1);
        }
    },
    addInterval(handler, time) {
        return this.add(handler, time, true);
    },
};