Vue.filter("textSplice", (value, length) => {
    if (value.length < length) return value;
    return value.slice(0, length) + "...";
});


function mapCaseSortByKey(list, key) {
    if (key == 'date') {
        list.sort((a, b) => {
            let timeA = a.date.split('.');
            let timeB = b.date.split('.');

            let dateA = new Date(timeA[2], timeA[1], timeA[0]);
            let dateB = new Date(timeB[2], timeB[1], timeB[0]);

            if (dateA > dateB) return 1;
            if (dateA < dateB) return -1;
            return 0;
        });
        return;
    };

    list.sort((a, b) => {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
    });
};


var mapCaseData = {
    pd: mapCasePdData,
    ems: mapCaseEmsData,
    wnews: mapCaseWnewsData,
    fib: mapCaseFIBData,
    ng: mapCaseNgData,
    gover: mapCaseGoverData,
    chvk: mapCaseChvkData,
    sheriff: mapCaseSheriffData,
    crm: mapCaseCrmData,
}

var mapCase = new Vue({
    el: "#map-case",
    data: {
        type: "",
        show: false,
        lastShowTime: 0,
        enable: false,
        inputFocus: false,
        userName: "",
        userRank: "",
        userSalary: 0,
        verification: null,
        menu: {
            width: 0,
            offset: 0,
            scrollWidth: 0,
        },

        popupMessage: null,
        menuFocus: "",
        time: "00:12",
        timerId: null,
        mapCaseData: mapCaseData,
        ranks: [],
        temp_data_pull: {},

        currentOverWindow: null,
        overData: null,

        loadMod: null,
        loadInterval: null,
        waitingTime: 0,
    },
    computed: {
        certainData() {
            return this.mapCaseData[this.type];
        },
        currentWindowName() {
            let wins = this.certainData.menuBody[this.menuFocus].windows;
            return winName = wins[wins.length - 1];
        },
        currentWindow() {
            switch (this.currentWindowName) {
                case "members":
                    return 'map-case-members';
                case "calls":
                    return 'map-case-calls';
                case "crimeHistory":
                    return 'map-case-crimeHistory';
                case "permissions":
                    return 'map-case-permissions';
                case "permissions-tab":
                    return 'map-case-permissions-tab';
                case "ranks":
                    return 'map-case-ranks';
                default:
                    return `map-case-${this.type}-${this.currentWindowName}`;
            }
        },
        dataForWindow() {
            let wins = this.certainData.menuBody[this.menuFocus].windows;
            let winName = wins[wins.length - 1];
            return {
                ...this.certainData.windowsData[winName],
                currentMenuFocus: this.menuFocus,
                ranks: this.ranks,
                ...this.temp_data_pull,
                // getDataA: this.getDataA,
                // setResultA: this.setResultA
            };
        },
        emergencyCall() {
            return this.certainData.emergencyCall;
        },
        blurMod() {
            return this.loadMod || this.popupMessage || this.verification || this.currentOverWindow;
        },
        disableMenuRightArrow() {
            if (!this.$refs['list']) return false;
            return this.$refs['list'].offsetWidth + this.menu.offset >= this.menu.scrollWidth - 5;
        },
    },
    methods: {
        getMenu(tab) {
            const factionId = playerMenu.factionId

            const permissionTypes = {
                'form': 'Clothes',
                'weapons': 'Guns',
                'bullets': 'Ammo',
                'equipment': 'Items',
            }

            const factions = {
                'gover': 'government',
                'pd': 'lspd',
                'sheriff': 'lssd',
                'fib': 'fib',
                'ng': 'army',
                'chvk': 'army',
                'crm': isMafiaFaction(factionId) ? 'mafia' : 'band',
                'ems': 'hospital',
                'wnews': 'news'
            }

            const fType = factions[mapCase.type];
            debug(fType);
            const iType = permissionTypes[tab];

            return selectMenu.menus[`${fType}${iType}`];
        },
        switchStorage(lock) {
            var ranks = mapCase.ranks;
            var maxRankName = ranks[ranks.length - 1];
            if (statistics['factionRank'].value !== maxRankName) return mapCase.showRedMessage('Вы не лидер');
            mp.trigger(`callRemote`, `factions.holder.common.state`, lock);
        },
        getData(tab) {
            var ranks = mapCase.ranks;
            var maxRankName = ranks[ranks.length - 1];
            if (statistics['factionRank'].value !== maxRankName) return mapCase.showRedMessage('Вы не лидер');

            switch (tab) {
                case 'transport':
                    mp.trigger(`callRemote`, `factions.control.vehicles.show`);
                    break;
                case 'weapons':
                    mp.trigger(`callRemote`, `factions.control.warehouse.show`, tab);
                    break;
                case 'bullets':
                    mp.trigger(`callRemote`, `factions.control.warehouse.show`, tab);
                    break;
                case 'structure':
                    mp.trigger(`callRemote`, `factions.members.access.info`);
                    break;
                case 'form':
                    mp.trigger(`callRemote`, `factions.control.warehouse.show`, tab);
                    break;
                case 'equipment':
                    mp.trigger(`callRemote`, `factions.control.warehouse.show`, tab);
                    break;
                default:
                    break;
            }
        },
        setResult(list, type) {
            if ((type === 'equipment') || (type === 'weapons') || (type === 'bullets')) {
                var menu = mapCase.getMenu(type);
                if (!menu) {
                    mapCase.showRedMessage('Отсутствует');
                    return [];
                }
                var items = [];
                for (var i = 0; i < menu.items.length - 1; i++) {
                    items.push({
                        id: menu.itemIds[i],
                        num: i,
                        name: menu.items[i].text
                    });
                }

                const itemRanks = mapCase.itemRanks;
                for (var i = 0; i < menu.itemIds.length; i++) {
                    var itemId = menu.itemIds[i];
                    var minRank = itemRanks.find(x => x.itemId == itemId);
                    items[i].rank = (minRank) ? minRank.rank : 1;
                }

                list = items;
            } else if (type === 'form') {
                var menu = mapCase.getMenu(type);
                var items = [];
                for (var i = 0; i < menu.items.length - 1; i++) {
                    items.push({
                        id: i,
                        num: i,
                        name: menu.items[i].text,
                        rank: 1
                    });
                }

                const clothesRanks = mapCase.clothesRanks;
                for (var i = 0; i < clothesRanks.length; i++) {
                    var rank = clothesRanks[i];
                    items[rank.clothesIndex].rank = rank.rank;
                }

                list = items;
            }

            return list;
        },
        initListData() {
            let self = this;
            if (!this.$refs['list'])
                return setTimeout(() => {
                    self.initListData();
                }, 100);

            this.menu.width = this.$refs['list'].offsetWidth;
            this.menu.scrollWidth = this.$refs['list'].scrollWidth;
            this.menu.items = this.$refs['list'].children;

        },
        menuSlideRight() {
            let items = this.menu.items;
            for (let i = 0; i < items.length; i++) {
                let offset = this.menuItemIsComplectlyInBox(items[i]);
                if (offset > 0) {
                    this.menu.offset = this.$refs['list'].scrollLeft += offset;
                    break;
                }
            }
        },
        menuSlideLeft() {
            let items = this.menu.items;
            let previousOffset = 0;

            for (let i = 0; i < items.length; i++) {
                let offset = this.menuItemIsComplectlyInBox(items[i]);

                if (offset >= 0) {
                    this.menu.offset = this.$refs['list'].scrollLeft += previousOffset;
                    break;
                }
                previousOffset = offset;
            }
        },
        menuScroll() {
            this.menu.offset = this.$refs['list'].scrollLeft;
        },
        menuItemIsComplectlyInBox(item) {
            let itemRightSide = item.offsetLeft + item.offsetWidth;
            let itemLeftSide = item.offsetLeft;
            let boxRightSide = this.$refs.list.scrollLeft + this.$refs.list.offsetWidth;
            let boxLeftSide = this.$refs.list.scrollLeft;

            let right = itemRightSide - boxRightSide;
            let left = itemLeftSide - boxLeftSide;

            if (right > 0) return right;
            if (left < 0) return left;

            return 0;
        },
        onClickMenuItem(name, index) {
            this.menuFocus = name;

            let offset = this.menuItemIsComplectlyInBox(this.menu.items[index]);

            if (offset > 0)
                this.menuSlideRight();
            else if (offset < 0)
                this.menuSlideLeft();
        },
        onClickBack() {
            this.certainData.menuBody[this.menuFocus].windows.pop();
        },
        hidePopupMessage() {
            this.popupMessage = null;
        },
        showLoad(message, waitingTime) {
            this.loadMod = {
                message: message,
                waitingTime: waitingTime,
                loadCount: 0
            };

            if (this.loadInterval)
                clearInterval(this.loadInterval);

            this.loadInterval = setInterval(() => {

                if (this.loadMod.loadCount % 2 == 0)
                    this.loadMod.waitingTime--;
                if ((this.loadMod.waitingTime < 0 || !this.loadMod.waitingTime) && this.loadMod.loadCount > 18) {
                    this.hideLoad();
                    this.showRedMessage("Непредвиденная ошибка сервера");
                    return;
                }
                this.loadMod.loadCount++;
            }, 500);

            this.verification = null;
        },
        hideLoad() {
            clearInterval(this.loadInterval);
            this.loadMod = null;

        },
        showVerification(message, acceptCallback) {
            this.verification = {
                message: message,
                accept: acceptCallback,
            }
        },
        hideVerification() {
            this.verification = null;
        },
        showRedMessage(message) {
            this.popupMessage = {
                message: message,
                img: "error",
            }

            this.hideLoad();
        },
        showGreenMessage(message) {
            this.popupMessage = {
                message: message,
                img: "success",
            }

            this.hideLoad();
        },
        setCrimeHistory(history) {
            this.mapCaseData[mapCase.type].windowsData.crimeHistory.list = history;
            this.hideLoad();
            this.mapCaseData[mapCase.type].menuBody[mapCase.menuFocus].windows.push('crimeHistory');
        },
        setRanks(ranks) {
            if (typeof ranks == 'string') ranks = JSON.parse(ranks);
            this.ranks = ranks;
        },
        test(mapName) {
            this.userName = "Cyrus Raider";
            this.userRank = "Padre";
            this.userSalary = 1234;
            this.show = true;
            // TODO: setRanks теперь в mapCase(ranks)"
            mapCase.setRanks(["Старший Сержант", "Альпака", "Главный уборщик", "Старший Альпака"]);
            let orignHandler;

            switch (mapName) {
                case "pd":
                    // init
                    this.type = "pd";
                    this.enable = true;

                    // search
                {
                    orignHandler = mapCasePdDBSearchData.searchByPhone;
                    mapCasePdDBSearchData.searchByPhone = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }
                        setTimeout(() => {
                            mapCasePdDBResultData.setResult(result);
                        }, 1000);

                        orignHandler();
                    };

                    orignHandler = mapCasePdDBSearchData.searchByName;
                    mapCasePdDBSearchData.searchByName = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }

                        setTimeout(() => {
                            mapCasePdDBResultData.setResult(result);
                        }, 1000);

                        orignHandler(value);
                    };

                    orignHandler = mapCasePdDBSearchData.searchByCar;
                    mapCasePdDBSearchData.searchByCar = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }

                        setTimeout(() => {
                            mapCasePdDBResultData.setResult(result);
                        }, 1000);

                        orignHandler(value);
                    };
                }

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCasePdMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                            lastOnline: (Math.random() < 0.5) ? '21.12.2021' : false, // TODO: Добавить для всех планшетов. false - online
                        });
                    }
                }

                    // init calls list
                {
                    for (let i = 0; i < 100; i++) {
                        mapCasePdCallsData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Cy Raiderddddddddddddddddddddddd" + i,
                            description: "descriiiipstionsdfsf sdf adf",
                            pos: {
                                x: 100 - i,
                                y: i,
                            }
                        });
                    }
                }

                    // init wanted list
                {
                    for (let i = 0; i < 100; i++) {
                        mapCasePdWantedData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Cyyyyyruuuus Raaaaiiiiiidddderrrr" + i,
                            description: "descriiiipstionsdfsf sdf adf",
                            danger: i,
                        });
                    }
                }

                    // identification
                {
                    mapCasePdIdentificationData.searchById = (id) => {
                        setTimeout(() => {
                            mapCasePdProfileData.setProfileData ({
                                name: "Cyrus Raider",
                                id: id,
                                danger: 3,
                                cause: "Украл мороженку",
                                gender: "Мужской",
                                property: "",
                                phone: 11211121,
                                pass: 33221123,
                                faction: "Tramp",
                                rank: 1,
                                veh: "Nettty",
                            });

                        }, 1000);
                    };
                }

                    // getProfile
                {
                    mapCasePdData.getProfile = (record) => {
                        setTimeout(() => {
                            mapCasePdProfileData.setProfileData ({
                                name: record.name,
                                id: record.id,
                                danger: record.danger,
                                cause: "Украл мороженку",
                                gender: "Мужской",
                                property: "Very long street name name",
                                phone: 11211121,
                                pass: 33221123,
                                faction: "Tramp",
                                rank: "Dolznost",
                                veh: "Nettty Nettty Nettty Nettty",
                            });

                        }, 1000);
                    }
                }

                    // getHistory
                {

                }

                    // switchStorage
                {
                    mapCasePdStorage.lock = false;
                    mapCasePdStorage.switchStorage = (lock) => {
                        mapCase.showLoad();

                        setTimeout(() => {
                            mapCasePdStorage.lock = !lock;
                            mapCase.hideLoad();
                        }, 1000)
                    }
                }

                    // permissions
                {
                    mapCasePdPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: "Super Car" + i,
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCasePdPermissionsTab.setResult(list, cat);
                        }, 500)

                    }
                }

                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCasePdRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }

                    break;
                case "fib":
                    // init
                    this.type = "fib";
                    this.enable = true;
                    mapCase.setRanks(["Старший Сержант", "Альпака", "Главный уборщик", "Старший Альпака"]);

                    // search
                {
                    orignHandler = mapCaseFIBDBSearchData.searchByPhone;
                    mapCaseFIBDBSearchData.searchByPhone = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }
                        setTimeout(() => {
                            mapCaseFIBDBResultData.setResult(result);
                        }, 1000);

                        orignHandler();
                    };

                    orignHandler = mapCaseFIBDBSearchData.searchByName;
                    mapCaseFIBDBSearchData.searchByName = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }

                        setTimeout(() => {
                            mapCaseFIBDBResultData.setResult(result);
                        }, 1000);

                        orignHandler(value);
                    };

                    orignHandler = mapCaseFIBDBSearchData.searchByCar;
                    mapCaseFIBDBSearchData.searchByCar = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }

                        setTimeout(() => {
                            mapCaseFIBDBResultData.setResult(result);
                        }, 1000);

                        orignHandler(value);
                    };
                }

                    // init calls list
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseFIBCallsData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Cy Raiderddddddddddddddddddddddd" + i,
                            description: "descriiiipstionsdfsf sdf adf",
                            pos: {
                                x: 100 - i,
                                y: i,
                            }
                        });
                    }
                }

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseFIBMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                        });
                    }
                }

                    // init wanted list
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseFIBWantedData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Cyyyyyruuuus Raaaaiiiiiidddderrrr" + i,
                            description: "descriiiipstionsdfsf sdf adf",
                            danger: i,
                        });
                    }
                }

                    // identification
                {
                    mapCaseFIBIdentificationData.searchById = (id) => {
                        setTimeout(() => {
                            mapCaseFIBProfileData.setProfileData ({
                                name: "Cyrus Raider",
                                id: id,
                                danger: 3,
                                cause: "Украл мороженку",
                                gender: "Мужской",
                                property: "",
                                phone: 11211121,
                                pass: 33221123,
                                faction: "Tramp",
                                rank: 1,
                                veh: "Nettty",
                            });

                        }, 1000);
                    };
                }

                    // getProfile
                {
                    mapCaseFIBData.getProfile = (record) => {
                        setTimeout(() => {
                            mapCaseFIBProfileData.setProfileData ({
                                name: record.name,
                                id: record.id,
                                danger: record.danger,
                                cause: "Украл мороженку",
                                gender: "Мужской",
                                property: "Very long street name name",
                                phone: 11211121,
                                pass: 33221123,
                                faction: "Tramp",
                                rank: "Dolznost",
                                veh: "Nettty Nettty Nettty Nettty",
                            });

                        }, 1000);
                    }
                }

                    // permissions
                {
                    mapCaseFIBPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: "Super Car" + i,
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCaseFIBPermissionsTab.setResult(list, cat);
                        }, 500)

                    }
                }

                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCaseFIBRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }

                    break;
                case "ng":
                    // init
                    this.type = "ng";
                    this.enable = true;

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseNgMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                        });
                    }
                }
                    // permissions
                {
                    mapCaseNgPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: "Super Car" + i,
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCaseNgPermissionsTab.setResult(list, cat);
                        }, 500)

                    }
                }

                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCaseNgRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }

                    break;
                case "gover":
                    // init
                    this.type = "gover";
                    this.enable = true;

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseGoverMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                        });
                    }
                }
                    // permissions
                {
                    mapCaseGoverPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: "Super Car" + i,
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCaseGoverPermissionsTab.setResult(list, cat);
                        }, 500)

                    }
                }

                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCaseGoverRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }

                    break;
                case "ems":
                    // init
                    this.type = "ems";
                    this.enable = true;

                    // init calls list
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseEmsCallsData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Cy Raiderddddddddddddddddddddddd" + i,
                            description: "descriiiipstionsdfsf sdf adf",
                            pos: {
                                x: 100 - i,
                                y: i,
                            }
                        });
                    }
                }

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseEmsMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                        });
                    }
                }

                    // permissions
                {
                    mapCaseEmsPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: "Super Car" + i,
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCaseEmsPermissionsTab.setResult(list, cat);
                        }, 500)

                    }
                }

                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCaseEmsRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }

                    break;
                case "wnews":
                    // init
                    this.type = "wnews";
                    this.enable = true;

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseWnewsMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                        });
                    }
                }

                    // get Ad
                {
                    orignHandler = mapCaseWnewsAdsData.getAd;
                    mapCaseWnewsAdsData.getAd = () => {
                        setTimeout(() => {
                            let adData = {
                                text: "Тачку хачу купить",
                                author: "Cy Raider",
                            };
                            mapCaseWnewsAdsData.setAd(adData);
                            orignHandler();
                        }, 1000);
                    }
                }

                    // permissions
                {
                    mapCaseWnewsPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: "Super Car" + i,
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCaseWnewsPermissionsTab.setResult(list, cat);
                        }, 500)

                    }
                }

                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCaseWnewsRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }

                    mapCaseWnewsAdsData.adsAmount = 10;

                    break;
                case "chvk":
                    // init
                    this.type = "chvk";
                    this.enable = true;

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseChvkMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                        });
                    }
                }
                    // permissions
                {
                    mapCaseChvkPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: "Super Car" + i,
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCaseChvkPermissionsTab.setResult(list, cat);
                        }, 500)

                    }
                }

                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCaseChvkRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }
                    break;
                case "sheriff":
                    // init
                    this.type = "sheriff";
                    this.enable = true;

                    // search
                {
                    orignHandler = mapCaseSheriffDBSearchData.searchByPhone;
                    mapCaseSheriffDBSearchData.searchByPhone = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }
                        setTimeout(() => {
                            mapCaseSheriffDBResultData.setResult(result);
                        }, 1000);

                        orignHandler();
                    };

                    orignHandler = mapCaseSheriffDBSearchData.searchByName;
                    mapCaseSheriffDBSearchData.searchByName = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }

                        setTimeout(() => {
                            mapCaseSheriffDBResultData.setResult(result);
                        }, 1000);

                        orignHandler(value);
                    };

                    orignHandler = mapCaseSheriffDBSearchData.searchByCar;
                    mapCaseSheriffDBSearchData.searchByCar = (value) => {
                        let result = [];
                        for (let i = 0; i < 100; i++) {
                            result.push({
                                id: i,
                                num: i + 1,
                                name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                                phone: 1121 - i,
                                address: "Groove Streat Avenue" + i
                            });
                        }

                        setTimeout(() => {
                            mapCaseSheriffDBResultData.setResult(result);
                        }, 1000);

                        orignHandler(value);
                    };
                }

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseSheriffMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                        });
                    }
                }

                    // init calls list
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseSheriffCallsData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Cy Raiderddddddddddddddddddddddd" + i,
                            description: "descriiiipstionsdfsf sdf adf",
                            pos: {
                                x: 100 - i,
                                y: i,
                            }
                        });
                    }
                }

                    // init wanted list
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseSheriffWantedData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Cyyyyyruuuus Raaaaiiiiiidddderrrr" + i,
                            description: "descriiiipstionsdfsf sdf adf",
                            danger: i,
                        });
                    }
                }

                    // identification
                {
                    mapCaseSheriffIdentificationData.searchById = (id) => {
                        setTimeout(() => {
                            mapCaseSheriffProfileData.setProfileData ({
                                name: "Cyrus Raider",
                                id: id,
                                danger: 3,
                                cause: "Украл мороженку",
                                gender: "Мужской",
                                property: "",
                                phone: 11211121,
                                pass: 33221123,
                                faction: "Tramp",
                                rank: 1,
                                veh: "Nettty",
                            });

                        }, 1000);
                    };
                }

                    // getProfile
                {
                    mapCaseSheriffData.getProfile = (record) => {
                        setTimeout(() => {
                            mapCaseSheriffProfileData.setProfileData ({
                                name: record.name,
                                id: record.id,
                                danger: record.danger,
                                cause: "Украл мороженку",
                                gender: "Мужской",
                                property: "Very long street name name",
                                phone: 11211121,
                                pass: 33221123,
                                faction: "Tramp",
                                rank: "Dolznost",
                                veh: "Nettty Nettty Nettty Nettty",
                            });

                        }, 1000);
                    }
                }

                    // permissions
                {
                    mapCaseSheriffPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: "Super Car" + i,
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCaseSheriffPermissionsTab.setResult(list, cat);
                        }, 500)

                    }
                }
                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCaseSheriffRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }
                    break;
                case "crm":
                    //init
                    this.type = "crm";
                    this. enable = true;

                    // init members List
                {
                    for (let i = 0; i < 100; i++) {
                        mapCaseCrmMembersData.list.push({
                            id: i,
                            num: i + 1,
                            name: "Alexeeeeeeeeeee Edwardssssssssss" + i,
                            rank: 1,
                            lastOnline: (Math.random() < 0.5) ? '21.12.2021' : false,
                        });
                    }
                }
                    // ranks
                {
                    for (let i = 1; i < 15; i++) {
                        mapCaseCrmRanks.list.push({
                            id: i,
                            name: "Rank_" + i,
                            salary: i*i*100,
                        });
                    }
                }
                    // permissions
                {
                    mapCaseCrmPermissions.getData = (cat) => {
                        let list = [];

                        for (let i = 0; i < 100; i++) {
                            list.push({ // TODO: Объект элемента списка разрешений
                                id: i,
                                num: i + 1,
                                name: cat === 'transport' ? "Super Car" : "Item",
                                rank: 1+i,
                                number: 'A' + i + '4' + i, // Только для транспорта
                            });
                        }

                        setTimeout(() => {
                            // TODO: Вызываем setResultA для перехода к вкладке. list - список разрешений,
                            // cat - тип вкладки (см. pullCats)
                            mapCaseCrmPermissions.setResult(list, cat);
                        }, 500)

                    }
                }

                default:

            }
        },
    },
    watch: {
        type(val) {
            if (!val) return;

            this.menuFocus = Object.keys(this.certainData.menuBody)[0];
        },
        show(val) {
            mp.trigger("blur", val, 300);
            mp.trigger("mapCase.animation.show.play", val);
            if (val) {
                busy.add("mapCase", true, true);
                this.initListData();
            }
            else busy.remove("mapCase", true);
            this.lastShowTime = Date.now();
            if (!val && this.timerId) {
                clearInterval(this.timerId);
                return;
            }

            function setTime() {
                let date = convertToMoscowDate(new Date());
                let hours = date.getHours() + "";
                let minutes = date.getMinutes() + "";

                if (hours.length < 2) hours = "0" + hours;
                if (minutes.length < 2) minutes = "0" + minutes;
                mapCase.time = `${hours}:${minutes}`;
            };
            setTime();
            this.timerId = setInterval(setTime, 60000);
        },
        enable(val) {
            if (!val) this.show = false;
        },
    },
    mounted() {
        let self = this;
        this.$nextTick(() => {
            self.initListData();
        });
        window.addEventListener('keyup', function(e) {
            if (busy.includes(["auth", "chat", "terminal", "inventory", "playerMenu", "phone", "inputWindow", "jobProcess", "timer", "playersList", "bugTracker"])) return;
            if (selectMenu.isEditing) return;
            if (Date.now() - self.lastShowTime < 500) return;
            if (self.inputFocus) return;
            if (e.keyCode == 80 && self.enable) self.show = !self.show; // P
        });

    },
    created() {
        let self = this;
    }
});

