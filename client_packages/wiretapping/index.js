"use strict";

mp.events.add("wiretapping.result", (status) => {
    if (!status) {
        mp.callCEFV(`selectMenu.menus["fibWiretapping"].items[0].type = "editable";`);
        mp.callCEFV(`selectMenu.menus["fibWiretapping"].items[1].text = "Подключиться";`);
    }
});

