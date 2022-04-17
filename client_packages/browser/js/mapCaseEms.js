Vue.component('map-case-ems-storage', {
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

var mapCaseEmsCallsData = {
    list: [],
    sortMod: {
        mod: "num",
        update (mod) {
            this.mod = mod;
        }
    },
    accept (data) {},
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

var mapCaseEmsStorage = {
    lock: false,
    switchStorage(lock) {
        var ranks = mapCase.ranks;
        var maxRankName = ranks[ranks.length - 1];
        if (statistics['factionRank'].value !== maxRankName) return mapCase.showRedMessage('Вы не лидер');
        mp.trigger(`callRemote`, `factions.holder.common.state`, lock);
        mapCaseEmsStorage.lock = !lock;
    }
}

var mapCaseEmsPermissions = {
    categories: ['transport', /*'weapons', 'bullets',*/ 'structure', 'form', 'equipment'],
    getData(tab) { // tab - имя вкладки (из this.categories) для которой запрашиваются данные
        mapCase.getData(tab);
    },
}

var mapCaseEmsPermissionsTab = {
    list: [],
    type: "",
    setResult(list, type) {
        list = mapCase.setResult(list, type);
        if (typeof list == 'string') list = JSON.parse(list);
        this.list = list;
        this.type = type;

        mapCaseEmsData.menuBody[mapCase.menuFocus].windows.push("permissions-tab");
        mapCase.hideLoad();
    },
}

var mapCaseEmsRanks = {
    list: [],
    switchSalary(id, salary) {
        // TODO: Реализовать запрос на сервер со сменой зп
        mapCase.hideLoad();
    }
}

var mapCaseEmsMembersData = {
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

var mapCaseEmsWindowsData = {
    calls: mapCaseEmsCallsData,
    members: mapCaseEmsMembersData,
    storage: mapCaseEmsStorage,
    ranks: mapCaseEmsRanks,
    permissions: mapCaseEmsPermissions,
    'permissions-tab': mapCaseEmsPermissionsTab,
}

var mapCaseEmsData =  {
    menuHeader: 'Emergency Medical Center',
    menuTitle: "Добро пожаловать,",
    menuHeaderImg: "",
    windowsData: mapCaseEmsWindowsData,
    menuBody: {
        calls: {
            title: "Вызовы",
            img: mapCaseSvgPaths.smartphone,
            windows: ["calls"],
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
/*mapCaseEmsCallsData.list.push({num: 32, name: "Cyrus Rader", description: "Раненный, требуется медицинская помощь!", pos: {x: 10, y: 10 }});
mapCaseEmsCallsData.list.push({num: 32, name: "Cyrus Rader", description: "Раненный, требуется медицинская помощь!", pos: {x: 10, y: 10 }});
mapCaseEmsCallsData.list.push({num: 32, name: "Cyrus Rader", description: "Раненный, требуется медицинская помощь!", pos: {x: 10, y: 10 }});
mapCaseEmsCallsData.list.push({num: 32, name: "Cyrus Rader", description: "Раненный, требуется медицинская помощь!", pos: {x: 10, y: 10 }});
mapCaseEmsCallsData.list.push({num: 32, name: "Cyrus Rader", description: "Раненный, требуется медицинская помощь!", pos: {x: 10, y: 10 }});*/
//api
/*
    mapCaseEmsCallsData.list = [{num, name, description, pos: {x, y}}];

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
mapCaseEmsCallsData.accept = (data) => {
    mp.trigger(`callRemote`, `mapCase.ems.calls.accept`, data.id);
}

//Функция, устанавливающая массив рангов (от младшего к старшему)
mapCaseEmsMembersData.setRanks(["Старший медик", "Альпака", "Главный уборщик", "Старший Альпака"]);


//Функция, срабатывающая при увольнение сотрудника
//data - данные о сотруднике из записи в списке
mapCaseEmsMembersData.dismiss = (data) => {
    mp.trigger(`callRemote`, `mapCase.ems.members.uval`, data.id);
}


//Функция, срабатывающая при понижении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseEmsMembersData.lowerRank = (data) => {
    if (data.rank <= 1)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет мин. ранг - ${mapCaseEmsMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.ems.rank.lower`, data.id);
}


//Функция, срабатывающая при повышении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseEmsMembersData.raiseRank = (data) => {
    if (data.rank >= mapCaseEmsMembersData.ranks.length)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет макс. ранг - ${mapCaseEmsMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.ems.rank.raise`, data.id);
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
