"use strict";

mp.government = {
    bizModules: [],
    showServiceSelectMenu(data) {
        var items = [];
        data.fines.forEach(fine => {
            items.push({
                text: `Штраф #${fine.id}`
            });
        });
        items.push({
            text: "Вернуться"
        });
        mp.callCEFV(`selectMenu.setItems('governmentServiceFines', ${JSON.stringify(items)})`);
        mp.callCEFV(`selectMenu.setProp('governmentServiceFines', 'fines', ${JSON.stringify(data.fines)})`);

        var items = [];
        data.vehicles.forEach(veh => {
            items.push({
                text: veh.name,
                values: [veh.plate]
            });
        });
        items.push({
            text: "Вернуться"
        });
        mp.callCEFV(`selectMenu.menus['governmentServiceChangeName'].items[1].values = ['$${data.changeNamePrice}']`);
        mp.callCEFV(`selectMenu.setItems('governmentServiceVehKeys', ${JSON.stringify(items)})`);

        mp.callCEFV(`selectMenu.showByName('governmentService')`);
    },
    showTaxSelectMenu(data) {
        let items = [{
            text: 'Бизнес',
            values: []
        },
        {
            text: 'Множитель налога',
            values: [0.0001, 0.0002, 0.0005, 0.0007, 0.001, 0.002, 0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05],
        },
        {
            text: 'Сохранить'
        },
        {
            text: 'Закрыть'
        },
        ];
        items[0].values = data.map(x => x.name);
        mp.callCEFV(`selectMenu.setItems('governmentTax', ${JSON.stringify(items)})`);

        mp.callCEFV(`selectMenu.showByName('governmentTax')`);
    },
};

mp.events.add({
    "government.service.showMenu": (data) => {
        mp.government.showServiceSelectMenu(data);
    },
    "government.tax.showMenu": (data) => {
        mp.government.bizModules = data;
        mp.government.showTaxSelectMenu(data);
    },
    "government.tax.set": (id, value) => {
        mp.events.callRemote('government.tax.set', mp.government.bizModules[id].module, value);
    },
    "government.treasury.menu.show": (cash) => {
        mp.callCEFV(`selectMenu.menus["governmentTreasury"].items[0].values = ['$${cash}']`);
        mp.events.call('selectMenu.show', 'governmentTreasury');
    },
    "government.treasury.cash.send.finish": () => {
        mp.callCEFV('selectMenu.loader = false');
    },
    "government.treasury.donate.finish": () => {
        mp.callCEFV('selectMenu.loader = false');
    }
});
