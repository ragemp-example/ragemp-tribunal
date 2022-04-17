"use strict";

let isActive = false;
mp.events.add('characterInit.done', function () {
    mp.speechChannel.addChannel('speaker', 40, false, true, 1.0, true);
    mp.keys.bind(0x42, true, function () {                  // B
        if (!isActive) {
            if (mp.moduleVehicles.isInStateVehicle()) {
                mp.speechChannel.setAutoConnectionChannel('speaker', true);
                isActive = true;
                mp.notify.info("Громкоговоритель включен", "Громкоговоритель");
            }
        } else {
            mp.speechChannel.setAutoConnectionChannel('speaker', false);
            isActive = false;
            mp.notify.info("Громкоговоритель выключен", "Громкоговоритель");
        }
    });
});

mp.events.add("playerLeaveVehicle", (vehicle, seat) => {
    if (isActive) {
        mp.speechChannel.setAutoConnectionChannel('speaker', false);
        isActive = false;
        mp.notify.info("Громкоговоритель выключен", "Громкоговоритель");
    }
})