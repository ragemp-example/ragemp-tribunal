
Vue.component('map-case-wnews-ads', {
    template: "#map-case-wnews-ads",
    props: {
        getAd: Function,
        adsAmount: Number,
    },
    data: () => ({

    }),
    methods: {
        get () {
            if (!this.adsAmount) {
                mapCase.showRedMessage("Нет объявлений<br />для редактирования!");
                return;
            }

            mapCase.showLoad();
            this.getAd();
        },
    }
});

Vue.component("map-case-wnews-over-ads", {
    template: "#map-case-wnews-over-ads",
    props: {
        adData: Object,
    },
    data: () => ({
        header: "Редактирования объявления от",
        text: "",
        editMod: false,
        refuseMod: false,
    }),
    methods: {
        edit () {
            this.editMod = true;
        },
        send () {
            if (!this.text)
                return;
            mapCase.showLoad();
            mapCase.currentOverWindow = null;
            this.adData.send({...this.adData.ad, text: this.text});
        },
        refuse () {
            if (this.refuseMod) {
                if (!this.text)
                    return;
                mapCase.showLoad();
                mapCase.currentOverWindow = null;
                this.adData.refuse({...this.adData.ad, text: this.text});
                return;
            }

            this.header = "Причина отказа объявления от";
            this.text = "";
            this.editMod = true;
            this.refuseMod = true;
        },
        setFocus(enable) {
            mapCase.inputFocus = enable;
        },
    },
    mounted () {
        this.text = this.adData.ad.text;
        // this.$el.children[1].innerText = this.text;
    },
});