Vue.component('map-case-members', {
    template: "#map-case-members",
    props: {
        list: Array,
        sortMod: Object,
        ranks: Array,
        rankHead: String,
        dismiss: Function,
        lowerRank: Function,
        raiseRank: Function,
    },
    data: () => ({
        modalIsShow: false,
        currentRecord: null,
        lastUsedRecord: null,
        modalStyles: {
            top: 0,
        },

        arrows: mapCaseSvgPaths.tableSortArrows,
        pattern: '',
        localList: [],
        onlyOnline: false,
    }),
    computed: {
        sortedList() {
            let newList = [...this.localList];

            if (this.onlyOnline)
                newList = newList.filter(item => !item.lastOnline)

            mapCaseSortByKey(newList, this.sortMod.mod);

            if (this.sortMod.mod == "rank")
                newList.reverse();

            return newList;
        },
    },
    methods: {
        onClickSort(sortMod) {
            this.sortMod.update(sortMod);
        },
        showModal(event, record) {
            this.currentRecord = record;
            this.lastUsedRecord = record;
            this.modalIsShow = true;

            let offsetTop = event.target.parentElement.offsetTop;
            let height = event.target.parentElement.clientHeight;
            let scrollTop = this.$refs.membersBody.scrollTop;

            let parentHeight = this.$refs.membersBody.clientHeight;
            let modalHeight = window.innerHeight * 0.107;
            let compOffsetTop = offsetTop + height - scrollTop;

            this.modalStyles.top = ((compOffsetTop > parentHeight * 1.5) ? (offsetTop - modalHeight - scrollTop) : compOffsetTop * 1.005) + "px";
        },
        hideModal(event) {
            let className = event && event.target.className;

            if (className == 'btn' || className == 'blurShadow') return;

            this.modalIsShow = false;
            this.currentRecord = null;
        },
        acceptDismiss() {
            mapCase.showLoad();

            this.dismiss(this.lastUsedRecord);
        },
        onClickDismiss() {
            mapCase.showVerification(`Вы действительно хотите уволить <br /><span>${this.lastUsedRecord.name}</span>?`, this.acceptDismiss);
        },
        acceptLower() {
            mapCase.showLoad();

            this.lowerRank(this.lastUsedRecord);
        },
        onClickLower() {
            mapCase.showVerification(`Вы действительно хотите понизить <br /><span>${this.lastUsedRecord.name}</span>?`, this.acceptLower);
        },
        acceptRaise() {
            mapCase.showLoad();

            this.raiseRank(this.lastUsedRecord);
        },
        onClickRaise() {
            mapCase.showVerification(`Вы действительно хотите повысить <br /><span>${this.lastUsedRecord.name}</span>?`, this.acceptRaise);
        },
        search() {
            if (this.pattern == '') {
                this.localList = this.list;
                return;
            }

            let serchList = [...this.list];

            if (parseInt(this.pattern)) {
                this.localList = this.list.filter(record => record.id == this.pattern);
                return
            }

            this.localList = this.list.filter(record => record.name.toLowerCase().includes(this.pattern.toLowerCase()))
        }
    },
    watch: {
        list(val) {
            this.localList = val;
        },
    },
    created() {
        this.localList = this.list;
        window.addEventListener('click', this.hideModal);
    },
    destroyed() {
        window.removeEventListener('click', this.hideModal);
    }
});

