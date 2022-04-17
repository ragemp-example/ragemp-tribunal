Vue.component('map-case-fib-dbSearch', {
    template: "#map-case-pd-dbSearch",
    props: {
        searchByPhone: Function,
        searchByName: Function,
        searchByCar: Function,
    },
    data: () => ({
        logo: "img/mapCase/fib-logo.svg",
        menuItemInFocus: "name",
        menuItems: {
            name: {
                hint: "Введите имя или/и фамилию...",
                inputValue: "",
                inputCheck(event) {
                    let regex = new RegExp("[a-zA-Z ]")
                    if (!regex.test(event.key))
                        event.preventDefault();
                }
            },
            car: {
                hint: "Введите номер автомобиля...",
                inputValue: "",
                inputCheck(event) {
                    let regex = new RegExp("[0-9a-zA-Z]")
                    if (!regex.test(event.key))
                        event.preventDefault();
                }
            },
            phone: {
                hint: "Введите номер телефона...",
                inputValue: "",
                inputCheck(event) {
                    let regex = new RegExp("[0-9]")
                    if (!regex.test(event.key))
                        event.preventDefault();
                }
            },
        },
    }),
    methods: {
        search() {
            let itemInFocus = this.menuItems[this.menuItemInFocus];

            if (!itemInFocus.inputValue) return;

            mapCase.showLoad();

            switch (this.menuItemInFocus) {
                case "phone":
                    this.searchByPhone(itemInFocus.inputValue);
                    break;
                case "name":
                    this.searchByName(itemInFocus.inputValue);
                    break;
                case "car":
                    this.searchByCar(itemInFocus.inputValue);
                    break;
                default:

            }

            itemInFocus.inputValue = "";

        },
        onClickMenuItem(mod) {
            this.menuItemInFocus = mod;
        },
        enterHandler(e) {
            if (e.keyCode == 13 && !mapCase.loadMod) {
                this.search();
            }
        },
        setFocus(enable) {
            mapCase.inputFocus = enable;
        },
    },
});

Vue.component('map-case-fib-dbResult', {
    template: "#map-case-pd-dbResult",
    props: {
        list: Array,
        sortMod: Object,
    },
    data: () => ({
        arrows: mapCaseSvgPaths.tableSortArrows,
    }),
    computed: {
        sortedList() {
            let newList = [...this.list];

            mapCaseSortByKey(newList, this.sortMod.mod);

            return newList;
        },
    },
    methods: {
        onClickSort(sortMod) {
            this.sortMod.update(sortMod);
        },
        onClickRecord(record) {
            mapCase.showLoad();
            mapCaseFIBData.getProfile(record);
        },
    },
});

Vue.component('map-case-fib-wanted', {
    template: "#map-case-pd-wanted",
    props: {
        list: Array,
        sortMod: Object,
    },
    data: () => ({
        arrows: mapCaseSvgPaths.tableSortArrows,
        star: mapCaseSvgPaths.dangerStar,
    }),
    computed: {
        sortedList() {
            let newList = [...this.list];

            mapCaseSortByKey(newList, this.sortMod.mod);

            if (this.sortMod.mod == "danger")
                newList.reverse();

            return newList;
        },
    },
    methods: {
        onClickSort(sortMod) {
            this.sortMod.update(sortMod);
        },
        onClickRecord(record) {
            mapCase.showLoad();
            mapCaseFIBData.getProfile(record);
        },
    },
});

Vue.component('map-case-fib-profile', {
    template: "#map-case-pd-profile",
    props: {
        profileData: Object,
        infoList: Array,
        currentMenuFocus: String,
    },
    data: () => ({
        star: mapCaseSvgPaths.dangerStar,
    }),
    methods: {
        showOnMap() {
            // TODO: Показать претупника на карте.
            mp.trigger(`callRemote`, `mapCase.pd.wanted.search`, this.profileData[this.currentMenuFocus].id);
        },
        showOverWindow(winName) {
            mapCase.currentOverWindow = `map-case-${mapCase.type}-over-${winName}`;
        },
        getCrimeHistory() {
            mapCase.showLoad();
            mp.trigger('callRemote', 'police.history.get', this.profileData[this.currentMenuFocus].id);
        },
    }
});

