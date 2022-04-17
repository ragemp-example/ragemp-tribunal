"use strict";
mp.notify = {
    success(text, header) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`notifications.success(\`${text}\`, \`${header}\`)`);
    },
    warning(text, header) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`notifications.warning(\`${text}\`, \`${header}\`)`);
    },
    error(text, header) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`notifications.error(\`${text}\`, \`${header}\`)`);
    },
    info(text, header) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`notifications.info(\`${text}\`, \`${header}\`)`);
    },
    addCash(text, header) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`notifications.addCash(\`${text}\`, \`${header}\`)`);
    },
    removeCash(text, header) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`notifications.removeCash(\`${text}\`, \`${header}\`)`);
    },
    addMoney(text, header) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`notifications.addMoney(\`${text}\`, \`${header}\`)`);
    },
    removeMoney(text, header) {
        if (typeof text == 'object') text = JSON.stringify(text);
        mp.callCEFV(`notifications.removeMoney(\`${text}\`, \`${header}\`)`);
    },
};



mp.events.add({
    "notifications.push.success": mp.notify.success,
    "notifications.push.warning": mp.notify.warning,
    "notifications.push.error": mp.notify.error,
    "notifications.push.info": mp.notify.info,
});
