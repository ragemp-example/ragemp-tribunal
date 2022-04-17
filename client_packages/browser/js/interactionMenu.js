var interactionMenu = new Vue({
    el: "#interactionMenu",
    data: {
        show: false,
        // Возможность использования
        enable: true,
        left: 80, /// сдвиг от левой части экрана
        // Текущее меню
        menu: null,
        menus: {
            "vehicle": {
                name: "vehicle", // название меню
                items: [{
                        text: "Двери",
                        icon: "key.png"
                    },
                    {
                        text: "Капот",
                        icon: "hood.png"
                    },
                    {
                        text: "Багажник",
                        icon: "trunk.png"
                    },
                    {
                        text: "Ремонт",
                        icon: "tool.png"
                    }
                ],
                handler(index) {
                    var item = this.items[index];
                    if (item.text == 'Двери') {
                        mp.trigger(`vehicles.lock`);
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Капот') {
                        mp.trigger(`vehicles.hood`);
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Багажник') {
                        mp.trigger(`vehicles.trunk`);
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Диагностика') {
                        mp.trigger(`carservice.diagnostics.offer`);
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Взломать') {
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Ремонт') {
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'FIB') {
                        interactionMenu.menu = interactionMenu.menus["fib_vehicle"];
                    }
                    if (item.text == 'Вытащить') {
                        mp.trigger(`interaction.police.ejectlist.get`);
                        //mp.trigger(`interaction.menu.close`);
                    }
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                }
            },
            "vehicle_inside": {
                name: "vehicle_inside", // название меню
                items: [{
                        text: "Двери",
                        icon: "key.png"
                    },
                    {
                        text: "Вытолкнуть",
                        icon: "eject.png"
                    },
                    {
                        text: "Автопилот",
                        icon: "gps.svg"
                    },
                ],
                handler(index) {
                    var item = this.items[index];
                    if (item.text == 'Двери') {
                        mp.trigger(`vehicles.lock`);
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Вытолкнуть') {
                        mp.trigger(`interaction.ejectlist.get`);
                        //mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Звук сирены') {
                        mp.trigger(`vehicles.siren.sound`);
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Продать Т/С') {
                        mp.trigger(`interaction.menu.close`);
                        mp.trigger(`vehicles.sell.show`);
                    }
                    if (item.text == 'Автопилот') {
                        mp.trigger(`vehicles.autopilot`);
                        mp.trigger(`interaction.menu.close`);
                    }
                }
            },
            "vehicle_ejectlist": {
                name: "vehicle_ejectlist",
                items: [],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interaction.eject`, index);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "police_ejectlist": {
                name: "police_ejectlist",
                items: [],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interaction.police.eject`, index);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "player_ownmenu": {
                name: "player_ownmenu",
                items: [{
                        text: "Мои документы",
                        icon: "doc.png"
                    },
                    {
                        text: "Мой транспорт",
                        icon: "vehicle.svg"
                    },
                    {
                        text: "Мои призы",
                        icon: "dice.svg"
                    },
                    {
                        text: "Анимации",
                        icon: "activity.png"
                    }
                ],
                handler(index) {
                    var item = this.items[index];
                    if (item.text == 'Мои документы') {
                        mp.trigger(`documents.list`);
                        //mp.trigger(`interaction.menu.close`);
                    } else if (item.text == "Организация") {
                        mp.trigger(`interaction.menu.close`);
                        selectMenu.showByName("factionControl");
                    } else if (item.text == "Учения") {
                        mp.trigger(`interaction.menu.close`);
                        if (captureScore.show) return notifications.push(`error`, `Недоступно`);
                        mp.trigger(`callRemote`, `army.capture.start`);
                    } else if (item.text == "Захват") {
                        mp.trigger(`interaction.menu.close`);
                        if (captureScore.show) return notifications.push(`error`, `Недоступно`);
                        mp.trigger(`callRemote`, `bands.capture.start`);
                    } else if (item.text == "Захват биз.") {
                        mp.trigger(`interaction.menu.close`);
                        if (captureScore.show) return notifications.push(`error`, `Недоступно`);
                        mp.trigger(`callRemote`, `mafia.bizWar.show`);
                    } else if (item.text == "Эфир") {
                        mp.trigger(`interaction.menu.close`);
                        mp.trigger(`callRemote`, `news.stream`);
                    } else if (item.text == "Мой транспорт") {
                        mp.trigger(`interaction.menu.close`);
                        mp.trigger(`callRemote`, `vehicles.own.list.show`);
                    } else if (item.text == "Анимации") {
                        mp.trigger(`interaction.menu.close`);
                        selectMenu.showByName("animations");
                    } else if (item.text == "Мои призы") {
                        mp.trigger(`interaction.menu.close`);
                        mp.trigger(`callRemote`, `casino.prizes.show`);
                    } else if (item.text == 'Прослушивающее устройство') {
                        mp.trigger(`interaction.menu.close`);
                        selectMenu.menu = selectMenu.menus["fibWiretapping"];
                        selectMenu.show = true;
                    } else if (item.text == "Радар") {
                        mp.trigger(`interaction.menu.close`);
                        selectMenu.menu = selectMenu.menus["speedingRadars"];
                        selectMenu.show = true;
                    } else if (item.text == "Выйти из комнаты") {
                        mp.trigger(`callRemote`, `gungame.room.exit`);
                    }
                }
            },
            "player_interaction": {
                name: "player_interaction",
                items: [{
                        text: "Познакомиться",
                        icon: "hands.png"
                    },
                    {
                        text: "Документы",
                        icon: "doc.png"
                    },
                    {
                        text: "Деньги",
                        icon: "wallet.png"
                    }
                ],
                handler(index) {
                    var item = this.items[index];
                    if (item.text == 'Познакомиться') {
                        mp.trigger(`interaction.menu.close`);
                        mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                    } else if (item.text == 'Документы') {
                        mp.trigger(`documents.list`);
                    } else if (item.text == 'Деньги') {
                        //mp.trigger(`interaction.menu.close`);
                        mp.trigger(`interaction.menu.close`);
                        mp.trigger(`interaction.money.show`);

                    } else if (item.text == 'Организация') {
                        interactionMenu.menu = interactionMenu.menus["faction"];
                    } else if (item.text == 'Government') {
                        interactionMenu.menu = interactionMenu.menus["government"];
                    } else if (item.text == 'Police') {
                        interactionMenu.menu = interactionMenu.menus["police"];
                    } else if (item.text == 'FIB') {
                        interactionMenu.menu = interactionMenu.menus["fib"];
                    } else if (item.text == 'Hospital') {
                        interactionMenu.menu = interactionMenu.menus["hospital"];
                    } else if (item.text == 'Army') {
                        interactionMenu.menu = interactionMenu.menus["army"];
                    } else if (item.text == 'Weazel News') {
                        interactionMenu.menu = interactionMenu.menus["news"];
                    } else if (item.text == 'Band') {
                        interactionMenu.menu = interactionMenu.menus["band"];
                    } else if (item.text == 'Mafia') {
                        interactionMenu.menu = interactionMenu.menus["mafia"];
                    } else if (item.text == 'Бросить кости') {
                        mp.trigger(`interaction.menu.close`);
                        mp.trigger(`casino.dice.offer.create`);
                    }
                }
            },
            "player_docs": {
                name: "player_docs",
                items: [{
                        text: "Основные",
                        icon: "doc.png"
                    },
                    // {
                    //     text: "Лицензии на т/с",
                    //     icon: "doc.png"
                    // },
                    // {
                    //     text: "Паспорт т/с",
                    //     icon: "doc.png"
                    // },
                    // {
                    //     text: "Медкарта",
                    //     icon: "doc.png"
                    // },
                    {
                        text: "Удостоверение",
                        icon: "doc.png"
                    },
                    // {
                    //     text: "Лиц. на оружие",
                    //     icon: "gun.svg"
                    // },
                ],
                handler(index) {
                    var item = this.items[index];
                    if (item.text == 'Основные') {
                        mp.trigger(`documents.showTo`, "mainDocuments");
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Лицензии на т/с') {
                        mp.trigger(`documents.showTo`, "driverLicense");
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Паспорт т/с') {
                        mp.trigger(`documents.showTo`, "carPass");
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Медкарта') {
                        mp.trigger(`documents.showTo`, "medCard");
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Лиц. на оружие') {
                        mp.trigger(`documents.showTo`, "gunLicense");
                        mp.trigger(`interaction.menu.close`);
                    }
                    if (item.text == 'Удостоверение') {
                        mp.trigger(`documents.showTo`, "governmentBadge");
                        mp.trigger(`interaction.menu.close`);
                    }
                }
            },
            "carPass_list": {
                name: "carPass_list",
                items: [

                ],
                handler(index) {
                    var item = this.items[index];
                    let plate = item.text.split(' ')[1];
                    mp.trigger('documents.carPass.list.choose', plate);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "faction": {
                name: "faction",
                items: [{
                        text: "Пригласить",
                        icon: "invite.svg"
                    },
                    {
                        text: "Уволить",
                        icon: "uval.svg"
                    },
                    {
                        text: "Ранг",
                        icon: "rank.svg"
                    }
                ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "government": {
                name: "government",
                items: [
                    {
                        text: "Наручники",
                        icon: "cuffs.svg"
                    },
                    {
                        text: "Освобождение",
                        icon: "freedom.svg"
                    },
                    {
                        text: "Следование",
                        icon: "follow.svg"
                    },
                    {
                        text: "В авто",
                        icon: "vehicle.svg"
                    },
                    {
                        text: "Лиц. на оружие",
                        icon: "gun.svg"
                    },
                    {
                        text: "Лиц. на транспорт",
                        icon: "vehicle.svg"
                    },
                ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "police": {
                name: "police",
                items: [{
                        text: "Наручники",
                        icon: "cuffs.svg"
                    },
                    {
                        text: "Розыск",
                        icon: "wanted.svg"
                    },
                    {
                        text: "Обыск",
                        icon: "search.svg"
                    },
                    {
                        text: "Арест",
                        icon: "arrest.svg"
                    },
                    {
                        text: "Следование",
                        icon: "follow.svg"
                    },
                    {
                        text: "Лиц. на оружие",
                        icon: "gun.svg"
                    },
                    {
                        text: "В авто",
                        icon: "vehicle.svg"
                    },
                ],
                handler(index) {
                    var item = this.items[index];
                    if (item.text == 'Лиц. на оружие') return interactionMenu.showByName("police_gunlicense");
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "police_gunlicense": {
                name: "police_gunlicense",
                items: [
                    // {
                    //     text: "Выдать",
                    // },
                    {
                        text: "Изъять",
                    },
                ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "fib": {
                name: "fib",
                items: [{
                        text: "Наручники",
                        icon: "cuffs.svg"
                    },
                    {
                        text: "Розыск",
                        icon: "wanted.svg"
                    },
                    {
                        text: "Обыск",
                        icon: "search.svg"
                    },
                    {
                        text: "Арест",
                        icon: "arrest.svg"
                    },
                    {
                        text: "Следование",
                        icon: "follow.svg"
                    },
                    // {
                    //     text: "Прослушка",
                    //     icon: "headphones.svg"
                    // },
                    {
                        text: "В авто",
                        icon: "vehicle.svg"
                    },
                ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "fib_vehicle": {
                name: "fib_vehicle",
                items: [{
                    text: "Номер",
                }, ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "hospital": {
                name: "hospital",
                items: [{
                        text: "Лечить",
                        icon: "heal.svg"
                    },
                    {
                        text: "Реанимировать",
                        icon: "reanimate.svg"
                    },
                    {
                        text: "Медкарта",
                        icon: "doc.png"
                    },
                ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                    mp.trigger(`interaction.menu.close`);
                }
            },
            "army": {
                name: "army",
                items: [{
                        text: "Наручники",
                        icon: "cuffs.svg"
                    },
                    {
                        text: "Следование",
                        icon: "follow.svg"
                    },
                    {
                        text: "В авто",
                        icon: "vehicle.svg"
                    },
                    {
                        text: "Обыск",
                        icon: "search.svg"
                    },
                ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interaction.menu.close`);
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                }
            },
            "news": {
                name: "news",
                items: [{
                    text: "Эфир",
                    icon: "stream.svg"
                }],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interaction.menu.close`);
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                }
            },
            "band": {
                name: "band",
                items: [
                    {
                    text: "Ограбить",
                    icon: "rob.svg"
                },
                    {
                        text: "Связать",
                        icon: "rope.svg"
                    },
                    {
                        text: "Вести",
                        icon: "follow.svg"
                    },
                    {
                        text: "Мешок на голову",
                        icon: "hide.svg"
                    },
                    {
                        text: "В авто",
                        icon: "vehicle.svg"
                    },
            ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interaction.menu.close`);
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                }
            },
            "mafia": {
                name: "mafia",
                items: [{
                        text: "Продать крышу",
                        icon: "roof.svg"
                    },
                    {
                        text: "Ограбить",
                        icon: "rob.svg"
                    },
                    {
                        text: "Связать",
                        icon: "rope.svg"
                    },
                    {
                        text: "Вести",
                        icon: "follow.svg"
                    },
                    {
                        text: "Мешок на голову",
                        icon: "hide.svg"
                    },
                    {
                        text: "В авто",
                        icon: "vehicle.svg"
                    },
                ],
                handler(index) {
                    var item = this.items[index];
                    mp.trigger(`interaction.menu.close`);
                    mp.trigger(`interactionMenu.onClick`, this.name, item.text);
                }
            },
        },
        faction: null,
        hasHeadBag: false,
        room: false
    },
    methods: {
        imgSrc(index) {
            var item = this.menu.items[index];
            var icon = item.icon || "default.svg";
            return "img/interactionMenu/" + icon;
        },
        onClick(index) {
            this.menu.handler(index);
        },
        showByName(name) {
            var menu = this.menus[name];
            if (!menu) return;
            this.menu = menu;
            this.show = true;
        },
        addItems(menuName, items) {
            if (typeof items == 'string') items = JSON.parse(items);
            if (!Array.isArray(items)) items = [items];
            var menu = this.menus[menuName];
            if (!menu) return;
            items.forEach(item => {
                this.deleteItem(menuName, item.text);
                menu.items.push(item);
            });
        },
        deleteItem(menuName, itemText) {
            var menu = this.menus[menuName];
            if (!menu) return;
            for (var i = 0; i < menu.items.length; i++) {
                var item = menu.items[i];
                if (item.text == itemText) {
                    menu.items.splice(i, 1);
                    i--;
                }
            }
        },
    },
    watch: {
        enable(val) {
            if (!val) this.show = false;
        },
        show(val) {
            if (val) busy.add("interaction", true, true);
            else busy.remove("interaction", true);
        },
        faction(val) {
            if (!val) {
                this.deleteItem("player_interaction", "Организация");
                this.deleteItem("player_interaction", "Government");
                this.deleteItem("player_interaction", "Police");
                this.deleteItem("player_interaction", "FIB");
                this.deleteItem("player_interaction", "Hospital");
                this.deleteItem("player_interaction", "Army");
                this.deleteItem("player_interaction", "Weazel News");
                this.deleteItem("player_interaction", "Band");
                this.deleteItem("player_interaction", "Mafia");
                this.deleteItem("player_ownmenu", "Организация");
                this.deleteItem("player_ownmenu", "Учения");
                this.deleteItem("player_ownmenu", "Захват");
                this.deleteItem("player_ownmenu", "Захват биз.");
                this.deleteItem("player_ownmenu", "Эфир");
                this.deleteItem("player_ownmenu", "Прослушивающее устройство");
                this.deleteItem("player_ownmenu", "Радар");
                this.deleteItem("vehicle", "FIB");
                this.deleteItem("vehicle", "Взломать");
                return;
            }
            this.addItems("player_interaction", {
                text: "Организация",
                icon: "faction.svg"
            });
            this.addItems("player_ownmenu", {
                text: "Организация",
                icon: "faction.svg"
            });

            if (val == 1) { // government
                this.addItems("player_interaction", {
                    text: "Government",
                    icon: "government.svg"
                });
            } else this.deleteItem("player_interaction", "Government");


            if (val == 2 || val == 3) { // police
                this.addItems("player_interaction", {
                    text: "Police",
                    icon: "police.svg"
                });
                this.addItems("vehicle", {
                    text: "Вытащить",
                    icon: "eject.png"
                });
                this.addItems("player_ownmenu", {
                    text: "Радар",
                    icon: "police.svg"
                });
            } else {
                this.deleteItem("player_interaction", "Police");
                this.deleteItem("vehicle", "Вытащить");
                this.deleteItem("player_ownmenu", "Радар");
            }

            if (val == 4) { // fib
                this.addItems("player_interaction", {
                    text: "FIB",
                    icon: "fib.svg"
                });
                this.addItems("vehicle", {
                    text: "FIB",
                    icon: "fib.svg"
                });
                this.addItems("player_ownmenu", {
                    text: "Прослушивающее устройство",
                    icon: "headphones.svg"
                });
            } else {
                this.deleteItem("player_interaction", "FIB");
                this.deleteItem("vehicle", "FIB");
                this.deleteItem("player_ownmenu", "Прослушивающее устройство");
            }

            if (val == 5) { // hospital
                this.addItems("player_interaction", {
                    text: "Hospital",
                    icon: "hospital.svg"
                });
            } else this.deleteItem("player_interaction", "Hospital");

            if (val == 6 || val == 15) { // army
                this.addItems("player_interaction", {
                    text: "Army",
                    icon: "army.svg"
                });
            } else {
                this.deleteItem("player_interaction", "Army");
                this.deleteItem("player_ownmenu", "Учения");
            }

            if (val == 7) { // news
                this.addItems("player_interaction", {
                    text: "Weazel News",
                    icon: "news.svg"
                });
                this.addItems("player_ownmenu", {
                    text: "Эфир",
                    icon: "stream.svg"
                });
            } else {
                this.deleteItem("player_interaction", "Weazel News");
                this.deleteItem("player_ownmenu", "Эфир");
            }

            if ((val >= 8 && val <= 11) || val == 16) { // bands
                this.addItems("player_interaction", {
                    text: "Band",
                    icon: "band.svg"
                });
                this.addItems("player_ownmenu", {
                    text: "Захват",
                    icon: "war.svg"
                });

            } else {
                this.deleteItem("player_interaction", "Band");
                this.deleteItem("player_ownmenu", "Захват");
            }

            if ((val >= 12 && val <= 14) || val == 17) { // mafia
                this.addItems("player_interaction", {
                    text: "Mafia",
                    icon: "mafia.svg"
                });
                this.addItems('player_ownmenu', {
                    text: "Захват биз.",
                    icon: "war.svg"
                });
            } else {
                this.deleteItem("player_interaction", "Mafia");
                this.deleteItem('player_ownmenu', "Захват биз.");
            }

            if ((val >= 8 && val <= 14) || val == 16 || val == 17) {
                this.addItems("vehicle", {
                    text: "Взломать",
                    icon: "rob.svg"
                });
            } else {
                this.deleteItem("vehicle", "Взломать");
            }
        },
        hasHeadBag(val) {
            if (val) {
                var item = {
                    text: "Снять мешок",
                    icon: "hide.svg",
                };
                this.addItems("police", item);
                this.addItems("fib", item);
            } else {
                this.deleteItem("police", "Снять мешок");
                this.deleteItem("fib", "Снять мешок");
            }
        },
        room(val) {
            if (val) {
                this.addItems("player_ownmenu", {
                    text: "Выйти из комнаты",
                    icon: "faction.svg"
                });
            } else {
                this.deleteItem("player_ownmenu", "Выйти из комнаты");
            }
        }
    },
});

// for tests
// Для своего меню необходимо создать след. структуру (комментарии внутри):
// var testMenu = {
//     name: "test", // название меню
//     items: [{
//             text: "Познакомиться", // текст пункта меню
//             icon: "handshake.png" // иконка пункта меню (необяз.)
//         },
//         {
//             text: "Обмен"
//         },
//         {
//             text: "Документы",
//             icon: "doc.png"
//         },
//         {
//             text: "Новый пункт"
//         }
//     ],
//     handler(index) { // обработчик кликов на пункт меню
//         var item = this.items[index];
//         console.log(`Кликнули на пункт: ${item.text}`);
//     }
// };
// // Далее, присвоить эту структуру модулю interactionMenu:
// interactionMenu.menu = testMenu;
// // Показываем меню:
// interactionMenu.show = true;