Vue.component('map-case-fib-identification', {
    template: "#map-case-pd-identification",
    props: {
        searchById: Function,
        waitingTime: Number,
    },
    data: () => ({
        logo: "img/mapCase/hacker.svg",
        inputValue: "",
    }),
    methods: {
        search() {
            if (!this.inputValue) return;

            mapCase.showLoad("Держитесь рядом с человеком личность которого пытаетесь установить", this.waitingTime);
            this.searchById(this.inputValue);
            this.inputValue = "";
        },
        inputCheck(event) {
            let regex = new RegExp("[0-9]")
            if (!regex.test(event.key))
                event.preventDefault();
        },
        enterHandler(e) {
            if (e.keyCode == 13 && !mapCase.loadMod) {
                this.search();
            }
        },
        setFocus(enable) {
            mapCase.inputFocus = enable;
        },
    },
});

Vue.component('map-case-fib-over-fine', {
    template: "#map-case-pd-over-fine",
    props: {
        profileData: Object,
        currentMenuFocus: String,
        giveFine: Function,
    },
    data: () => ({
        causeValue: "",
        amountValue: "",
    }),
    methods: {
        cancel() {
            mapCase.currentOverWindow = null;
        },
        give() {
            if (!this.causeValue || !this.amountValue) return;

            mapCase.showLoad();
            mapCase.currentOverWindow = null;
            this.giveFine(this.causeValue, this.amountValue, this.profileData[this.currentMenuFocus])
            this.causeValue = "";
            this.amountValue = "";
        },
        inputCheck(event) {
            let regex = new RegExp("[0-9]")
            if (!regex.test(event.key))
                event.preventDefault();
        },
        enterHandler(e) {
            if (e.keyCode == 13 && !mapCase.loadMod) {
                this.give();
            }
        },
        setFocus(enable) {
            mapCase.inputFocus = enable;
        },
    }

});

Vue.component('map-case-fib-over-wanted', {
    template: "#map-case-pd-over-wanted",
    props: {
        profileData: Object,
        currentMenuFocus: String,
        giveFine: Function,
        giveWanted: Function,
    },
    data: () => ({
        causeValue: "",
        danger: 0,
        overDanger: 0,
        star: mapCaseSvgPaths.dangerStar,
    }),
    methods: {
        cancel() {
            mapCase.currentOverWindow = null;
        },
        give() {
            if (!this.causeValue && this.danger) return;

            mapCase.showLoad();
            mapCase.currentOverWindow = null;
            this.giveWanted(this.causeValue, this.danger, this.profileData[this.currentMenuFocus])
            this.causeValue = "";
            this.danger = 1;
        },
        over(n) {
            if (n < 0)
                this.overDanger = this.danger;
            else
                this.overDanger = n;
        },
        setDanger() {
            this.danger = this.overDanger
        },
        enterHandler(e) {
            if (e.keyCode == 13 && !mapCase.loadMod) {
                this.give();
            }
        },
        setFocus(enable) {
            mapCase.inputFocus = enable;
        },
    }

});

Vue.component('map-case-fib-storage', {
    template: "#map-case-storage",
    props: {
        lock: Boolean,
        switchStorage: Function,
    },
    data: () => ({
        lock: true,
    }),
    methods: {
        btnClick() {
            this.switchStorage(this.lock)
        }

    }
});

var mapCaseFIBDBSearchData = {
    searchByPhone: (value) => {},
    searchByName: (value) => {},
    searchByCar: (value) => {},
}

var mapCaseFIBDBResultData = {
    list: [],
    sortMod: {
        mod: "num",
        update(mod) {
            this.mod = mod;
        }
    },
    setResult(list) {
        if (typeof list == 'string') list = JSON.parse(list);
        this.list = list;

        mapCaseFIBData.menuBody[mapCase.menuFocus].windows.push("dbResult");
        mapCase.hideLoad();
    },
}

var mapCaseFIBCallsData = {
    list: [],
    sortMod: {
        mod: "num",
        update(mod) {
            this.mod = mod;
        }
    },
    accept(data) {},
    add(calls) {
        if (typeof calls == 'string') calls = JSON.parse(calls);
        if (!Array.isArray(calls)) calls = [calls];
        for (var i = 0; i < calls.length; i++) {
            this.remove(calls[i].id);
            this.list.push(calls[i]);
        }
    },
    remove(id) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].id == id) {
                this.list.splice(i, 1);
                i--;
            }
        }
    }
};

