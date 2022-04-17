"use strict";

let dataArray = new Array();

mp.events.add("economy.show", (infoArray) => {
    if (mp.busy.includes()) return;
    if (!mp.busy.add('economy', false)) return;
    infoArray = JSON.parse(infoArray);
    let items = "";
    dataArray = infoArray;
    infoArray.forEach(element => {
        items += `{
            text: "${element.name}"
        },`;
    });
    mp.callCEFV(`selectMenu.menu = {
        name: "economy",
        header: "Экономические показатели",
        items: [${items}
        {
            text: "Закрыть"
        }],
        i: 0,
        j: 0,
        handler(eventName) {
            var item = this.items[this.i];
            var e = {
                menuName: this.name,
                itemName: item.text,
                itemIndex: this.i,
                itemValue: (item.i != null && item.values) ? item.values[item.i] : null,
                valueIndex: item.i,
            };
            if (eventName == 'onItemSelected') {
                if (e.itemName == 'Закрыть') {
                    selectMenu.show = false;
                    busy.remove("economy", true);
                }
                else {
                    mp.trigger("economy.show.module", e.itemName);
                }
            }
        }
    };`);
    mp.callCEFV(`selectMenu.show = true;`);
});

mp.events.add("economy.show.module", (name) => {
    let items = "";
    let data = dataArray.find(x => x.name == name).info;
    data.forEach(element => {
        items += `{
            dataType: "${element.type}",
            text: "${element.name}",
            values: ["${element.value}"],
            description: "${element.description}",
            i: 0,
            type: "editable" // возможность редактирования значения пункта меню
        },`
    });
    mp.callCEFV(`selectMenu.menu = {
        name: "economy",
        header: "Экономические показатели",
        items: [${items}
        {
            text: "Сохранить"
        },
        {
            text: "Отмена"
        }],
        i: 0,
        j: 0,
        itemSelectNumber: 0,
        handler(eventName) {
            var item = this.items[this.i];
            var e = {
                menuName: this.name,
                itemName: item.text,
                itemIndex: this.i,
                itemValue: (item.i != null && item.values) ? item.values[item.i] : null,
                valueIndex: item.i,
            };
            if (eventName == 'onItemFocusChanged') {
                itemSelectNumber = 0;
                if (item.description) {
                    selectMenu.notification = item.description;
                }
                else {
                    selectMenu.notification = null;
                }
            }
            if (eventName == 'onItemSelected') {
                if (e.itemName == 'Сохранить') {
                    let data = [];
                    for(let i = 0; i < selectMenu.menu.items.length - 2; i++) {
                        data.push({type: selectMenu.menu.items[i].dataType, value: selectMenu.menu.items[i].values[0]});
                    }

                    selectMenu.show = false;
                    mp.trigger("economy.change", JSON.stringify(data));
                    return;
                }
                if (e.itemName == 'Отмена') {
                    selectMenu.show = false;
                    busy.remove("economy", true);
                    return;
                }
                itemSelectNumber++;
                if (itemSelectNumber > 1) {
                    let data = [];
                    for(let i = 0; i < selectMenu.menu.items.length - 2; i++) {
                        data.push({type: selectMenu.menu.items[i].dataType, value: selectMenu.menu.items[i].values[0]});
                    }

                    selectMenu.show = false;
                    mp.trigger("economy.change", JSON.stringify(data));
                }
            }
        }
    };`);
    mp.callCEFV(`selectMenu.notification = selectMenu.menu.items[0].description;`);
});

mp.events.add("economy.change", (data) => {
    mp.busy.remove('economy');
    mp.events.callRemote("economy.change", data);
});