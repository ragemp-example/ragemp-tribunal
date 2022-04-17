"use strict";

let isActive = false;
let isNearMicrophone = false;

mp.events.add('characterInit.done', () => {
    mp.speechChannel.addChannel('microphone', 40, false, true, 1.0, true);
    mp.keys.bind(0x42, true, function () {                  // B
        if (!isActive) {
            if (isNearMicrophone) {
                mp.speechChannel.setAutoConnectionChannel('microphone', true);
                isActive = true;
                mp.notify.info("Микрофон включен", "Громкоговоритель");
            }
        } else {
            mp.speechChannel.setAutoConnectionChannel('microphone', false);
            isActive = false;
            mp.notify.info("Микрофон выключен", "Громкоговоритель");
        }
    });
});

mp.events.add("microphone.enter", () => {
    isNearMicrophone = true;
});

mp.events.add("microphone.exit", () => {
    isNearMicrophone = false;

    if (isActive) {
        mp.speechChannel.setAutoConnectionChannel('microphone', false);
        isActive = false;
        mp.notify.info("Микрофон выключен", "Громкоговоритель");
    }
});