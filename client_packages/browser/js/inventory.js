var inventory = new Vue({
    el: '#inventory',
    data: {
        // Макс. вес предметов, переносимый игроком
        maxPlayerWeight: 30,
        // Общая информация о предметах
        itemsInfo: {
            1: {
                name: 'Очки',
                description: 'Описание очков.',
                height: 2,
                width: 3,
                weight: 0.1,
                chance: 50,
            },
            3: {
                name: 'Бронежилет',
                description: 'Описание броника.',
                height: 6,
                width: 8,
                weight: 10,
                chance: 50,
            },
            7: {
                name: 'Рубашка',
                description: 'Описание рубашки.',
                height: 5,
                width: 4,
                weight: 0.1,
                chance: 50,
            },
            8: {
                name: 'Штаны',
                description: 'Описание штанов.',
                height: 6,
                width: 8,
                weight: 0.1,
                chance: 50,
            },
            9: {
                name: 'Ботинки',
                description: 'Описание ботинков.',
                height: 3,
                width: 3,
                weight: 0.1,
                chance: 50,
            },
            13: {
                name: 'Сумка',
                description: 'Описание сумки.',
                height: 6,
                width: 8,
                weight: 2,
                chance: 50,
            },
            16: {
                name: 'Сигареты',
                description: 'Описание.',
                height: 2,
                width: 2,
                weight: 0.1,
                chance: 50,
            },
            18: {
                name: 'Фонарь SureFire G2 Nitrolon',
                description: 'Компактный, легкий и мощный фонарик, который можно использовать как подствольный целеуказатель.',
                height: 3,
                width: 4,
                weight: 2,
                chance: 50,
            },
            21: {
                name: 'Дробаш',
                description: 'Может стрелять.',
                height: 6,
                width: 8,
                weight: 2,
                chance: 50,
            },
            24: {
                name: 'Аптечка',
                description: 'Описание аптечки.',
                height: 6,
                width: 8,
                weight: 0.1,
                chance: 50,
            },
            37: {
                name: 'Патрон',
                description: 'Описание патрона.',
                height: 4,
                width: 4,
                weight: 0.02,
                chance: 50,
            },
            39: {
                name: 'Патрон',
                description: 'Описание патрона.',
                height: 4,
                width: 4,
                weight: 0.02,
                chance: 50,
            },
        },
        // Меню предмета по ПКМ
        itemsMenu: {
            // itemId: struct menu
            /*18: { // test
                'Включить': {
                    handler(item) {
                        console.log(`Включить ${item}`)
                    }
                }
            },*/
            4: { // прослушка
                'Установить': {
                    handler(item) {
                        var data = {
                            itemSqlId: item.sqlId
                        };
                        mp.trigger(`callRemote`, `fib.spy`, JSON.stringify(data));
                    }
                }
            },
            16: { // сигареты
                'Курить': {
                    handler(item) {
                        mp.trigger(`callRemote`, `inventory.item.smoke.use`, item.sqlId);
                    }
                }
            },
            24: { // малая аптечка
                'Вылечиться': {
                    handler(item) {
                        mp.trigger(`callRemote`, `inventory.item.med.use`, item.sqlId);
                    }
                }
            },
            25: { // пластырь
                'Вылечиться': {
                    handler(item) {
                        mp.trigger(`callRemote`, `inventory.item.patch.use`, item.sqlId);
                    }
                }
            },
            26: { // адреналин
                'Реанимировать': {
                    handler(item) {
                        var data = {
                            itemSqlId: item.sqlId,
                        };
                        // mp.trigger(`callRemote`, `inventory.item.adrenalin.use`, JSON.stringify(data));
                        mp.trigger(`inventory.item.adrenalin.use.callRemote`, JSON.stringify(data));
                    }
                }
            },
            27: { // большая аптечка
                'Вылечиться': {
                    handler(item) {
                        mp.trigger(`callRemote`, `inventory.item.med.use`, item.sqlId);
                    }
                }
            },
            28: { // наручники
                'Скрутить': {
                    handler(item) {
                        var data = {
                            cuffsSqlId: item.sqlId
                        };
                        // mp.trigger(`callRemote`, `police.cuffs`, JSON.stringify(data));
                        mp.trigger(`police.cuffs.callRemote`, JSON.stringify(data));
                    }
                }
            },
            // 4 типа наркотиков
            29: {
                'Употребить': {
                    handler(item) {
                        mp.trigger(`callRemote`, `inventory.item.drugs.use`, item.sqlId);
                    }
                }
            },
            30: {
                'Употребить': {
                    handler(item) {
                        mp.trigger(`callRemote`, `inventory.item.drugs.use`, item.sqlId);
                    }
                }
            },
            31: {
                'Употребить': {
                    handler(item) {
                        mp.trigger(`callRemote`, `inventory.item.drugs.use`, item.sqlId);
                    }
                }
            },
            32: {
                'Употребить': {
                    handler(item) {
                        mp.trigger(`callRemote`, `inventory.item.drugs.use`, item.sqlId);
                    }
                }
            },
            /*37: { // test
                'Разрядить': {
                    handler(item) {
                        console.log(`разрядить: ${item}`)
                    }
                },
                'Сломать': {
                    handler(item) {
                        console.log(`сломать ${item}`);
                    }
                },
                'Разобрать': {
                    items: {
                        'Полностью': {
                            handler(item) {
                                console.log(`Полностью ${item}`)
                            }
                        },
                        'Для переноски': {
                            handler(item) {
                                console.log(`для переноски ${item}`)
                            }
                        },
                    }
                },
                'Присоединить': {
                    handler(item) {
                        console.log(`Присоединить ${item}`);
                    }
                },
                'Отсоединить': {
                    handler(item) {
                        console.log(`Отсоединить ${item}`);
                    }
                },
            },*/
            // 4 типа патронов
            37: {
                'Зарядить': {
                    handler(item) {
                        // mp.trigger(`weapons.ammo.sync`, true);
                        mp.trigger(`callRemote`, `weapons.ammo.fill`, item.sqlId);
                    }
                }
            },
            38: {
                'Зарядить': {
                    handler(item) {
                        // mp.trigger(`weapons.ammo.sync`, true);
                        mp.trigger(`callRemote`, `weapons.ammo.fill`, item.sqlId);
                    }
                }
            },
            39: {
                'Зарядить': {
                    handler(item) {
                        // mp.trigger(`weapons.ammo.sync`, true);
                        mp.trigger(`callRemote`, `weapons.ammo.fill`, item.sqlId);
                    }
                }
            },
            40: {
                'Зарядить': {
                    handler(item) {
                        // mp.trigger(`weapons.ammo.sync`, true);
                        mp.trigger(`callRemote`, `weapons.ammo.fill`, item.sqlId);
                    }
                }
            },
            54: { // веревка
                'Связать': {
                    handler(item) {
                        var data = {
                            cuffsSqlId: item.sqlId
                        };
                        // mp.trigger(`callRemote`, `mafia.cuffs`, JSON.stringify(data));
                        mp.trigger(`mafia.cuffs.callRemote`, JSON.stringify(data));
                    }
                }
            },
            55: { // мешок
                'Надеть на голову': {
                    handler(item) {
                        var data = {
                            bagSqlId: item.sqlId
                        };
                        // mp.trigger(`callRemote`, `mafia.bag`, JSON.stringify(data));
                        mp.trigger(`mafia.bag.callRemote`, JSON.stringify(data));
                    }
                }
            },
            56: { // канистра
                'Заправить': {
                    handler(item) {
                        var data = {
                            sqlId: item.sqlId,
                            index: 0
                        };
                        mp.trigger(`callRemote`, `inventory.item.use`, JSON.stringify(data));
                    }
                },
                'Пополнить': {
                    handler(item) {
                        var data = {
                            sqlId: item.sqlId,
                            index: 1
                        };
                        mp.trigger(`callRemote`, `inventory.item.use`, JSON.stringify(data));
                    }
                },
                'Слить': {
                    handler(item) {
                        if (!item.params.litres) return notifications.error(`Канистра пустая`);
                        var data = {
                            sqlId: item.sqlId,
                            index: 2
                        };
                        mp.trigger(`callRemote`, `inventory.item.use`, JSON.stringify(data));
                    }
                },
            },
            139: { // спички
                'Костер': {
                    handler(item) {
                        var data = {
                            sqlId: item.sqlId,
                            index: 0
                        };
                        mp.trigger(`inventory.item.use.callRemote`, JSON.stringify(data));
                    }
                },
            },
        },
        // Вайт-лист предметов, которые можно надеть
        bodyList: {
            // columnIndex: [itemId, ...]
            0: [1],
            1: [6],
            2: [14],
            3: [2],
            4: [3],
            5: [7],
            6: [11],
            7: [10],
            8: [12],
            9: [], // автоматы
            10: [13],
            11: [8],
            12: [9],
            13: null
        },
        // Вайт-лист предметов, которые можно использовать в горячих клавишах
        hotkeysList: {
            // itemId: {...}
            4: { // прослушка
                handler(item) {
                    var data = {
                        itemSqlId: item.sqlId
                    };
                    mp.trigger(`callRemote`, `fib.spy`, JSON.stringify(data));
                }
            },
            16: { // сигареты
                handler(item) {
                    mp.trigger(`callRemote`, `inventory.item.smoke.use`, item.sqlId);
                }
            },
            24: { // малая аптечка
                handler(item) {
                    mp.trigger(`callRemote`, `inventory.item.med.use`, item.sqlId);
                }
            },
            25: { // пластырь
                handler(item) {
                    mp.trigger(`callRemote`, `inventory.item.patch.use`, item.sqlId);
                }
            },
            26: { // адреналин
                handler(item) {
                    var data = {
                        itemSqlId: item.sqlId,
                    };
                    // mp.trigger(`callRemote`, `inventory.item.adrenalin.use`, JSON.stringify(data));
                    mp.trigger(`inventory.item.adrenalin.use.callRemote`, JSON.stringify(data));
                }
            },
            27: { // большая аптечка
                handler(item) {
                    mp.trigger(`callRemote`, `inventory.item.med.use`, item.sqlId);
                }
            },
            28: { // наручники
                handler(item) {
                    var data = {
                        cuffsSqlId: item.sqlId
                    };
                    // mp.trigger(`callRemote`, `police.cuffs`, JSON.stringify(data));
                    mp.trigger(`police.cuffs.callRemote`, JSON.stringify(data));
                }
            },
            // наркотики
            29: {
                handler(item) {
                    mp.trigger(`callRemote`, `inventory.item.drugs.use`, item.sqlId);
                }
            },
            30: {
                handler(item) {
                    mp.trigger(`callRemote`, `inventory.item.drugs.use`, item.sqlId);
                }
            },
            31: {
                handler(item) {
                    mp.trigger(`callRemote`, `inventory.item.drugs.use`, item.sqlId);
                }
            },
            32: {
                handler(item) {
                    mp.trigger(`callRemote`, `inventory.item.drugs.use`, item.sqlId);
                }
            },
            // патроны
            37: {
                handler(item) {
                    mp.trigger(`callRemote`, `weapons.ammo.fill`, item.sqlId);
                }
            },
            38: {
                handler(item) {
                    mp.trigger(`callRemote`, `weapons.ammo.fill`, item.sqlId);
                }
            },
            39: {
                handler(item) {
                    mp.trigger(`callRemote`, `weapons.ammo.fill`, item.sqlId);
                }
            },
            40: {
                handler(item) {
                    mp.trigger(`callRemote`, `weapons.ammo.fill`, item.sqlId);
                }
            },
            54: { // веревка
                handler(item) {
                    var data = {
                        cuffsSqlId: item.sqlId
                    };
                    // mp.trigger(`callRemote`, `mafia.cuffs`, JSON.stringify(data));
                    mp.trigger(`mafia.cuffs.callRemote`, JSON.stringify(data));
                }
            },
            55: { // мешок
                handler(item) {
                    var data = {
                        bagSqlId: item.sqlId
                    };
                    // mp.trigger(`callRemote`, `mafia.bag`, JSON.stringify(data));
                    mp.trigger(`mafia.bag.callRemote`, JSON.stringify(data));
                }
            },
            56: { // канистра
                handler(item) {
                    var data = {
                        sqlId: item.sqlId,
                        index: (item.params.litres) ? 0 : 1
                    };
                    mp.trigger(`callRemote`, `inventory.item.use`, JSON.stringify(data));
                }
            },
            136: { // кирка
                handler(item) {}
            },
            139: { // спички
                handler(item) {
                    var data = {
                        sqlId: item.sqlId,
                        index: 0
                    };
                    mp.trigger(`inventory.item.use.callRemote`, JSON.stringify(data));
                }
            },
        },
        // Блек-лист предметов, которые не могут храниться в других предметах
        blackList: {
            // parentItemId: [cildItemId, ...]
            3: [13],
            7: [13],
            8: [13],
        },
        // Вайт-лист предметов, которые могут перетаскиваться друг на друга
        mergeList: {
            // parentItemId: [cildItemId, ...]
            // 9mm
            37: [20],
            // 12mm
            38: [48],
            // 7.62mm
            39: [21, 107],
            // 5.56mm
            40: [22, 99],
        },
        // Огнестрельные оружия
        weaponsList: [20, 21, 22, 41, 44, 46, 47, 48, 49, 50, 52, 80, 87, 88, 89, 90, 91, 93, 96, 99, 100, 107, 84],
        // Кидаемые оружия (гранаты, снежки)
        throwableWeaponsList: [117],
        // Еда
        eatList: [35, 126, 127, 128, 129, 132, 134, 147],
        // Напитки
        drinkList: [34, 130, 133],
        // Предметы, которые можно изымать при обыске
        takeSearchList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 125],
        // Предметы в окружении (земля, шкаф, багажник, холодильник, ...)
        environment: [],
        // Предметы на игроке (экипировка)
        equipment: {},
        // Предметы на горячих клавишах
        hotkeys: {},
        // Фокус мышки на горячей клавише
        hotkeyFocus: null,
        // Сытость игрока
        satiety: 0,
        // Жажда игрока
        thirst: 0,
        // Режим отладки
        debug: false,
        // Показ инвентаря на экране
        show: false,
        // Возможность использования инвентаря
        enable: false,
        // Возможность взаимодействия с предметами инвентаря
        controlEnable: true,
        // Время последнего открытия/закрытия (ms)
        lastShowTime: 0,
        // Показ описания предмета на экране
        itemDesc: {
            item: null,
            x: 0,
            y: 0
        },
        // Уведомление инвентаря
        itemNotif: {
            text: null,
            x: 0,
            y: 0
        },
        // Показ меню предмета на экране
        itemMenu: {
            item: null,
            x: 0,
            y: 0
        },
        // Показа переносимого предмета на экране
        itemDrag: {
            item: null,
            div: null,
            accessColumns: {
                placeSqlId: null,
                pocketI: null,
                deny: false,
                targetSqlId: null,
                columns: {},
                bodyFocus: null,
                hotkeyFocus: null,
                binFocus: false,
            },
            x: 0,
            y: 0
        },
        // Крутятся все предметы
        spin: false,
        // Блокировка слот рук
        handsBlock: false,
        // Последнее использование хоткея
        lastUseHotkey: 0,
        // Анти-флуд использования хоткея
        waitUseHotkey: 1000,
        // Анти-флуд на использование еды (ms)
        eatWaitTime: 30000,
        lastUseEat: 0,
        // Анти-флуд на использование напитка (ms)
        drinkWaitTime: 30000,
        lastUseDrink: 0,
        // Режим обыска
        searchMode: null,
        // Время исследования при обыске
        searchWait: 5000,
        // Таймер исследования при обыске
        searchTimer: null,
        // Список предметов для исследования при обыске
        searchList: [],
        // Время подсветки предмета как 'найден при обыске'
        foundTime: 60 * 1000,
    },
    computed: {
        commonWeight() {
            return this.getItemWeight(Object.values(this.equipment));
        },
        equipmentBusyColumns() {
            var cols = {};
            for (var i in this.equipment) {
                var equip = this.equipment[i];
                if (!equip.pockets) continue;
                cols[equip.sqlId] = {};
                for (var j in equip.pockets) {
                    var pocket = equip.pockets[j];
                    if (!Object.keys(pocket.items).length) continue;
                    cols[equip.sqlId][j] = {};
                    for (var index in pocket.items) {
                        var item = pocket.items[index];
                        var w = this.itemsInfo[item.itemId].width;
                        var h = this.itemsInfo[item.itemId].height;
                        var coord = this.indexToXY(pocket.rows, pocket.cols, index);
                        for (var x = 0; x < w; x++) {
                            for (var y = 0; y < h; y++) {
                                var i = this.xyToIndex(pocket.rows, pocket.cols, {
                                    x: coord.x + x,
                                    y: coord.y + y
                                });
                                cols[equip.sqlId][j][i] = item.sqlId;
                            }
                        }
                    }
                }
            }

            return cols;
        },
        environmentBusyColumns() {
            var cols = {};
            for (var i in this.environment) {
                var env = this.environment[i];
                cols[env.sqlId] = {};
                for (var j in env.pockets) {
                    var pocket = env.pockets[j];
                    cols[env.sqlId][j] = {};
                    for (var index in pocket.items) {
                        var item = pocket.items[index];
                        var w = this.itemsInfo[item.itemId].width;
                        var h = this.itemsInfo[item.itemId].height;
                        var coord = this.indexToXY(pocket.rows, pocket.cols, index);
                        for (var x = 0; x < w; x++) {
                            for (var y = 0; y < h; y++) {
                                var i = this.xyToIndex(pocket.rows, pocket.cols, {
                                    x: coord.x + x,
                                    y: coord.y + y
                                });
                                cols[env.sqlId][j][i] = item.sqlId;
                            }
                        }
                    }
                }
            }

            return cols;
        },
        equipmentTitle() {
            var title = 'Экипировка';
            if (this.searchMode) title += " " + this.searchMode.playerName;
            return title;
        },
        descItemName() {
            var item = this.itemDesc.item;
            return this.getItemName(item);
        },
        descItemWeight() {
            var item = this.itemDesc.item;
            if (!item) return null;

            return parseInt(this.getItemWeight(item) * 1000) / 1000;
        },
        descItemParams() {
            var item = this.itemDesc.item;
            if (!item) return [];

            var params = [{
                name: "Вес",
                value: this.descItemWeight + " кг"
            }, ];
            if (item.pockets) {
                params.push({
                    name: "Карманы",
                    value: item.pockets.filter(x => !x.search).length + " ед."
                });
                params.push({
                    name: "Содержит",
                    value: this.getItemsCount(item) + " предметов"
                });
            }

            params = params.concat(this.getPrettyParams(item.itemId, item.params));
            return params;
        },
        havePockets() {
            for (var index in this.equipment)
                if (this.equipment[index].pockets) return true;

            return false;
        },
        notifPos() {
            return {
                x: window.screenX,
                y: window.screenY
            };
        },
        handImg() {
            return `img/inventory/${(this.handsBlock)? 'hand-block.svg' : 'hand.png'}`;
        },
    },
    methods: {
        // ******************  [ Private ] ******************
        urlItemImg(itemId) {
            return `img/inventory/items/${itemId}.png`;
        },
        itemStyle(item) {
            var isDraggable = this.itemDrag.item && this.itemDrag.item.sqlId == item.sqlId;
            var url = this.urlItemImg(item.itemId);
            var style = {
                backgroundImage: `url(${url})`,
                height: `calc(${this.itemsInfo[item.itemId].height * 2.77}vh + ${(this.itemsInfo[item.itemId].height - 1) * 2}px)`, // Высота + отступ ( минус один отступ)
                width: `calc(${this.itemsInfo[item.itemId].width * 2.77}vh + ${(this.itemsInfo[item.itemId].width - 1) * 2}px)`,
                pointerEvents: (this.itemDrag.item) ? 'none' : '',
            };
            // if (item.params && item.params.health && !isDraggable && !item.found) {
            //     style.backgroundImage = `url(${url}), ${this.itemGradient(item)}`;
            //     style.backgroundColor = `#fff0`;
            // }
            return style;
        },
        valueColor(value) {
            if (value > 50) return "#6AC93D88";
            if (value > 15) return "#C9783D88";
            return "#C93D3D88";
        },
        itemGradient(item, transparent) {
            if (item && item.params && item.params.health && !item.search)
                return `linear-gradient(0deg, ${this.valueColor(item.params.health)} ${item.params.health}%, rgba(255,255,255,${(transparent ? 0 : 0.3)}) ${item.params.health}%)`;
        },
        getItemsMenu(itemId) {
            if (!this.searchMode) return this.itemsMenu[itemId];
            var menu = {
                // 'Изъять': {
                //     handler(item) {
                //         mp.trigger(`callRemote`, `police.inventory.search.item.take`, item.sqlId);
                //     }
                // },
                'Выкинуть': {
                    handler(item) {
                        inventory.deleteItem(item.sqlId);
                        mp.trigger(`police.inventory.search.item.putGround`, item.sqlId);
                    }
                }
            };
            return menu;
        },
        onBodyItemEnter(index) {
            if (!this.itemDrag.item) return;
            // var item = this.equipment[index];
            // if (item) return;
            if (this.bodyList[index] && !this.bodyList[index].includes(this.itemDrag.item.itemId)) return;
            var nextWeight = this.commonWeight + this.itemsInfo[this.itemDrag.item.itemId].weight;
            if (nextWeight > this.maxPlayerWeight && !this.getItem(this.itemDrag.item.sqlId)) return;
            if (index == 13 && this.handsBlock) return;
            var columns = this.itemDrag.accessColumns;
            columns.bodyFocus = index;
        },
        onBodyItemLeave(index) {
            var columns = this.itemDrag.accessColumns;
            columns.bodyFocus = null;
        },
        onHotkeyItemEnter(key) {
            // console.log("onHotkeyItemEnter")
            this.hotkeyFocus = key;
            var item = this.itemDrag.item;
            if (!item || !this.getItem(item.sqlId)) return;
            if (this.hotkeys[key] && this.getItem(this.hotkeys[key].sqlId)) return;
            // if (!this.hotkeysList[item.itemId]) return;
            if (!this.hotkeysList[item.itemId] && !item.params.weaponHash) return;
            var columns = this.itemDrag.accessColumns;
            columns.hotkeyFocus = key;
        },
        onHotkeyItemLeave(key) {
            // console.log("onHotkeyItemLeave")
            this.hotkeyFocus = null;
            var columns = this.itemDrag.accessColumns;
            columns.hotkeyFocus = null;
        },
        itemMouseHandler(item, e) {
            var rect = document.getElementById('inventory').getBoundingClientRect();
            var descEl = document.getElementsByClassName('item-desc')[0];
            var descRect = (descEl) ? descEl.getBoundingClientRect() : null;
            var handlers = {
                'mouseenter': (e) => {
                    var x = e.screenX + 15;
                    var y = e.screenY + 15;

                    this.itemDesc.item = item;
                    if (descRect && x + descRect.width > window.innerWidth) x = window.innerWidth - descRect.width;
                    if (descRect && y + descRect.height > window.innerHeight) y = window.innerHeight - descRect.height;
                    this.itemDesc.x = x - rect.x;
                    this.itemDesc.y = y - rect.y;
                },
                'mouseleave': (e) => {
                    this.itemDesc.item = null;
                },
                'mousemove': (e) => {
                    var x = e.screenX + 15;
                    var y = e.screenY + 15;

                    this.itemDesc.item = item;
                    if (descRect && x + descRect.width > window.innerWidth) x = window.innerWidth - descRect.width;
                    if (descRect && y + descRect.height > window.innerHeight) y = window.innerHeight - descRect.height;
                    this.itemDesc.x = x - rect.x;
                    this.itemDesc.y = y - rect.y;
                },
                'contextmenu': (e) => {
                    if (this.searchMode && !this.takeSearchList.includes(item.itemId)) return;
                    if (!this.controlEnable) return;
                    this.itemMenu.item = item;
                    this.itemMenu.x = e.clientX - rect.x;
                    this.itemMenu.y = e.clientY - rect.y;
                },
                'mousedown': (e) => {
                    if (item.wait) return;
                    if (this.searchMode) return;
                    if (!this.controlEnable) return;
                    if (e.which == 1) { // Left Mouse Button
                        this.itemDrag.item = item;
                        this.itemDrag.div = e.target;
                        // до сжатых иконок
                        // this.itemDrag.x = e.screenX - rect.x - e.target.offsetWidth / 2;
                        // this.itemDrag.y = e.screenY - rect.y - e.target.offsetHeight / 2;
                        this.itemDrag.x = e.screenX - rect.x;
                        this.itemDrag.y = e.screenY - rect.y;
                        if (this.hotkeyFocus && this.hotkeys[this.hotkeyFocus] == item) this.itemDrag.accessColumns.hotkeyUnbind = this.hotkeyFocus;
                    }
                },
            };
            handlers[e.type](e);
        },
        columnMouseHandler(place, pocket, index, e) {
            if (!this.itemDrag.item) return;
            var item = this.itemDrag.item;
            var nextWeight = this.commonWeight;
            if (!this.getItem(item.sqlId)) nextWeight += this.itemsInfo[item.itemId].weight;
            var columns = this.itemDrag.accessColumns;
            var pocketI = place.pockets.indexOf(pocket);
            var w = this.itemsInfo[item.itemId].width;
            var h = this.itemsInfo[item.itemId].height;
            if (w > pocket.cols || h > pocket.rows) return;
            var coord = this.indexToXY(pocket.rows, pocket.cols, index);
            coord.x = Math.clamp(coord.x - parseInt(w / 2), 0, pocket.cols - w);
            coord.y = Math.clamp(coord.y - parseInt(h / 2), 0, pocket.rows - h);
            var handlers = {
                'mouseenter': (e) => {
                    // console.log('mouseenter')
                    columns.placeSqlId = place.sqlId;
                    columns.pocketI = pocketI;
                    columns.deny = place.sqlId == item.sqlId ||
                        place.itemId == item.itemId ||
                        (place.sqlId < 0 && this.getItemsCount(item) > 0) ||
                        (place.sqlId > 0 && nextWeight > this.maxPlayerWeight && !this.getItem(item.sqlId)) ||
                        (this.blackList[place.itemId] && this.blackList[place.itemId].includes(item.itemId));

                    if (place.sqlId == item.sqlId) {
                        this.itemNotif.text = `Предмет не может быть размещен в своем кармане`;
                    } else if (place.itemId == item.itemId) {
                        this.itemNotif.text = `Предмет не может быть размещен в предмете такого же типа`;
                    } else if (place.sqlId < 0 && this.getItemsCount(item) > 0) {
                        this.itemNotif.text = "Освободите вещь";
                    } else if (place.sqlId > 0 && nextWeight > this.maxPlayerWeight && !this.getItem(item.sqlId)) {
                        this.itemNotif.text = `Превышение по весу ${nextWeight} из ${this.maxPlayerWeight} кг`;
                    } else if (this.blackList[place.itemId] && this.blackList[place.itemId].includes(item.itemId)) {
                        this.itemNotif.text = `Нельзя положить ${this.itemsInfo[item.itemId].name} в ${this.itemsInfo[place.itemId].name}`;
                    } else this.itemNotif.text = null;

                    for (var x = 0; x < w; x++) {
                        for (var y = 0; y < h; y++) {
                            var i = this.xyToIndex(pocket.rows, pocket.cols, {
                                x: coord.x + x,
                                y: coord.y + y
                            });
                            columns.columns[i] = true;
                            if (!columns.deny) {
                                columns.deny = this.isColumnBusy(place, pocketI, i, item);
                                if (columns.deny) {
                                    if (this.mergeList[item.itemId]) {
                                        var target = this.getItemInColumn(place, pocketI, i);
                                        var canMerge = this.mergeList[item.itemId].includes(target.itemId) &&
                                            place.sqlId > 0 && this.getItem(item.sqlId);
                                        columns.targetSqlId = (canMerge) ? target.sqlId : null;
                                    }
                                } else columns.targetSqlId = null;
                            }
                        }
                    }
                },
                'mouseleave': (e) => {
                    columns.placeSqlId = null;
                    columns.pocketI = null;
                    columns.index = null;
                    columns.deny = false;
                    columns.columns = {};
                },
            }
            handlers[e.type](e);
        },
        binMouseHandler(e) {
            var handlers = {
                'mouseenter': (e) => {
                    this.itemDrag.accessColumns.binFocus = true;
                },
                'mouseleave': (e) => {
                    this.itemDrag.accessColumns.binFocus = false;
                },
            };
            handlers[e.type](e);
        },
        putGroundHandler(item) {
            // console.log(`выкинуть ${item}`)
            // if (this.weaponsList.includes(item.itemId)) mp.trigger(`weapons.ammo.sync`, true);
            // else {
            var children = this.getChildren(item);
            var weapon = children.find(x => this.weaponsList.includes(x.itemId));
            // if (weapon) mp.trigger(`weapons.ammo.sync`, true);
            // }
            mp.trigger(`inventory.ground.put`, item.sqlId);
        },
        moveItemToBody(item, bodyIndex) {
            var oldItem = this.equipment[bodyIndex];
            var canAdd = true;
            if (oldItem && oldItem != item) {
                var freeSlot = this.findFreeSlot(oldItem.itemId);
                if (!freeSlot) {
                    this.notify(`Нет места для ${this.getItemName(oldItem)}`);
                    canAdd = false;
                } else {
                    this.addItem(oldItem, freeSlot.pocketIndex, freeSlot.index, freeSlot.parentId);
                    // if (this.weaponsList.includes(oldItem.itemId)) mp.trigger(`weapons.ammo.sync`, true);
                    this.callRemote("item.add", {
                        sqlId: oldItem.sqlId,
                        pocketI: freeSlot.pocketIndex,
                        index: freeSlot.index,
                        placeSqlId: freeSlot.parentId
                    });
                }
            }
            if (canAdd) {
                if (!this.getItem(item.sqlId)) this.setWaitItem(item, true);
                this.addItem(item, null, bodyIndex);
                // if (this.weaponsList.includes(item.itemId)) mp.trigger(`weapons.ammo.sync`, true);
                this.callRemote("item.add", {
                    sqlId: item.sqlId,

                    pocketI: null,
                    index: parseInt(bodyIndex),
                    placeSqlId: null
                });
            }
        },
        clearHands() {
            var item = this.equipment[13];
            if (!item) return;

            var freeSlot = this.findFreeSlot(item.itemId);
            if (!freeSlot) {
                this.putGroundHandler(item);
            } else {
                this.addItem(item, freeSlot.pocketIndex, freeSlot.index, freeSlot.parentId);
                // if (this.weaponsList.includes(item.itemId)) mp.trigger(`weapons.ammo.sync`, true);
                this.callRemote("item.add", {
                    sqlId: item.sqlId,
                    pocketI: freeSlot.pocketIndex,
                    index: freeSlot.index,
                    placeSqlId: freeSlot.parentId
                });
                this.notify(`Предмет спрятан`);
            }
        },
        dropWeapon() {
            let item = this.equipment[13];
            if (!item) return;

            if (this.weaponsList.includes(item.itemId)) {
                mp.trigger(`inventory.ground.drop`, item.sqlId);
            }
        },
        isColumnBusy(place, pocketI, index, item) {
            var cols = (place.sqlId > 0) ? this.equipmentBusyColumns : this.environmentBusyColumns;
            if (!cols[place.sqlId][pocketI]) return false;
            if (!cols[place.sqlId][pocketI][index]) return false;
            return cols[place.sqlId][pocketI][index] != item.sqlId;
        },
        getItemInColumn(place, pocketI, index) {
            var cols = (place.sqlId > 0) ? this.equipmentBusyColumns : this.environmentBusyColumns;
            if (!cols[place.sqlId][pocketI]) return null;
            if (!cols[place.sqlId][pocketI][index]) return null;
            var sqlId = cols[place.sqlId][pocketI][index];
            return (place.sqlId > 0) ? this.getItem(sqlId) : this.getEnvironmentItem(sqlId);
        },
        columnClass(index, pocket, place) {
            var classes = {
                access: this.isColumnAccess(index, pocket, place),
            };
            if (classes.access) {
                classes.deny = this.itemDrag.accessColumns.deny;
                classes.merge = this.itemDrag.accessColumns.targetSqlId;
            }

            return classes;
        },
        getItemsCount(item) {
            if (!item.pockets) return 0;
            var count = 0;
            item.pockets.forEach((pocket) => {
                if (pocket.search) return;
                for (var index in pocket.items) {
                    if (pocket.items[index].search) continue;
                    count++;
                }
            });
            return count;
        },
        getChildren(item) {
            var result = [];
            if (!item.pockets) return result;
            item.pockets.forEach((pocket) => {
                for (var index in pocket.items) {
                    var child = pocket.items[index];
                    result.push(child);
                }
            });
            return result;
        },
        isColumnAccess(index, pocket, place) {
            if (!this.itemDrag.item) return false;
            var columns = this.itemDrag.accessColumns;
            if (columns.placeSqlId != place.sqlId) return false;
            var pocketI = place.pockets.indexOf(pocket);
            if (pocketI == -1) return false;
            if (columns.pocketI != pocketI) return false;
            if (!columns.columns[index]) return false;

            return true;
        },
        getPlaceWeight(place) {
            var weight = 0;
            for (var i in place.pockets) {
                var pocket = place.pockets[i];
                weight += this.getItemWeight(Object.values(pocket.items));
            }
            return +weight.toFixed(3);
        },
        getItemWeight(items, weight = 0) {
            if (!Array.isArray(items)) items = [items];
            for (var index in items) {
                var item = items[index];
                if (item.search) continue;
                var info = this.itemsInfo[item.itemId];
                // if (!info) return weight;
                weight += info.weight;
                if (item.params.weight) weight += item.params.weight;
                if (item.params.count) weight += (item.params.count - 1) * info.weight;
                if (item.params.litres) weight += item.params.litres;
                if (item.params.weaponHash && item.params.ammo) {
                    var ammoId = this.getAmmoItemId(item.itemId);
                    if (ammoId) weight += this.itemsInfo[ammoId].weight * item.params.ammo;
                }
                if (item.pockets) {
                    for (var key in item.pockets) {
                        var pocket = item.pockets[key];
                        weight += this.getItemWeight(Object.values(pocket.items), 0);
                    }
                }
            }

            return +weight.toFixed(3);
        },
        getPrettyParams(itemId, params) {
            var result = [{
                    name: "Занимает",
                    value: this.itemsInfo[itemId].width + 'x' + this.itemsInfo[itemId].height + " ячейки"
                },
                {
                    name: "Обнаружение",
                    value: this.itemsInfo[itemId].chance + "%"
                }
            ];
            if (params.health != null) result.push({
                name: "Прочность",
                value: +params.health.toFixed(2) + "%"
            });
            if (params.count) result.push({
                name: "Количество",
                value: params.count + " ед."
            });
            if (params.clime) result.push({
                name: "Климат",
                value: `от ${params.clime[0]}° до ${params.clime[1]}°`
            });
            if (params.satiety) result.push({
                name: "Сытость",
                value: params.satiety + "%"
            });
            if (params.thirst) result.push({
                name: "Жажда",
                value: params.thirst + "%"
            });
            if (params.weaponHash) {
                var ammoId = this.getAmmoItemId(itemId);
                if (ammoId) result.push({
                    name: "Калибр",
                    value: this.itemsInfo[ammoId].name
                });
            }
            if (params.ammo != null) {
                result.push({
                    name: "Патроны",
                    value: params.ammo + " ед."
                });
            }
            if (params.owner) result.push({
                name: "Владелец",
                value: `#${params.owner}`
            });
            if (params.faction) result.push({
                name: "Организация",
                value: `#${params.faction}`
            });
            if (params.litres != null) result.push({
                name: "Топливо",
                value: `${params.litres} л.`
            });
            if (params.max) result.push({
                name: "Вместимость",
                value: `${params.max} л.`
            });
            if (params.treeDamage) result.push({
                name: "Урон по дереву",
                value: `${params.treeDamage}%`
            });
            if (params.alcohol) result.push({
                name: "Алкоголь",
                value: `${params.alcohol}%`
            });
            if (params.sex != null) result.push({
                name: "Пол",
                value: (params.sex) ? "Мужской" : "Женский"
            });

            return result;
        },
        findFreeSlot(itemId) {
            for (var bodyIndex in this.bodyList) {
                bodyIndex = parseInt(bodyIndex);
                var list = this.bodyList[bodyIndex];
                if (!list) continue;
                if (list.includes(itemId)) { // предмет, можно надеть
                    var isFind = !this.equipment[bodyIndex];
                    if (isFind) return {
                        pocketIndex: null,
                        index: bodyIndex,
                        parentId: null
                    };
                }
            }

            for (var index in this.equipment) {
                var item = this.equipment[index];
                if (!item.pockets) continue; // не имеет карманы
                if (item.itemId == itemId) continue; // тип предмета совпадает (рубашку в рубашку нельзя и т.д.)
                if (this.blackListExists(item.itemId, itemId)) continue; // предмет в черном списке (сумку в рубашку нельзя и т.д.)
                for (var pocketI = 0; pocketI < item.pockets.length; pocketI++) {
                    // var pocket = item.pockets[pocketI];
                    var matrix = this.genMatrix(item, pocketI);
                    // console.log(`itemId: ${item.itemId}`);
                    // console.log(`pocketIndex: ${j}`);
                    // console.log(`matrix:`);
                    // console.log(matrix);
                    if (!matrix) continue;
                    var freeIndex = this.findFreeIndexMatrix(matrix, itemId);
                    // console.log(`freeIndex: ${freeIndex}`)
                    if (freeIndex == -1) continue;

                    return {
                        pocketIndex: pocketI,
                        index: freeIndex,
                        parentId: item.sqlId
                    };
                }
            }
            return null;
        },
        blackListExists(parentId, childId) {
            if (!this.blackList[parentId]) return false;
            return this.blackList[parentId].includes(childId);
        },
        genMatrix(item, pocketIndex) {
            if (!item.pockets) return null;

            var matrix = [];
            var cols = item.pockets[pocketIndex].cols;
            var rows = item.pockets[pocketIndex].rows;
            // Создаем пустую матрицу
            for (var i = 0; i < rows; i++) {
                matrix[i] = [];
                for (var j = 0; j < cols; j++) {
                    matrix[i][j] = 0;
                }
            }

            var children = item.pockets[pocketIndex].items;
            // console.log(`------------ children:`);
            // console.log(children);
            // Наполняем матрицу занятами ячейками
            for (var index in children) {
                var child = children[index];
                var coord = this.indexToXY(rows, cols, index);
                if (!coord) continue;

                var info = this.itemsInfo[child.itemId];
                for (var x = 0; x < info.width; x++) {
                    for (var y = 0; y < info.height; y++) {
                        matrix[coord.y + y][coord.x + x] = 1;
                    }
                }
            }

            return matrix;
        },
        indexToXY(rows, cols, index) {
            if (!rows || !cols) return null;
            var x = index % cols;
            var y = (index - x) / cols;
            if (x >= cols || y >= rows) return null;
            return {
                x: x,
                y: y
            };
        },
        xyToIndex(rows, cols, coord) {
            if (!rows || !cols) return -1;
            return coord.y * cols + coord.x;
        },
        findFreeIndexMatrix(matrix, itemId) {
            var info = this.itemsInfo[itemId];
            if (!info || !matrix) return -1;
            var w = info.width;
            var h = info.height;

            for (var i = 0; i < matrix.length - h + 1; i++) {
                for (var j = 0; j < matrix[i].length - w + 1; j++) {
                    var doBreak = false;
                    for (var y = 0; y < h; y++) {
                        for (var x = 0; x < w; x++) {
                            if (matrix[i + y][j + x] == 1) {
                                doBreak = true;
                                break;
                            }
                        }
                        if (doBreak) break;
                    }
                    if (!doBreak) return this.xyToIndex(matrix.length, matrix[0].length, {
                        x: j,
                        y: i
                    });
                }
            }

            return -1;
        },
        getItemBySqlId(sqlId, items) {
            if (!sqlId || sqlId == -1) return null;
            for (var index in items) {
                var item = items[index];
                if (item.sqlId == sqlId) return item;
                if (item.pockets) {
                    for (var key in item.pockets) {
                        var pocket = item.pockets[key];
                        var it = this.getItemBySqlId(sqlId, pocket.items);
                        if (it) return it;
                    }
                }
            }
            return null;
        },
        getItemByParams(keys, values, items = this.equipment) {
            if (!Array.isArray(keys)) keys = [keys];
            if (!Array.isArray(values)) values = [values];

            for (var index in items) {
                var item = items[index];
                var params = item.params;

                var isFind = true;
                for (var i = 0; i < keys.length; i++) {
                    var param = params[keys[i]];
                    if (!param) {
                        isFind = false;
                        break;
                    }
                    if (param && param != values[i]) {
                        isFind = false;
                        break;
                    }
                }
                if (isFind) return item;

                if (item.pockets) {
                    for (var key in item.pockets) {
                        var pocket = item.pockets[key];
                        var it = this.getItemByParams(keys, values, pocket.items);
                        if (it) return it;
                    }
                }
            }
            return null;
        },
        getItemsByItemId(itemId, items = this.equipment, list = []) {
            for (var index in items) {
                var item = items[index];
                if (item.itemId == itemId) list.push(item);

                if (item.pockets) {
                    for (var key in item.pockets) {
                        var pocket = item.pockets[key];
                        list = this.getItemsByItemId(itemId, pocket.items, list);
                    }
                }
            }
            return list;
        },
        // получить ID предмета патронов по ID предмета оружия
        getAmmoItemId(itemId) {
            for (var ammoId in this.mergeList) {
                var list = this.mergeList[ammoId];
                if (list.includes(itemId)) return parseInt(ammoId);
            }
            return null;
        },
        notify(message) {
            // console.log("[Inventory] " + message);
            notifications.push(`info`, message, `Инвентарь`);
        },
        callRemote(eventName, values) {
            // console.log(`callRemote: ${eventName}`);
            // console.log(values)

            mp.trigger("callRemote", eventName, JSON.stringify(values));
        },
        // Ожидание синхр. предмета с сервером
        setWaitItem(item, enable) {
            Vue.set(item, 'wait', enable);
        },
        // Предмет был найден при обыске
        setFoundItem(item, enable) {
            if (typeof item == 'number') item = this.getItem(item);
            if (item) {
                Vue.set(item, 'found', enable);
                if (enable) {
                    setTimeout(() => {
                        Vue.set(item, 'found', !enable);
                    }, this.foundTime);
                }
            }
        },
        // Ожидание исследования предметов при обыске
        setSearchItems(items, enable) {
            this.searchList = [];
            items.forEach(item => {
                Vue.set(item, 'search', enable);
                this.searchList.push(item);
                if (item.pockets) {
                    item.pockets.forEach(pocket => {
                        Vue.set(pocket, 'search', enable);
                        this.searchList.push(pocket);
                        for (var index in pocket.items) {
                            var child = pocket.items[index];
                            Vue.set(child, 'search', enable);
                            this.searchList.push(child);
                        }
                    });
                }
            });
            clearInterval(this.searchTimer);
            if (!enable) return;
            this.searchTimer = setInterval(() => {
                var el = this.searchList.shift();
                if (!el || !this.searchMode) return clearInterval(this.searchTimer);
                Vue.set(el, 'search', false);
                if (el.itemId) this.callRemote(`police.inventory.search.found`, {
                    sqlId: el.sqlId,
                    itemId: el.itemId
                });
            }, this.searchWait);
        },

        // ******************  [ Inventory Config ] ******************
        setItemsInfo(itemsInfo) {
            if (typeof itemsInfo == 'string') itemsInfo = JSON.parse(itemsInfo);
            for (var itemId in itemsInfo) {
                itemId = parseInt(itemId);
                this.setItemInfo(itemId, itemsInfo[itemId]);

                if (!this.itemsMenu[itemId]) this.itemsMenu[itemId] = {};
                var menu = this.itemsMenu[itemId];
                if (this.weaponsList.includes(itemId)) {
                    menu['Зарядить'] = {
                        handler(item) {
                            // mp.trigger(`weapons.ammo.sync`, true);
                            mp.trigger(`callRemote`, `weapons.weapon.ammo.fill`, item.sqlId);
                        }
                    };
                    menu['Разрядить'] = {
                        handler(item) {
                            var hash = item.params.weaponHash;
                            mp.trigger(`weapons.ammo.remove`, item.sqlId, hash.toString());
                        }
                    };
                } else if (this.eatList.includes(itemId)) {
                    var handler = (item) => {
                        if (inventory.equipment[13] != item) return notifications.error(`Еда не в руках`, inventory.getItemName(item));

                        var diff = Date.now() - inventory.lastUseEat;
                        var wait = inventory.eatWaitTime;
                        if (diff < wait) return notifications.error(`Повторная трапеза доступна через ${parseInt((wait - diff) / 1000)} сек.`, inventory.getItemName(item));
                        inventory.lastUseEat = Date.now();
                        mp.trigger(`inventory.setHandsBlock`, true, true);

                        inventory.deleteItem(item.sqlId);
                        mp.trigger(`callRemote`, `inventory.item.eat.use`, item.sqlId);
                    };
                    menu['Съесть'] = {
                        handler: handler
                    };
                    this.hotkeysList[itemId] = {
                        handler: handler
                    };
                } else if (this.drinkList.includes(itemId)) {
                    var handler = (item) => {
                        if (inventory.equipment[13] != item) return notifications.error(`Напиток не в руках`, inventory.getItemName(item));

                        var diff = Date.now() - inventory.lastUseDrink;
                        var wait = inventory.drinkWaitTime;
                        if (diff < wait) return notifications.error(`Повторное выпивание доступно через ${parseInt((wait - diff) / 1000)} сек.`, inventory.getItemName(item));
                        inventory.lastUseDrink = Date.now();
                        mp.trigger(`inventory.setHandsBlock`, true, true);

                        inventory.deleteItem(item.sqlId);
                        mp.trigger(`callRemote`, `inventory.item.drink.use`, item.sqlId);
                    };
                    menu['Выпить'] = {
                        handler: handler
                    };
                    this.hotkeysList[itemId] = {
                        handler: handler
                    };
                }
                menu['Выкинуть'] = {
                    handler: this.putGroundHandler
                };
            }
        },
        setItemInfo(itemId, info) {
            if (typeof info == 'string') info = JSON.parse(info);
            Vue.set(this.itemsInfo, itemId, info);
        },
        setMergeList(list) {
            if (typeof list == 'string') list = JSON.parse(list);
            Vue.set(this, 'mergeList', list);
        },
        setBlackList(list) {
            if (typeof list == 'string') list = JSON.parse(list);
            Vue.set(this, 'blackList', list);
        },
        setBodyList(index, list) {
            if (typeof list == 'string') list = JSON.parse(list);
            Vue.set(this.bodyList, index, list);
        },
        // ******************  [ Player Inventory ] ******************
        getItem(sqlId) {
            var item = this.getItemBySqlId(sqlId, this.equipment);
            return item;
        },
        addItem(item, pocket, index, parent) {
            if (typeof item == 'number') item = this.getItem(item);
            if (typeof parent == 'number') parent = this.getItem(parent);
            if (typeof item == 'string') item = JSON.parse(item);
            if (typeof parent == 'string') parent = JSON.parse(parent);

            this.deleteItem(item.sqlId);
            this.deleteEnvironmentItem(item.sqlId);
            if (item.pockets) {
                Vue.set(item, 'showPockets', true);
            }
            if (parent) {
                Vue.set(parent.pockets[pocket].items, index, item);
            } else Vue.set(this.equipment, index, item);
        },
        initItems(items) {
            if (typeof items == 'string') items = JSON.parse(items);
            for (var index in items) {
                var item = items[index];
                this.addItem(item, null, index);
            }
        },
        initSearchItems(data) {
            if (this.searchMode) return this.notify(`Режим обыска уже активирован`);
            if (!this.enable) return this.notify(`Инвентарь не доступен`);
            if (typeof data == 'string') data = JSON.parse(data);

            this.searchMode = {
                playerId: data.playerId,
                playerName: data.playerName,
                myEquipment: Object.assign({}, this.equipment)
            };
            for (var index in this.equipment) {
                this.deleteItem(this.equipment[index].sqlId);
            }
            // запуск исследования
            this.setSearchItems(Object.values(data.items), true);
            for (var index in data.items) {
                var item = data.items[index];
                this.addItem(item, null, index);
            }
            this.show = true;
        },
        stopSearchMode() {
            if (!this.searchMode) return this.notify(`Режим обыска не активирован`);

            this.searchMode = null;
        },
        deleteItem(sqlId, items = this.equipment) {
            for (var index in items) {
                var item = items[index];
                if (item.sqlId == sqlId) {
                    // this.clearHotkeys(item);
                    Vue.delete(items, index);
                }
                if (item.pockets) {
                    for (var key in item.pockets) {
                        var pocket = item.pockets[key];
                        this.deleteItem(sqlId, pocket.items);
                    }
                }
            }
        },
        setItemSqlId(item, sqlId) {
            if (typeof item == 'number') item = this.getItem(item);
            if (!item) return this.notify(`setItemSqlId: Предмет ${item} не найден`);
            sqlId = parseInt(sqlId);
            Vue.set(item, 'sqlId', sqlId);
            this.setWaitItem(item, false);
        },
        setItemParam(item, key, value) {
            // d(`setItemParam: ${key} => ${value}`)
            if (typeof item == 'number') item = this.getItem(item);
            if (!item) return /*this.notify(`setItemParam: Предмет ${item} не найден`)*/;
            if (!isNaN(value)) value = parseFloat(value);
            Vue.set(item.params, key, value);
        },
        getItemInfoHash(itemId) {
            var info = this.itemsInfo[itemId];
            var hash = info.name.length +
                info.description.length +
                info.height +
                info.width +
                info.weight * 1000;
            return hash;
        },
        getItemsInfoHashes(chunk = 2) {
            var hashes = [];
            for (var itemId in this.itemsInfo) {
                hashes.push(this.getItemInfoHash(itemId));
            }
            for (var i = 0; i < hashes.length; i++) {
                for (var j = 1; j < chunk; j++) {
                    if (!hashes[i + j]) break;
                    hashes[i] += hashes[i + j];
                }
                hashes.splice(i + 1, chunk - 1);
            }
            return hashes;
        },
        setArmour(value) {
            var item = this.equipment[4];
            if (!item) return;
            item.params.health = value;
        },
        setAmmo(weaponHash, ammo) {
            // d(`setAmmo: ${weaponHash} (${ammo})`)
            weaponHash = parseInt(weaponHash);
            var item = this.getItemByParams('weaponHash', weaponHash);
            if (!item) return;
            if (this.weaponsList.includes(item.itemId)) this.setItemParam(item, 'ammo', ammo);
            else if (this.throwableWeaponsList.includes(item.itemId)) {
                this.setItemParam(item, 'ammo', ammo);
                if (ammo <= 0) {
                    this.deleteItem(item.sqlId);
                    this.callRemote(`inventory.throwableWeapon.delete`, item.sqlId);
                }
            }
        },
        getItemName(item) {
            if (!item) return null;
            if (item.pockets && item.pockets.findIndex(x => x.search || Object.values(x.items).findIndex(y => y.search) != -1) != -1) return 'Обыск...';
            if ([6, 7, 8, 9, 15, 133].includes(item.itemId) && item.params.name) // одежда, рыба, алко-напиток
                return `${item.params.name}`;
            if (item.itemId == 16 && item.params.name) // сигареты
                return this.itemsInfo[item.itemId].name + " " + item.params.name;
            if (item.itemId == 33 && item.params.vehName) // ключи авто
                return `Ключи от ${item.params.vehName}`;
            if (item.itemId == 131 && item.params.name) // ресурс - дерево
                return `Дерево ${item.params.name}`;
            return this.itemsInfo[item.itemId].name;
        },

        // ******************  [ Hotkeys ] ******************
        bindHotkey(itemSqlId, key) {
            var item = this.getItem(itemSqlId);
            if (!item) {
                this.unbindHotkey(key);
                return;
                // return this.notify(`Предмет должен находиться в инвентаре`);
            }
            this.clearHotkeys(item);
            Vue.set(this.hotkeys, key, item);
            mp.trigger(`inventory.saveHotkey`, itemSqlId, key);
        },
        unbindHotkey(key) {
            mp.trigger(`inventory.removeHotkey`, key);
            Vue.delete(this.hotkeys, key);
        },
        onUseHotkey(key) {
            if (!this.enable || !this.controlEnable || this.handsBlock) return;
            if (Date.now() - this.lastUseHotkey < this.waitUseHotkey) return;

            var item = this.hotkeys[key];
            if (!item || !this.getItem(item.sqlId)) return;
            if (item == this.equipment[13]) return;

            this.lastUseHotkey = Date.now();
            this.moveItemToBody(item, 13);
        },
        onUseHandsItem() {
            if (!this.enable || !this.controlEnable) return;
            var item = this.equipment[13];
            if (!item) return;
            if (!this.hotkeysList[item.itemId]) return;
            this.hotkeysList[item.itemId].handler(item);
        },
        clearHotkeys(item) {
            if (typeof item == 'number') item = this.getItem(item);
            for (var key in this.hotkeys) {
                var it = this.hotkeys[key];
                if (it.sqlId == item.sqlId) this.unbindHotkey(key);
            }
        },

        // ******************  [ Environment ] ******************
        addEnvironmentPlace(place) {
            if (typeof place == 'string') place = JSON.parse(place);
            Vue.set(place, 'showPockets', true);
            this.environment.unshift(place);
        },
        deleteEnvironmentPlace(sqlId) {
            for (var i in this.environment) {
                var place = this.environment[i];
                if (place.sqlId == sqlId) Vue.delete(this.environment, i);
            }
        },
        getEnvironmentPlace(sqlId) {
            for (var i in this.environment) {
                var place = this.environment[i];
                if (place.sqlId == sqlId) return place;
            }
            return null;
        },
        getEnvironmentItem(sqlId) {
            var item;
            for (var i in this.environment) {
                var place = this.environment[i];
                for (var j in place.pockets) {
                    var pocket = place.pockets[j];
                    item = this.getItemBySqlId(sqlId, pocket.items);
                    if (item) break;
                }
                if (item) break;
            }
            return item;
        },
        addEnvironmentItem(item, pocket, index, placeSqlId) {
            this.deleteEnvironmentItem(item.sqlId);
            this.deleteItem(item.sqlId);

            var place = this.getEnvironmentPlace(placeSqlId);
            if (!place) return this.notify(`addEnvironmentItem: место с sqlId ${placeSqlId} не найдено`);
            Vue.set(place.pockets[pocket].items, index, item);
        },
        deleteEnvironmentItem(sqlId) {
            var places = this.environment;
            for (var i in places) {
                var place = places[i];
                for (var j in place.pockets) {
                    var items = place.pockets[j].items;
                    for (var index in items) {
                        var item = items[index];
                        if (item.sqlId == sqlId) Vue.delete(items, index);
                        if (item.pockets) {
                            for (var key in item.pockets) {
                                var pocket = item.pockets[key];
                                this.deleteItem(sqlId, pocket.items);
                            }
                        }
                    }
                }
            }
        },
        setEnvironmentItemSqlId(item, sqlId) {
            if (typeof item == 'number') item = this.getEnvironmentItem(item);
            if (!item) return this.notify(`setEnvironmentItemParam: Предмет ${item} не найден`);
            sqlId = parseInt(sqlId);
            Vue.set(item, 'sqlId', sqlId);
            this.setWaitItem(item, false);
        },
        setEnvironmentItemParam(item, key, value) {
            if (typeof item == 'number') item = this.getEnvironmentItem(item);
            if (!item) return this.notify(`setEnvironmentItemParam: Предмет ${item} не найден`);
            if (!isNaN(value)) value = parseFloat(value);
            Vue.set(item.params, key, value);
        },
    },
    watch: {
        enable(val) {
            if (!val) this.show = selectItems.show = false;
        },
        show(val) {
            mp.trigger("blur", val, 300);
            hud.show = !val;
            if (val) {
                busy.add("inventory", true, true);
                mp.trigger(`radar.display`, false);
                mp.trigger(`chat.opacity.set`, 0);
            } else {
                busy.remove("inventory", true);
                mp.trigger(`radar.display`, true);
                mp.trigger(`chat.opacity.set`, 1);
            }
            this.lastShowTime = Date.now();
        },
        searchMode(val, oldVal) {
            if (oldVal && !val) {
                for (var index in this.equipment) {
                    this.deleteItem(this.equipment[index].sqlId);
                }
                this.initItems(oldVal.myEquipment);
                clearInterval(this.searchTimer);
            }
        },
    },
    mounted() {
        let self = this;
        window.addEventListener('keyup', function(e) {
            if (busy.includes(["auth", "chat", "terminal", "interaction", "mapCase", "phone", "playerMenu", "inputWindow", "fishing.game", "selectItems", "playersList", "bugTracker"])) return;
            if (selectMenu.isEditing) return;
            if (Date.now() - self.lastShowTime < 500) return;
            if (e.keyCode == 73 && self.enable) self.show = !self.show;
            if (e.keyCode > 47 && e.keyCode < 57) {
                var num = e.keyCode - 48;
                self.onUseHotkey(num);
            }
        });
        window.addEventListener('click', function(e) {
            self.itemMenu.item = null;
        });
        window.addEventListener('mousemove', function(e) {
            if (self.itemDrag.item) {
                var rect = document.getElementById('inventory').getBoundingClientRect();
                var itemDiv = self.itemDrag.div;

                // self.itemDrag.x = e.screenX - rect.x - itemDiv.offsetWidth / 2;
                // self.itemDrag.y = e.screenY - rect.y - itemDiv.offsetHeight / 2;

                self.itemDrag.x = e.screenX - rect.x;
                self.itemDrag.y = e.screenY - rect.y;

                if (self.itemNotif.text) {
                    self.itemNotif.x = e.screenX - rect.x + 15;
                    self.itemNotif.y = e.screenY - rect.y + 15;
                }
            }
        });
        window.addEventListener('mouseup', function(e) {
            // console.log(JSON.stringify(self.itemDrag))
            var columns = self.itemDrag.accessColumns;
            var item = self.itemDrag.item;
            if (columns.bodyFocus != null) {
                self.moveItemToBody(item, columns.bodyFocus);
            } else if (columns.hotkeyFocus) {
                self.bindHotkey(self.itemDrag.item.sqlId, columns.hotkeyFocus);
            } else if (columns.targetSqlId) {
                self.deleteItem(self.itemDrag.item.sqlId);
                self.callRemote("item.merge", {
                    sqlId: self.itemDrag.item.sqlId,
                    targetSqlId: columns.targetSqlId,
                    pocketI: columns.pocketI,
                    placeSqlId: columns.placeSqlId
                });
            } else if (columns.binFocus) {
                self.deleteItem(self.itemDrag.item.sqlId);
                // mp.trigger(`inventory.ground.put`, item.sqlId);
                self.putGroundHandler(item);
                columns.binFocus = false;
            } else {
                var index = parseInt(Object.keys(columns.columns)[0]);
                if (!columns.deny && columns.placeSqlId != null &&
                    columns.pocketI != null &&
                    index != null) {
                    if (columns.placeSqlId > 0) {
                        if (!self.getItem(item.sqlId)) self.setWaitItem(item, true);
                        self.addItem(item, columns.pocketI, index, columns.placeSqlId)
                    } else {
                        if (self.getItem(item.sqlId)) self.setWaitItem(item, true);
                        self.addEnvironmentItem(item, columns.pocketI, index, columns.placeSqlId);
                    }
                    // if (self.weaponsList.includes(item.itemId)) mp.trigger(`weapons.ammo.sync`, true);
                    self.callRemote("item.add", {
                        sqlId: item.sqlId,
                        pocketI: columns.pocketI,
                        index: index,
                        placeSqlId: columns.placeSqlId
                    });
                }
            }

            if (columns.hotkeyUnbind) self.unbindHotkey(columns.hotkeyUnbind);

            self.itemDrag.item = null;
            self.itemDrag.div = null;
            self.itemNotif.text = null;
            columns.placeSqlId = null;
            columns.pocketI = null;
            columns.columns = {};
            columns.bodyFocus = null;
            columns.hotkeyUnbind = null;
        });
    }
});