Vue.component('map-case-calls', {
    template: "#map-case-calls",
    props: {
        list: Array,
        sortMod: Object,
        accept: Function,
    },
    data: () => ({
        arrows: mapCaseSvgPaths.tableSortArrows,
        hint: {
            data: null,
            style: null,
        },
    }),
    computed: {
        sortedList() {
            let newList = [...this.list];

            mapCaseSortByKey(newList, this.sortMod.mod)
            this.mouseout();
            return newList;
        },
    },
    methods: {
        onClickSort(sortMod) {
            this.sortMod.update(sortMod);
        },
        onClickAccept(data) {
            mapCase.showLoad();
            this.accept(data);
        },
        mouseout(e) {
            this.hint.data = null;
        },
        mousemove(e, record) {
            if (!this.hint.data) {
                if (e.target.className != "record") {
                    this.mouseout();
                    return;
                }

                this.hint.data = {
                    description: record.description,
                    dist: prettyMoney(record.num),
                };
            }

            let offsetX = e.offsetX + 15;
            let offsetY = e.offsetY + e.target.offsetTop - e.target.parentElement.scrollTop + 15;

            let opacity = 1;
            if (this.$refs.hint) {
                if (offsetX + this.$refs.hint.offsetWidth > e.target.offsetWidth)
                    offsetX = e.offsetX - this.$refs.hint.offsetWidth - 2;

                if (offsetY + this.$refs.hint.offsetHeight > this.$refs.table.offsetHeight)
                    offsetY -= this.$refs.hint.offsetHeight + 15;/*e.offsetY + e.target.offsetTop + e.target.parentElement.scrollTop - this.$refs.hint.offsetHeight - 2;*/
            } else
                opacity = 0;

            this.hint.style = {
                top: offsetY + "px",
                left: offsetX + "px",
                opacity: opacity,
            }
        },
        getDist(record) {
            return record.num = (Math.sqrt(Math.pow(hud.localPos.x - record.pos.x, 2) + Math.pow(hud.localPos.y - record.pos.y, 2))).toFixed(2);
        },
    },
    filters: {
        km(val) {
            return (val / 1000).toFixed(1);
        }
    }
});

