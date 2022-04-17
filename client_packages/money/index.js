"use strict";

var prevCash = null,
    prevBank = null;

mp.events.add('money.change', (cash, bank) => {
    mp.events.call('hud.setData', {
        cash: cash,
        bank: bank
    });

    if (prevCash != null && prevBank != null) {
        if (prevCash < cash) mp.notify.addCash(`+$${cash - prevCash}`, `Наличные`);
        else if (prevCash > cash) mp.notify.removeCash(`-$${prevCash - cash}`, `Наличные`);

        if (prevBank < bank) mp.notify.addMoney(`+$${bank - prevBank}`, `Банк`);
        else if (prevBank > bank) mp.notify.removeMoney(`-$${prevBank - bank}`, `Банк`);
    }

    prevCash = cash;
    prevBank = bank;
});