// for tests
// inventory.initItems({
//     0: {
//         sqlId: 100,
//         itemId: 1,
//         params: {}
//     },
//     5: {
//         sqlId: 200,
//         itemId: 7,
//         params: {},
//         pockets: [
//             {
//                 cols: 11,
//                 rows: 5,
//                 items: {
//                     2: {
//                         sqlId: 300,
//                         itemId: 1,
//                         params: {},
//                         // found: true,
//                     },
//                     6: {
//                         sqlId: 301,
//                         itemId: 16,
//                         params: {
//                             count: 20
//                         },
//                     },
//                     // 30: {
//                     //     sqlId: 302,
//                     //     itemId: 24,
//                     //     params: {
//                     //         count: 2
//                     //     },
//                     // },
//                 }
//             }
//         ]
//     }
// });
//
// inventory.addEnvironmentPlace({
//     sqlId: -200,
//     header: "Холодильник",
//     pockets: [{
//             cols: 5,
//             rows: 7,
//             items: {},
//         },
//         {
//             cols: 5,
//             rows: 7,
//             items: {},
//         },
//         {
//             cols: 7,
//             rows: 7,
//             items: {},
//         }
//     ],
// });
// inventory.addEnvironmentPlace({
//     sqlId: -100,
//     header: "Шкаф",
//     pockets: [{
//             cols: 10,
//             rows: 8,
//             items: {
//                 0: {
//                     sqlId: 595,
//                     itemId: 7,
//                     pockets: [{
//                         cols: 5,
//                         rows: 5,
//                         items: {},
//                     }],
//                     params: {}
//                 }
//             },
//         },
//         {
//             cols: 9,
//             rows: 8,
//             items: {
//                 0: {
//                     sqlId: 590,
//                     itemId: 13,
//                     pockets: [{
//                         cols: 5,
//                         rows: 6,
//                         items: {
//                             0: {
//                                 sqlId: 600,
//                                 itemId: 7,
//                                 pockets: [{
//                                     rows: 10,
//                                     cols: 10,
//                                     items: {
//                                         0: {
//                                             sqlId: 427,
//                                             itemId: 13,
//                                             pockets: [{
//                                                     cols: 5,
//                                                     rows: 3,
//                                                     items: {}
//                                                 },
//                                                 {
//                                                     cols: 5,
//                                                     rows: 3,
//                                                     items: {}
//                                                 },
//                                                 {
//                                                     cols: 5,
//                                                     rows: 3,
//                                                     items: {}
//                                                 },
//                                             ],
//                                             params: {}
//                                         }
//                                     }
//                                 }],
//                                 params: {}
//                             }
//                         }
//                     }],
//                     params: {},
//                 }
//             },
//         },
//         {
//             cols: 4,
//             rows: 2,
//             items: {},
//         },
//         {
//             cols: 5,
//             rows: 2,
//             items: {},
//         }
//     ],
// });
// inventory.addEnvironmentPlace({
//     sqlId: -10,
//     header: "Шкаф",
//     pockets: [{
//         cols: 11,
//         rows: 10,
//         items: {
//             0: {
//                 sqlId: 1,
//                 itemId: 37,
//                 // index: 0,
//                 params: {
//                     count: 110
//                 }
//             },
//             5: {
//                 sqlId: 2,
//                 itemId: 37,
//                 // index: 5,
//                 params: {
//                     count: 10
//                 }
//             },
//             10: {
//                 sqlId: 3,
//                 itemId: 24,
//                 // index: 10,
//                 params: {
//                     count: 4,
//                     health: 70,
//                 }
//             },
//             140: {
//                 sqlId: 4,
//                 itemId: 18,
//                 // index: 10,
//                 params: {
//                     health: 70,
//                 }
//             },
//             148: {
//                 sqlId: 5,
//                 itemId: 1,
//                 // index: 10,
//                 params: {}
//             },
//             10: {
//                 sqlId: 6,
//                 itemId: 21,
//                 params: {
//                     health: 10,
//                 }
//             }
//         }
//     }]
// });
// inventory.initSearchItems({
//     playerId: 11,
//     playerName: "Alex Cortez",
//     items: {
//         0: {
//             sqlId: 53,
//             itemId: 1,
//             params: {}
//         },
//         5: {
//             sqlId: 54,
//             itemId: 7,
//             params: {},
//             pockets: [{
//                     cols: 3,
//                     rows: 2,
//                     items: {}
//                 },
//                 {
//                     cols: 3,
//                     rows: 2,
//                     items: {}
//                 },
//                 {
//                     cols: 15,
//                     rows: 20,
//                     items: {
//                         20: {
//                             sqlId: 79,
//                             itemId: 1,
//                             params: {},
//                             // found: true,
//                         },
//                         60: {
//                             sqlId: 80,
//                             itemId: 16,
//                             params: {
//                                 count: 20
//                             },
//                         },
//                         80: {
//                             sqlId: 81,
//                             itemId: 24,
//                             params: {
//                                 count: 2
//                             },
//                         },
//                     }
//                 }
//             ]
//         },
//         11: {
//             sqlId: 56,
//             itemId: 8,
//             params: {},
//             pockets: [{
//                     cols: 5,
//                     rows: 5,
//                     items: {}
//                 },
//                 {
//                     cols: 5,
//                     rows: 5,
//                     items: {}
//                 },
//                 {
//                     cols: 15,
//                     rows: 20,
//                     items: {
//                         20: {
//                             sqlId: 179,
//                             itemId: 1,
//                             params: {},
//                         },
//                         60: {
//                             sqlId: 180,
//                             itemId: 16,
//                             params: {
//                                 count: 20
//                             },
//                         },
//                         80: {
//                             sqlId: 181,
//                             itemId: 24,
//                             params: {
//                                 count: 2
//                             },
//                         },
//                     }
//                 }
//             ]
//         },
//     },
// });
// inventory.debug = true;
// inventory.show = true;
// inventory.enable = true;
