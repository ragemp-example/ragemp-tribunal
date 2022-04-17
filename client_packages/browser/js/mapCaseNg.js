Vue.component('map-case-ng-storage', {
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

var mapCaseNgStorage = {
    lock: false,
    switchStorage(lock) {
        var ranks = mapCase.ranks;
        var maxRankName = ranks[ranks.length - 1];
        if (statistics['factionRank'].value !== maxRankName) return mapCase.showRedMessage('Вы не лидер');
        mp.trigger(`callRemote`, `factions.holder.common.state`, lock);
        mapCaseNgStorage.lock = !lock;
    }
}

var mapCaseNgPermissions = {
    categories: ['transport', 'weapons', 'bullets', 'structure', 'form', 'equipment'],
    getData(tab) { // tab - имя вкладки (из this.categories) для которой запрашиваются данные
        mapCase.getData(tab);
    },
}

var mapCaseNgPermissionsTab = {
    list: [],
    type: "",
    setResult(list, type) {
        list = mapCase.setResult(list, type);
        if (typeof list == 'string') list = JSON.parse(list);
        this.list = list;
        this.type = type;

        mapCaseNgData.menuBody[mapCase.menuFocus].windows.push("permissions-tab");
        mapCase.hideLoad();
    },
}

var mapCaseNgRanks = {
    list: [],
    switchSalary(id, salary) {
        // TODO: Реализовать запрос на сервер со сменой зп
        mapCase.hideLoad();
    }
}

var mapCaseNgMembersData = {
    list: [],
    ranks: [],
    sortMod: {
        mod: "num",
        update (mod) {
            this.mod = mod;
        }
    },
    rankHead: "Звание",
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

var mapCaseNgWindowsData = {
    members: mapCaseNgMembersData,
    storage: mapCaseNgStorage,
    ranks: mapCaseNgRanks,
    permissions: mapCaseNgPermissions,
    'permissions-tab': mapCaseNgPermissionsTab,
}

var mapCaseNgData =  {
    menuHeader: 'National Guard',
    menuTitle: "Добро пожаловать,",
    menuHeaderImg: "img/mapCase/logo-army.png",
    windowsData: mapCaseNgWindowsData,
    menuBody: {
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
    mapCaseEmsCallsData.list = [{num, name, description}];

    массив, отображающийся в списке вызовов
*/
/*
    mapCaseEmsMembersData.list = [{ num, name, rank }];

    массив, отображающийся в списке сотрудников
*/


//Следущие функции необходимо реализовать
//Для примера в них реализованы импровизированные ответы от сервера

//Функция, срабатывающая при принятии вызова
//data - данные о вызове

//Функция, устанавливающая массив рангов (от младшего к старшему)
mapCaseNgMembersData.setRanks(["Старший медик", "Альпака", "Главный уборщик", "Старший Альпака"]);


//Функция, срабатывающая при увольнение сотрудника
//data - данные о сотруднике из записи в списке
mapCaseNgMembersData.dismiss = (data) => {
    mp.trigger(`callRemote`, `mapCase.army.members.uval`, data.id);
}


//Функция, срабатывающая при понижении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseNgMembersData.lowerRank = (data) => {
    if (data.rank <= 1)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет мин. ранг - ${mapCaseNgMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.army.rank.lower`, data.id);
}


//Функция, срабатывающая при повышении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseNgMembersData.raiseRank = (data) => {
    if (data.rank >= mapCaseNgMembersData.ranks.length)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет макс. ранг - ${mapCaseNgMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.army.rank.raise`, data.id);
}


//for tests
/*mapCaseEmsCallsData.list = [
    {
        num: 2,
        name: "Curys Raider",
        description: "ПАльпака покусал",
    },
    {
        num: 1,
        name: "ACurysirusew Raiderderder",
        description: "Альпака покусал",
    },
    {
        num: 3,
        name: "Curysirusew Raiderderder",
        description: "Альпака покусал",
    },
    {
        num: 4,
        name: "Curys Raider",
        description: "Альпака покусал",
    },
];*/

/*mapCaseEmsMembersData.list = [
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