var mapCaseFIBWantedData = {
    list: [],
    sortMod: {
        mod: "num",
        update(mod) {
            this.mod = mod;
        }
    },
    add(wanted) {
        if (typeof wanted == 'string') wanted = JSON.parse(wanted);
        if (!Array.isArray(wanted)) wanted = [wanted];
        for (var i = 0; i < wanted.length; i++) {
            this.remove(wanted[i].id);
            if (!wanted[i].description) wanted[i].description = "-";
            this.list.push(wanted[i]);
        }
    },
    remove(id) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].id == id) {
                this.list.splice(i, 1);
                i--;
            }
        }
    }
}

var mapCaseFIBMembersData = {
    list: [],
    sortMod: {
        mod: "num",
        update(mod) {
            this.mod = mod;
        }
    },
    rankHead: "Звание",
    setMemberRank(id, rank) {
        rank = Math.clamp(rank, 1, this.ranks.length);
        for (var i = 0; i < this.list.length; i++) {
            var rec = this.list[i];
            if (rec.id == id) rec.rank = rank;
        }
    },
    add(members) {
        if (typeof members == 'string') members = JSON.parse(members);
        if (!Array.isArray(members)) members = [members];
        for (var i = 0; i < members.length; i++) {
            this.remove(members[i].id);
            this.list.push(members[i]);
        }
    },
    remove(id) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].id == id) {
                this.list.splice(i, 1);
                i--;
            }
        }
    },
    dismiss(data) {},
    lowerRank(data) {},
    raiseRank(data) {},
}

var mapCaseFIBProfileData = {
    profileData: {
        dbSearch: {},
        identification: {},
        wanted: {},
    },
    infoList: [{
            title: 'Пол',
            key: 'gender'
        },
        {
            title: 'Работа/Организация: ',
            key: 'faction'
        },
        // {
        //     title: 'Семейное положение: ',
        //     key: 'spouse'
        // },
        {
            title: 'Недвижимость',
            key: 'property'
        },
        {
            title: 'Должность/Звание',
            key: 'rank'
        },
        {
            title: 'Номер',
            key: 'phone'
        },
        {
            title: 'Транспорт',
            key: 'veh'
        },
        {
            title: 'Номер паспорта',
            key: 'pass'
        },
        // {
        //     title: 'Законопослушность: ',
        //     key: 'law'
        // },
        // {
        //     title: 'Преступления: ',
        //     key: 'crimes'
        // },
        // {
        //     title: 'Штрафы: ',
        //     key: 'fines'
        // },
    ],
    setProfileData(data) {
        if (typeof data == 'string') data = JSON.parse(data);

        this.profileData[mapCase.menuFocus] = data;
        mapCase.hideLoad();
        mapCaseFIBData.menuBody[mapCase.menuFocus].windows.push("profile");
    },
    giveFine(cause, amount, profileData) {},
    giveWanted(cause, danger, profileData) {},
}

var mapCaseFIBCrimeHistory = {
    list: [],
    sortMod: {
        mod: "num",
        update(mod) {
            this.mod = mod;
        }
    },
};

var mapCaseFIBStorage = {
    lock: false,
    switchStorage(lock) {
        var ranks = mapCase.ranks;
        var maxRankName = ranks[ranks.length - 1];
        if (statistics['factionRank'].value !== maxRankName) return mapCase.showRedMessage('Вы не лидер');
        mp.trigger(`callRemote`, `factions.holder.common.state`, lock);
        mapCaseFIBStorage.lock = !lock;
    }
}

var mapCaseFIBPermissions = {
    categories: ['transport', 'weapons', 'bullets', 'structure', 'form', 'equipment'],
    getData(tab) { // tab - имя вкладки (из this.categories) для которой запрашиваются данные
        mapCase.getData(tab);
    },
}

var mapCaseFIBPermissionsTab = {
    list: [],
    type: "",
    setResult(list, type) {
        list = mapCase.setResult(list, type);
        if (typeof list == 'string') list = JSON.parse(list);
        this.list = list;
        this.type = type;

        mapCaseFIBData.menuBody[mapCase.menuFocus].windows.push("permissions-tab");
        mapCase.hideLoad();
    },
}

