"use strict";

mp.events.add('bank.phoneApp.show', () => {
    mp.events.callRemote('bank.phoneApp.show', []);
});

mp.events.add('bank.phoneApp.show.ans', (info) => {
    mp.callCEFR('bank.phoneApp.show.ans', [info]);
});