Vue.component('map-case-wnews-storage', {
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

var mapCaseWnewsAdsData = {
    adsAmount: 0,
    adData: {
        ad: { text: "", author: "" },
        maxLength: 60,
        send: (adData) => {},
        refuse: (adData) => {},
    },
    getAd: () => {},
    setAd (adData) {
        if (typeof adData == 'string') adData = JSON.parse(adData);
        this.adData.ad = adData;

        mapCase.currentOverWindow = `map-case-wnews-over-ads`;
        mapCase.hideLoad();
    },
}

var mapCaseWnewsMembersData = {
    list: [],
    ranks: [],
    sortMod: {
        mod: "num",
        update (mod) {
            this.mod = mod;
        }
    },
    rankHead: "Должность",
    setRanks (ranksList) {
        if (typeof ranksList == 'string') ranksList = JSON.parse(ranksList);
        this.ranks = ranksList;
    },
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
    dismiss (data) {},
    lowerRank (data) {},
    raiseRank (data) {},
}

var mapCaseWnewsStorage = {
    lock: false,
    switchStorage(lock) {
        var ranks = mapCase.ranks;
        var maxRankName = ranks[ranks.length - 1];
        if (statistics['factionRank'].value !== maxRankName) return mapCase.showRedMessage('Вы не лидер');
        mp.trigger(`callRemote`, `factions.holder.common.state`, lock);
        mapCaseWnewsStorage.lock = !lock;
    }
}

var mapCaseWnewsPermissions = {
    categories: ['transport', 'structure', 'form', 'equipment'],
    getData(tab) { // tab - имя вкладки (из this.categories) для которой запрашиваются данные
        mapCase.getData(tab);
    },
}

var mapCaseWnewsPermissionsTab = {
    list: [],
    type: "",
    setResult(list, type) {
        list = mapCase.setResult(list, type);
        if (typeof list == 'string') list = JSON.parse(list);
        this.list = list;
        this.type = type;

        mapCaseWnewsData.menuBody[mapCase.menuFocus].windows.push("permissions-tab");
        mapCase.hideLoad();
    },
}

var mapCaseWnewsRanks = {
    list: [],
    switchSalary(id, salary) {
        // TODO: Реализовать запрос на сервер со сменой зп
        mapCase.hideLoad();
    }
}

var mapCaseWnewsWindowsData = {
    ads: mapCaseWnewsAdsData,
    members: mapCaseWnewsMembersData,
    storage: mapCaseWnewsStorage,
    ranks: mapCaseWnewsRanks,
    permissions: mapCaseWnewsPermissions,
    'permissions-tab': mapCaseWnewsPermissionsTab,
}

var mapCaseWnewsData =  {
    menuHeader: "Weazel News",
    // menuHeaderName: "img/mapCase/wnews-head-name.svg",
    menuTitle: "Добро пожаловать,",
    menuHeaderImg: "img/mapCase/logo-wnews.svg",
    windowsData: mapCaseWnewsWindowsData,
    menuBody: {
        ads: {
            title: "Объявления",
            img: mapCaseSvgPaths.newsPaper,
            windows: ["ads"],
        },
        members: {
            title: "Список сотрудников",
            img: mapCaseSvgPaths.users,
            windows: ["members"],
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
}


//api
/*
    mapCaseWnewsMembersData.list = [{ num, name, rank }];

    массив, отображающийся в списке сотрудников
*/
/*
    mapCaseWnewsAdsData.adsAmount = int;

    Кол-во сообщений для редактирования.
*/
/*
    mapCaseWnewsAdsData.setAd({ text: str, author: str });

    Показывает всплывающее окно для редактирования объявления
    Параметр - объект с обязательными свойствами:
        text - содержание объявления
        author - автор объявления
*/
/*
    mapCaseWnewsAdsData.adData.maxLength = int

    Устанавливает максимальное кол-во символов в текстовом поле редактирования сообщения. Стандартно 380.
*/



//Следущие функции необходимо реализовать
//Для примера в них реализованы импровизированные ответы от сервера

//Функция, устанавливающая массив рангов (от младшего к старшему)
mapCaseWnewsMembersData.setRanks(["Старший редахтер", "Альпака", "Главный уборщик", "Старший Альпака"]);


//Функция, срабатывающая при увольнение сотрудника
//data - данные о сотруднике из записи в списке
mapCaseWnewsMembersData.dismiss = (data) => {
    mp.trigger(`callRemote`, `mapCase.news.members.uval`, data.id);
}


//Функция, срабатывающая при понижении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseWnewsMembersData.lowerRank = (data) => {
    if (data.rank <= 1)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет мин. ранг - ${mapCaseWnewsMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.news.rank.lower`, data.id);
}


//Функция, срабатывающая при повышении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseWnewsMembersData.raiseRank = (data) => {
    if (data.rank >= mapCaseWnewsMembersData.ranks.length)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет макс. ранг - ${mapCaseWnewsMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.news.rank.raise`, data.id);
}

//Функция, срабатывающая при запросе объявления
mapCaseWnewsAdsData.getAd = () => {
    mp.trigger(`callRemote`, `mapCase.news.ads.get`);
    // setTimeout(() => {
    //     let adData = {
    //         text: "Тачку хачу купить",
    //         author: "Cy Raider",
    //     };
    //     mapCaseWnewsAdsData.setAd(adData);
    // }, 3000);
}

//Функция, срабатывающая при отпралении объявления
//adData - информация об объявлении ({ text, author })
mapCaseWnewsAdsData.adData.send = (adData) => {
    mp.trigger(`callRemote`, `mapCase.news.ads.accept`, JSON.stringify(adData));
    // console.log(adData);
    // setTimeout(() => {
    //     mapCase.showGreenMessage(`Объявление<br />отправлено!`);
    //     mapCaseWnewsAdsData.adsAmount--;
    // }, 3000);
}

//Функция, срабатывающая при отказе публикации
//adData - информация об объявлении ({ text, author })
mapCaseWnewsAdsData.adData.refuse = (adData) => {
    mp.trigger(`callRemote`, `mapCase.news.ads.cancel`, JSON.stringify(adData));
    // console.log(adData);
    // setTimeout(() => {
    //     mapCase.showRedMessage(`Отказано<br />в публикации!`);
    //     mapCaseWnewsAdsData.adsAmount--;
    // }, 3000);
}

//for tests

/*mapCaseWnewsMembersData.list = [
    {
        num: 1,
        name: "Curys Raider",
        rank: 2,
    },
    {
        num: 2,
        name: "Curysirusew Raiderderder",
        rank: 1,
    },
    {
        num: 3,
        name: "Curysirusew Raiderderder",
        rank: 1,
    },
];*/

mapCaseWnewsAdsData.adsAmount = 0;