Vue.component('map-case-ranks', {
    template: "#map-case-ranks",
    props: {
        list: Array,
    },
    data: () => ({
        mod: 'num',
    }),
    computed: {
        sortedList() {
            let newList = [...this.list];

            mapCaseSortByKey(newList, this.mod);

            return newList;
        },
    },
    methods: {
        setSortMod(mod) {
            this.mod = mod;
        },
        edit(item) {
            mapCase.temp_data_pull = item;
            mapCase.currentOverWindow = 'map-case-over-salary';
        }
    }
})

Vue.component('map-case-crimeHistory', {
    template: "#map-case-crimeHistory",
    props: {
        list: Array,
        sortMod: Object,
    },
    data: () => ({
        currentRecord: null,
        lastUsedRecord: null,
    }),
    computed: {
        sortedList() {
            let newList = [...this.list];

            mapCaseSortByKey(newList, this.sortMod.mod)
            //this.mouseout();
            return newList;
        },
    },
    methods: {
        onClickSort(sortMod) {
            this.sortMod.update(sortMod);
        },
    }
});

Vue.component('map-case-permissions', {
    template: "#map-case-permissions",
    props: {
        categories: Array,
        getData: Function,
    },
    data: () => ({
        pullCats: {
            transport: {
                label: "Транспорт",
            },
            weapons: {
                label: "Оружие",
            },
            bullets: {
                label: "Патроны",
            },
            structure: {
                label: "Состав",
            },
            form: {
                label: "Форма",
            },
            equipment: {
                label: "Снаряжение",
            }
        }
    }),
    methods: {
        transition(cat) {
            mapCase.showLoad();
            this.getData(cat);
        }
    }
});