var mapCaseFIBRanks = {
    list: [],
    switchSalary(id, salary) {
        // TODO: Реализовать запрос на сервер со сменой зп
        mapCase.hideLoad();
    }
}

var mapCaseFIBIdentificationData = {
    searchById: (value) => {},
    waitingTime: 30,
}

var mapCaseFIBWindowsData = {
    dbSearch: mapCaseFIBDBSearchData,
    dbResult: mapCaseFIBDBResultData,
    calls: mapCaseFIBCallsData,
    wanted: mapCaseFIBWantedData,
    members: mapCaseFIBMembersData,
    identification: mapCaseFIBIdentificationData,
    profile: mapCaseFIBProfileData,
    crimeHistory: mapCaseFIBCrimeHistory,
    storage: mapCaseFIBStorage,
    ranks: mapCaseFIBRanks,
    permissions: mapCaseFIBPermissions,
    'permissions-tab': mapCaseFIBPermissionsTab,
}

var mapCaseFIBData = {
    menuHeader: 'Federal Investigation Bureau',
    menuTitle: "Добро пожаловать,",
    menuHeaderImg: "img/mapCase/logo-fib.png",
    windowsData: mapCaseFIBWindowsData,
    menuBody: {
        dbSearch: {
            title: "Поиск по базе данных",
            img: mapCaseSvgPaths.magnifier,
            windows: ["dbSearch"],
        },
        calls: {
            title: "Вызовы",
            img: mapCaseSvgPaths.pdHeadset,
            windows: ["calls"],
        },
        wanted: {
            title: "Список разыскиваемых",
            img: mapCaseSvgPaths.folder,
            windows: ["wanted"],
        },
        members: {
            title: "Список сотрудников",
            img: mapCaseSvgPaths.users,
            windows: ["members"],
        },
        identification: {
            title: "Установление личности",
            img: mapCaseSvgPaths.photoCamera,
            windows: ["identification"],
        },
        permissions: {
            title: "Разрешения",
            windows: ["permissions"],
        },
        ranks: {
            title: "Ранги",
            windows: ["ranks"],
        },
        storage: {
            title: "Общий шкаф",
            windows: ["storage"],
        },
    },
    getProfile(data) {},
    emergencyCall() {},
}
//api
/*
    mapCase.showLoad(message, waitingTime);

    message - отображаемое сообщение;
    waitingTime - время в секундах.
        Будет убывать, когда значение станет < 0 таймер исчезнет, но экран загрузки не пропадёт.
        Если нет нужды в таймере, следует оставить пустым!

    mapCase.hideLoad(); скрывает экран загрузки.
*/
/*
    mapCase.showVerification (message, acceptCallback);

    Показывает окно подтверждения
    meesage - отображаемое соощение. Может содержать html-теги (span, br)
    acceptCallback() - функция, срабатывающая при подтверждении
*/
/*
    mapCase.hideVerification ();

    Скрывает окно подтверждения
*/
/*
    mapCase.showRedMessage (message);

    показывает уведомление с красным крестиком (подойдёт для ошибок)
    message - может содержать html-tags (span br)
    само скрывает экран загрузки
*/
/*
    mapCase.showGreenMessage (message);

    показывает уведомление с зелёной галочкой (подойдёт для уведомления)
    message - может содержать html-tags (span br)
    само скрывает экран загрузки
*/
/*
    mapCase.hidePopupMessage ()

    скрывает экран уведомления/ошибки
*/
/*
    mapCaseFIBProfileData.setProfileData ({ name, id, danger, cause, gender, property, phone, pass, faction, rank, veh });

    Инициализирует страницу профиля, страница сразу будет отбражена. Экран загрузки автоматически скроется
*/
/*
    mapCaseFIBDBResultData.setResultA ([{ id, num, name, phone, address }]);

    Принимает массив объектов
    Инициализирует страницу со списком результата поиска по бд. Страница будет сразу
    отображена, Экран загрузки автоматически скроется
*/
/*
    mapCaseFIBCallsData.list = [{num, name, description}];

    массив, отображающийся в списке вызовов
*/
/*
    mapCaseFIBMembersData.list = [{ num, name, rank }];

    массив, отображающийся в списке сотрудников
*/
/*
    mapCaseFIBWantedData.list = [{ num, name, description, danger }]
*/
/*
    mapCaseFIBIdentificationData.waitingTime = int

    кол-во секунд. Время сколько будет отображаться экран загрузки при идентификации личности.

    Загрузка прервётся при ответе от сервера.
*/



