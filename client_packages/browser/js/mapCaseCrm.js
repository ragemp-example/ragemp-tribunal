Vue.component('map-case-crm-cpermissions', {
    template: "#map-case-cpermissions",
    props: {
        categories: Array,
        getData: Function,
        list: Array,
        ranks: Array,
    },
    data: () => ({
        current: 'transport',
        pullCats: {
            transport: {
                label: "Траспорт",
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
            // form: {
            //     label: "Форма",
            // },
            // equipment: {
            //     label: "Снаряжение",
            // }
        }
    }),
    computed: {
        tableData() {

            return {
                list: this.list,
                type: this.current,
                ranks: this.ranks,
            }
        }
    },
    methods: {
        transition(cat) {
            mapCase.showLoad();
            this.current = cat;
            this.getData(cat);
        }
    },
    mounted() {
        mapCase.showLoad();
        this.getData(this.current);
    }
});

Vue.component('map-case-crm-storage', {
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

var mapCaseCrmMembersData = {
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
    clear() {
        this.list = [];
    },
    dismiss (data) {},
    lowerRank (data) {},
    raiseRank (data) {},
}

var mapCaseCrmRanks = {
    list: [],
    switchSalary(id, salary) {
        // TODO: Реализовать запрос на сервер со сменой зп
        mapCase.hideLoad();
    }
}

var mapCaseCrmPermissions = {
    list: [],
    getData(tab) { // tab - имя вкладки (из this.categories) для которой запрашиваются данные
        // TODO: Реализовать запрос
        mapCase.getData(tab);
    },
    setResult(list, type) {
        list = mapCase.setResult(list, type);
        if (typeof list == 'string') list = JSON.parse(list);
        this.list = list;
        this.type = type;

        //mapCasePdData.menuBody[mapCase.menuFocus].windows.push("permissions-tab");
        mapCase.hideLoad();
    },
}

var mapCaseCrmStorage = {
    lock: false,
    switchStorage(lock) {
        this.lock = !this.lock;
        // TODO: Смена статуса склада (lock == текущий), в ответ меняем mapCasePdStorage.lock = !lock
    }
}

var mapCaseCrmWindowsData = {
    members: mapCaseCrmMembersData,
    ranks: mapCaseCrmRanks,
    cpermissions: mapCaseCrmPermissions,
    storage: mapCaseCrmStorage,
}


var mapCaseCrmData =  {
    windowsData: mapCaseCrmWindowsData,
    menuBody: {
        members: {
            title: "Список сотрудников",
            windows: ["members"],
        },
        ranks: {
            title: "Ранги",
            windows: ["ranks"]
        },
        cpermissions: {
            title: "Разрешения",
            windows: ["cpermissions"]
        },
        storage: {
            title: "Общий шкаф",
            windows: ["storage"]
        }
    },
}


//api
/*
    mapCaseCrmMembersData.list = [{ num, name, rank }];
    массив, отображающийся в списке сотрудников
*/


//Следущие функции необходимо реализовать
//Для примера в них реализованы импровизированные ответы от сервера

//Функция, срабатывающая при принятии вызова
//data - данные о вызове

//Функция, устанавливающая массив рангов (от младшего к старшему)
mapCaseCrmMembersData.setRanks(["Старший медик", "Альпака", "Главный уборщик", "Старший Альпака"]);


//Функция, срабатывающая при увольнение сотрудника
//data - данные о сотруднике из записи в списке
mapCaseCrmMembersData.dismiss = (data) => {
    // TODO: Поменять на чвк
    mp.trigger(`callRemote`, `mapCase.crm.members.uval`, data.id);
}


//Функция, срабатывающая при понижении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseCrmMembersData.lowerRank = (data) => {
    if (data.rank <= 1)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет мин. ранг - ${mapCaseCrmMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.crm.rank.lower`, data.id);
}


//Функция, срабатывающая при повышении сотрудника (крайние случаи не обработаны, может выйти за пределы массива рангов)
//data - данные о сотруднике из записи в списке
mapCaseCrmMembersData.raiseRank = (data) => {
    if (data.rank >= mapCaseCrmMembersData.ranks.length)
        return mapCase.showRedMessage(`<span>${data.name}</span><br /> имеет макс. ранг - ${mapCaseCrmMembersData.ranks[data.rank - 1]}`);
    mp.trigger(`callRemote`, `mapCase.crm.rank.raise`, data.id);
}