Vue.component('map-case-permissions-tab', {
    template: "#map-case-permissions-tab",
    props: {
        type: String,
        list: Array,
        sortMod: Object,
        ranks: Array,
    },
    data: () => ({
        heads: {
            transport: "Доступ к траспорту",
            weapons: "Доступ к оружию",
            bullets: "Доступ к патронам",
            structure: "Доступ к составу",
            form: "Доступ к форме",
            equipment: "Доступ к снаряжению"
        },
        fields: {
            transport: {
                num: {
                    label: "#",
                    sorted: true,
                },
                name: {
                    label: "Название ТС",
                    sorted: true,
                },
                rank: {
                    label: "Мин. ранг",
                    sorted: true,
                },
                number: {
                    label: "Номер",
                    sorted: true,
                },
            },
            weapons: {
                num: {
                    label: "#",
                    sorted: true,
                },
                name: {
                    label: "Название оружия",
                    sorted: true,
                },
                rank: {
                    label: "Мин. ранг",
                    sorted: true,
                },
            },
            bullets: {
                num: {
                    label: "#",
                    sorted: true,
                },
                name: {
                    label: "Тип патронов",
                    sorted: true,
                },
                rank: {
                    label: "Мин. ранг",
                    sorted: true,
                },
            },
            structure: {
                num: {
                    label: "#",
                    sorted: true,
                },
                name: {
                    label: "Тип доступа",
                    sorted: true,
                },
                rank: {
                    label: "Мин. ранг",
                    sorted: true,
                },
            },
            form: {
                num: {
                    label: "#",
                    sorted: true,
                },
                name: {
                    label: "Форма",
                    sorted: true,
                },
                rank: {
                    label: "Мин. ранг",
                    sorted: true,
                },
            },
            equipment: {
                num: {
                    label: "#",
                    sorted: true,
                },
                name: {
                    label: "Снаряжение",
                    sorted: true,
                },
                rank: {
                    label: "Мин. ранг",
                    sorted: true,
                },
            }
        },

        mod: 'num',
    }),
    computed: {
        sortedList() {
            let newList = [...this.list];

            mapCaseSortByKey(newList, this.mod);

            if (this.mod == "rank")
                newList.reverse();

            return newList;
        },
        head() {
            return this.heads[this.type];
        },
        size() {
            if (this.type == 'transport') {
                if (mapCase.type == 'crm')
                    return '6vh 21.11vh 18vh 1fr 13.24vh';

                return '7.4vh 18.9vh 18.9vh 12.22vh 1fr';
            }

            return false;
        },
    },
    methods: {
        onClickSort(sortMod) {
            this.mod = sortMod;
        },
        filter(value, type) {
            if (type == 'rank')
                return this.ranks[value-1];

            return value;
        },
        edit(item) {
            item.type = this.type,
            mapCase.temp_data_pull = item;
            mapCase.currentOverWindow = 'map-case-over-rank-changer';
        }
    }
});