//Следущие функции необходимо реализовать
//Для примера в них реализованы импровизированные ответы от сервера

//Функция, срабатывающая при принятии вызова
//data - данные о вызове
mapCaseFIBCallsData.accept = (data) => {
    mp.trigger(`callRemote`, `mapCase.pd.calls.accept`, data.id);
}


//Функция, срабатывающая при поиске профиля по id
//id - значение из input
mapCaseFIBIdentificationData.searchById = (id) => {
    mp.trigger(`mapCase.fib.search.start`, id);
}


//Функция, срабатывающая при запросе профиля по записи из списка
//data - данные из записи
mapCaseFIBData.getProfile = (data) => {
    mp.trigger(`callRemote`, `mapCase.fib.getProfile`, data.id)
}


//Функция, срабатывающая при нажатии на Экстренный вызова+
mapCaseFIBData.emergencyCall = () => {
    mp.trigger(`callRemote`, `mapCase.fib.emergency.call`);
};


//Функция, срабатывающая при поиске в базе данных по номеру телефона
//value - значение из input
mapCaseFIBDBSearchData.searchByPhone = (value) => {
    mp.trigger(`callRemote`, `mapCase.fib.searchByPhone`, value);
};


//Функция, срабатывающая при поиске в базе данных по имени
//value - значение из input
mapCaseFIBDBSearchData.searchByName = (value) => {
    mp.trigger(`callRemote`, `mapCase.fib.searchByName`, value);
};


//Функция, срабатывающая при поиске в базе данных по номеру машины
//value - значение из input
mapCaseFIBDBSearchData.searchByCar = (value) => {
    mp.trigger(`callRemote`, `mapCase.fib.searchByCar`, value);
};


//Функция, устанавливающая массив рангов (от младшего к старшему)
//mapCaseFIBMembersData.setRanks(["Старший Сержант", "Альпака", "Главный уборщик", "Старший Альпака"]);


//Функция, срабатывающая при увольнение сотрудника
//data - данные о сотруднике из записи в списке
mapCaseFIBMembersData.dismiss = (data) => {
    mp.trigger(`callRemote`, `mapCase.fib.members.uval`, data.id);
}


//Функция, срабатывающая при понижении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseFIBMembersData.lowerRank = (data) => {
    if (data.rank <= 1)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет мин. ранг - ${mapCaseFIBMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.fib.rank.lower`, data.id);
}


//Функция, срабатывающая при повышении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseFIBMembersData.raiseRank = (data) => {
    if (data.rank >= mapCaseFIBMembersData.ranks.length)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет макс. ранг - ${mapCaseFIBMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.fib.rank.raise`, data.id);
}


//Функция, срабатывающая при выдаче штрафа
//cause - причина; amount - сумма к уплате; profileData - данные профиля
mapCaseFIBProfileData.giveFine = (cause, amount, profileData) => {
    var data = {
        recId: profileData.id,
        recName: profileData.name,
        cause: cause,
        price: amount
    };
    mp.trigger(`callRemote`, `mapCase.fib.fines.give`, JSON.stringify(data));
}


//Функция, срабатывающая при выдаче розыска
//cause - причина; danger - уровень розыска; profileData - данные профиля
mapCaseFIBProfileData.giveWanted = (cause, danger, profileData) => {
    var data = {
        recId: profileData.id,
        recName: profileData.name,
        cause: cause,
        wanted: danger
    };
    if (danger > profileData.danger) {
        profileData.law -= danger - profileData.danger;
        profileData.crimes += danger - profileData.danger;
    }
    profileData.cause = cause;
    profileData.danger = danger;
    mp.trigger(`callRemote`, `mapCase.fib.wanted.give`, JSON.stringify(data));
}

//mapCaseFIBIdentificationData.waitingTime = 5;