Vue.component('map-case-over-rank-changer', {
    template: "#map-case-over-rank-changer",
    props: {
        id: Number,
        name: String,
        rank: Number,
        ranks: Array,
        type: String,
    },
    data: () => ({
        current_rank: 0,
    }),
    computed: {
        values() {
            return [
                this.ranks[(this.current_rank > 1) ? this.current_rank-2 : ''],
                this.ranks[this.current_rank-1],
                this.ranks[(this.current_rank == this.ranks.length) ? '' : this.current_rank],
            ];
        },
        left() {
            return this.current_rank > 1;
        },
        right() {
            return this.current_rank < this.ranks.length;
        }
    },
    methods: {
        scrollRight() {
            this.current_rank += (this.current_rank == this.ranks.length) ? 0 : 1;
        },
        scrollLeft() {
            this.current_rank -= (this.current_rank == 1) ? 0 : 1;
        },
        keyDown({ keyCode }) {
            if (keyCode == 13) {
                if (this.current_rank != this.rank)
                    return this.handler(this.id, this.current_rank, this.type);
                else
                    return this.handler();
            };

            if (keyCode == 27)
                return this.handler();

            if (keyCode == 39)
                return this.scrollRight();

            if (keyCode == 37)
                return this.scrollLeft();
        },
        handler(id, rank, type) {
            // TODO: Обработка запроса на сервер со сменой минимального ранга
            switch (type) {
                case "transport":
                    mapCase.showLoad();
                    console.log('new min rank ', rank, ' for transport ', id);
                    var data = {
                        vehId: id,
                        rank: rank
                    };
                    // if (data.rank == this.vehicle.minRank) return selectMenu.notification = "Ранг уже установлен";
                    mp.trigger(`callRemote`, `factions.control.vehicles.minRank.set`, JSON.stringify(data));
                    mapCase.hideLoad();
                    break;
                case "weapons":
                    mapCase.showLoad();
                    console.log('new min rank ', rank, ' for weapons ', id);
                    var data = {
                        itemId: id,
                        rank: rank
                    };
                    mp.trigger(`callRemote`, `factions.control.items.rank.set`, JSON.stringify(data));
                    mapCase.hideLoad();
                    break;
                case "bullets":
                    mapCase.showLoad();
                    console.log('new min rank ', rank, ' for bullets ', id);
                    var data = {
                        itemId: id,
                        rank: rank
                    };
                    mp.trigger(`callRemote`, `factions.control.items.rank.set`, JSON.stringify(data));
                    mapCase.hideLoad();
                    break;
                case "structure":
                    mapCase.showLoad();
                    console.log('new min rank ', rank, ' for structure ', id);
                    var data = {
                        index: id - 1,
                        rank: rank
                    };
                    mp.trigger(`callRemote`, `factions.control.members.access.set`, JSON.stringify(data));
                    mapCase.hideLoad();
                    break;
                case "form":
                    mapCase.showLoad();
                    console.log('new min rank ', rank, ' for form ', id);
                    var data = {
                        index: id,
                        rank: rank
                    };
                    mp.trigger(`callRemote`, `factions.control.clothes.rank.set`, JSON.stringify(data));
                    mapCase.hideLoad();
                    break;
                case "equipment":
                    mapCase.showLoad();
                    console.log('new min rank ', rank, ' for equipment ', id);
                    var data = {
                        itemId: id,
                        rank: rank
                    };
                    mp.trigger(`callRemote`, `factions.control.items.rank.set`, JSON.stringify(data));
                    mapCase.hideLoad();
                    break;
                default:

            }

            mapCase.currentOverWindow = '';
            mapCase.temp_data_pull = {};
        }
    },
    mounted() {
        this.current_rank = this.rank;
        window.addEventListener('keydown', this.keyDown);
    },
    destroyed() {
        window.removeEventListener('keydown', this.keyDown);
        mapCase.temp_data_pull = {};
    }
});

Vue.component('map-case-over-salary', {
    template: "#map-case-over-salary",
    props: {
        id: Number,
        name: String,
        salary: Number,
        switchSalary: Function,
    },
    data: () => ({
        new_salary: 0,
    }),
    methods: {
        cancel() {
            mapCase.currentOverWindow = '';
        },
        save() {
            if (this.new_salary == this.salary)
                return;
            mapCase.showLoad();
            this.cancel();
            this.switchSalary(this.id, this.new_salary);
        }
    },
    mounted() {
        this.new_salary = this.salary;
    },
    destroyed() {
        mapCase.temp_data_pull = {};
    }
});

// for tests
// mapCase.type = "pd";
// mapCase.show = true;
// mapCase.enable = true;
// mapCase.userName = "Cyrus Raider"
//
// mapCase.test("pd");
// mapCase.test("fib");
// mapCase.test("sheriff");
// mapCase.test("ng");
// mapCase.test("gover");
// mapCase.test("ems");
// mapCase.test("wnews");
// mapCase.test("chvk");
// mapCase.test("crm");
