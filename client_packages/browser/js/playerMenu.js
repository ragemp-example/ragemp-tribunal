Vue.filter("playerMenuMoneySplit", (value, thisFilter) => {
    if (!thisFilter) return value;
    value = value + '';
    return value.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ') + " $";
});

Vue.filter("prettyMinutes", (value, thisFilter) => {
    if (!thisFilter) return value;

    var hours = parseInt(value / 60);
    if (!hours) return `${value} мин.`;

    var minutes = value % 60;
    return `${hours} ч ${minutes} мин`;
});

function playerMenuMoneySplit(value) {
    value = value + '';
    return value.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
}

let convertWindowData = {
    coefficient: 123, // API: Коеффициент конвертации.
    acceptConvert(amount) {
        // TODO: Конвертация валюты; amount - СС для обмена.
        if (isNaN(amount) || amount <= 0) return notifications.push("error", "Некорректное значение");
        mp.trigger(`callRemote`, `donate.convert`, parseInt(amount));
        playerMenu.coins -= amount;
    }
};

let changenameWindowData = {
    price: 120, // API: Стоимостть смены никнейма.
    acceptChange(firstname, lastname) {
        // TODO: Смена никнейма;
        firstname = firstname[0].toUpperCase() + firstname.toLowerCase().substring(1, 20);
        lastname = lastname[0].toUpperCase() + lastname.toLowerCase().substring(1, 20);
        var name = firstname + " " + lastname;
        mp.trigger(`callRemote`, `donate.nickname.set`, name);
        // playerMenu.coins -= 120;
    }
};

let changeskinWindowData = {
    price: 150, // API: Стоимостть смены внешности.
    acceptChange() {
        // TODO: Смена внешности;
        playerMenu.show = false;
        mp.trigger('callRemote', "characterInit.change");
    }
};

let warnWindowData = {
    amountWarns: 1, // API: Кол-во варнов.
    price: 75, // API: Стоимостть снятия варна.
    takeoffWarn() {
        // TODO: Снятие варна;
        mp.trigger(`callRemote`, `donate.warns.clear`);

        // warnWindowData.amountWarns--; //this не канает...
    }
};

let addslotWindowData = {
    amountSlots: 2, // API: Кол-во слотов.
    maxSlots: 5, // API: Максимальное кол-во слотов.
    price: 120, // API: Стоимостть слота.
    addSlot() {
        // TODO: Добавление слота;
        mp.trigger(`callRemote`, `donate.slots.add`);
        // addslotWindowData.amountSlots++;
    }
};

let settingsmainWindowData = {
    currentWindow: '0',
    settingsList: {
        spawn: {
            type: 'scroll',
            head: 'Место спавна',
            pull: ["Улица", "Дом", "Организация"],
            value: 1,
        },
        // microVolume: {
        //     type: 'range',
        //     head: 'Громкость микрофона',
        //     value: 20,
        // },
        chatTimestamp: {
            type: 'scroll',
            head: 'Время в чате',
            pull: ["Выкл", "Вкл"],
            value: 0,
        },
        chatSize: {
            type: 'scroll',
            head: 'Размер чата',
            pull: ["Мелкий", "Обычный", "Крупный", "Огромный"],
            value: 0,
        },
        nicknames: {
            type: 'scroll',
            head: 'Никнеймы',
            pull: ["Выкл", "Вкл"],
            value: 0,
        },
        hudKeys: {
            type: 'scroll',
            head: 'Подсказки кнопок',
            pull: ["Выкл", "Вкл"],
            value: 0,
        },
        ghetto: {
            type: 'scroll',
            head: 'Гетто/рекеты на карте',
            pull: ["Выкл", "Вкл"],
            value: 0,
        },
        walking: {
            type: 'scroll',
            head: 'Походка',
            pull: ["Обычная", "Храбрая", "Уверенная", "Гангстер", "Быстрая", "Грустная", "Крылатая"],
            value: 0,
        },
        mood: {
            type: 'scroll',
            head: 'Эмоция',
            pull: ["Обычный", "Угрюмый", "Сердитый", "Счастливый", "Счастливый", "Стресс", "Надутый"],
            value: 0,
        },
    },

    saveChanges(modifiedSettings) {
        // TODO: Сохранение изменений;

        playerMenu.setSettings(modifiedSettings);
        mp.trigger(`callRemote`, `settings.set`, JSON.stringify(modifiedSettings));
    }
}

let protectionWindowData = {
    email: "swiftdunhill@mail.ru", // API: адрес почты.
    isConfirmed: false, // API: Подверждена ли почта.
    passMatched: null, // API: Совпал ли пароль.
    passMessage: "изменён 4 дня назад", // API: Сообщение о последнем изменени пароля.
    maxWaiting: 60, // API: Время блока кнопки отмены.

    codeMod: false,
    codeChecking: false,
    wating: '',
    intervalId: null,
    seconds: 0,

    changeMail(mail) {
        // TODO: Сохранить новый почтовый адрес

        mp.trigger(`callRemote`, `settings.email.set`, mail);

        // protectionWindowData.email = mail;
        // protectionWindowData.isConfirmed = 0;
    },
    sendCode() {
        // TODO: Отправить код на почту
        mp.trigger(`callRemote`, `settings.email.confirm`);
    },
    checkCode(code) {
        // TODO: Проверить код
        mp.trigger(`callRemote`, `settings.email.code.check`, code);
        // Если код верный
        // protectionWindowData.isConfirmed = true;
        // console.log("чекнули");
        // Что иначе, я хз...
    },
    changePassword(oldPass, newPass) {
        // TODO: Сменить пароль
        var data = {
            oldPass: oldPass,
            newPass: newPass
        };
        mp.trigger(`callRemote`, `settings.password.set`, JSON.stringify(data));
        // console.log("Сменили пароль");
        // protectionWindowData.passMessage = "изменён сегодня";
    }
}

let settingsMenuData = {
    head: "Настройки",
    headImg: "img/playerMenu/list.svg",
    menu: [{
            head: "Общие настройки",
            img: playerMenuSvgPaths.settings,
            window: "player-menu-settings-main",
            windowData: settingsmainWindowData
        },
        {
            head: "Защита аккаунта",
            img: playerMenuSvgPaths.insurance,
            window: "player-menu-settings-protection",
            windowData: protectionWindowData
        },
    ],
    bottom: {
        head: "Выход",
        img: playerMenuSvgPaths.exit,
        handler() {
            playerMenu.showConfirmWindow(
                "Подтверждение действия",
                `Вы действительно хотите <br />
                отключиться от сервера?
                `,
                () => {
                    mp.trigger(`callRemote`, `playerMenu.kick`);
                },
            );
        }
    },
};

let donateMenuData = {
    head: "Донат",
    headImg: "img/playerMenu/settings.svg",
    menu: [{
            head: "Конвертация валюты",
            img: playerMenuSvgPaths.mailing,
            window: "player-menu-donate-convert",
            windowData: convertWindowData
        },
        // {
        //     head: "Смена никнейма",
        //     img: playerMenuSvgPaths.idCard,
        //     window: "player-menu-donate-changename",
        //     windowData: changenameWindowData
        // },
        {
            head: "Смена внешности",
            img: playerMenuSvgPaths.idCard,
            window: "player-menu-donate-changeskin",
            windowData: changeskinWindowData
        },
        {
            head: "Снятие варна",
            img: playerMenuSvgPaths.postcard,
            window: "player-menu-donate-warn",
            windowData: warnWindowData
        },
        // {
        //     head: "Добавление слота",
        //     img: playerMenuSvgPaths.expansion,
        //     window: "player-menu-donate-addslot",
        //     windowData: addslotWindowData
        // },
    ],
};

let referenceData = {
    code: "LDLSF3", // API: промокод.
    amountInvitees: 4, // API: Кол-во приглашённых.
    amountCompleted: 0, // API: Кол-во выполнивших.
}

let menuBar = [{
        head: "Персонаж",
        window: "player-menu-character",
        windowData: {}
    },
    {
        head: "Настройки",
        window: "player-menu-window-sidebar",
        windowData: settingsMenuData
    },
    {
        head: "Репорт",
        window: "player-menu-report",
        windowData: {}
    },
    {
        head: "Помощь",
        window: "player-menu-help",
        windowData: {}
    },
    {
        head: "Промокод",
        window: "player-menu-reference",
        windowData: referenceData
    },
    {
        head: "Донат",
        window: "player-menu-window-sidebar",
        windowData: donateMenuData
    },
];

let socialData = [{
        head: "Обычный житель",
        img: "./img/playerMenu/user.svg"
    },
    {
        head: "Администратор",
        img: "./img/playerMenu/admin.svg"
    },
    {
        head: "Госслужащий",
        img: "./img/playerMenu/capitol.svg"
    },
    {
        head: "Бандит",
        img: "./img/playerMenu/hat.svg"
    },
    {
        head: "Медиа",
        img: "./img/playerMenu/media.svg"
    },
];

let statistics = {
    // TODO: Заполнить структуру статистики
    "minutes": {
        head: "Времени на сервере",
        value: "-",
        minutesFilter: true,
    },
    "sex": {
        head: "Пол",
        value: "-"
    },
    "spouse": {
        head: "Семейное положение",
        value: "-"
    },
    "cash": {
        head: "Денег на руках",
        value: 0,
        color: "#0f0",
        moneyFilter: true
    },
    "casinoChips": {
        head: "Фишек казино",
        value: 0,
        color: "#2496FF",
    },
    "number": {
        head: "Номер",
        value: "-"
    },
    "factionName": {
        head: "Организация",
        value: "-"
    },
    "factionRank": {
        head: "Должность",
        value: "-"
    },
    "jobName": {
        head: "Работа",
        value: "-"
    },
    "familiar": {
        head: "Знакомые",
        value: "-"
    },
    "wanted": {
        head: "Ур. розыска",
        value: "-"
    },
    "law": {
        head: "Законопослушность",
        value: "-"
    },
    "crimes": {
        head: "Преступления",
        value: "-"
    },
    "fines": {
        head: "Штрафы",
        value: "-"
    },
    "narcotism": {
        head: "Наркозависимость",
        value: "-"
    },
    "nicotine": {
        head: "Зависимость от никотина",
        value: "-"
    },
};

let houseInfo = [
    {
        head: "Класс",
        value: "-",
    },
    {
        head: "Улица",
        value: "-",
    },
    {
        head: "Номер",
        value: "-",
    },
    // {
    //     head: "Комнат",
    //     value: 0,
    // },
    // {
    //     head: "Вместительность гаража",
    //     value: 0,
    // },
    // {
    //     head: "Гос. стоимость",
    //     value: 0,
    //     color: "#0f0",
    //     moneyFilter: true
    // },
];

let businessInfo = [
    {
        head: "Тип",
        value: "-"
    },
    {
        head: "Имя",
        value: "-",
    },
    {
        head: "Номер",
        value: "-",
    },
    // {
    //     head: "Улица",
    //     value: "-",
    // },
    // {
    //     head: "Гос. стоимость",
    //     value: 0,
    //     color: "#0f0",
    //     moneyFilter: true
    // },
];

let skills = [
    // {
    //     head: "Таксист",
    //     value: 75
    // },
    // {
    //     head: "автомеханик",
    //     value: 40
    // },
    // {
    //     head: "фермер",
    //     value: 100
    // },
    // {
    //     head: "водитель автобуса",
    //     value: 0
    // },
    // {
    //     head: "Terminator1",
    //     value: 20
    // },
    // {
    //     head: "Terminator1",
    //     value: 20
    // },
    // {
    //     head: "Terminator1",
    //     value: 20
    // },
    // {
    //     head: "Terminator1",
    //     value: 20
    // }
];

let helpMessages = [
    // TODO: Массив заполняется вопросами (которые в help)
    {
        question: "Как познакомиться с другим игроком?",
        answer: `По умолчанию вы не видите никнеймы других игроков. Чтобы видеть никнейм игрока, вам нужно познакомиться с ним.
        Чтобы познакомиться с игроком, нужно подойти к нему и нажать Е. В открывшемся меню взаимодействия нужно выбрать пункт “Знакомство”.`
    },
    {
        question: "Как скрыть чат или HUD?",
        answer: `Чат можно скрыть нажатием клавиши F7, а худ - нажатием F5.`
    },
    {
        question: "Как перезагрузить голосовой чат?",
        answer: `Если вы не слышите других игроков или игроки не слышат вас, вы можете попробовать перезагрузить войс-чат нажатием клавиши F4.`
    },
    {
        question: "Можно ли иметь машину без дома?",
        answer: `Да, вы можете иметь одно любое транспортное средство без дома. Приобрести автомобиль можно в автосалоне,
        на авторынке или у другого игрока. Купленный транспорт будет храниться на одной из парковок.`
    },
    {
        question: "Как продать машину?",
        answer: `Продать свой автомобиль можно двумя способами — продать на руки игроку или государству на авторынке.
        Чтобы продать транспорт игроку, вы должны находиться в своем транспорте и нажать на клавишу L. После этого нужно выбрать пункт “Продать”.
        Чтобы продать автомобиль государству вы должны приехать на авторынок, заехать на голубую метку и нажать Е.`
    },
    {
        question: "Как продать дом?",
        answer: `Продать свой дом игроку или государству можно в приложении на телефоне “Дом”.`
    },
    {
        question: "Как получить лицензии?",
        answer: "Лицензии выдаются сотрудниками Government."
    },
    {
        question: "Как посмотреть свои документы?",
        answer: `Чтобы посмотреть свои документы, нужно нажать на кнопку L, затем выбрать пункт “Документы”.`
    },
    {
        question: "Как показать свои документы другому игроку?",
        answer: `Чтобы показать игроку документы, нужно подойти к игроку и нажать кнопку Е. Это откроет меню взаимодействия, где будет пункт “Документы”.`
    },

    {
        question: "Как включить поворотники/аварийную сигнализацию?",
        answer: `Чтобы включить поворотники/аварийную сигнализацию, нужно находиться в автомобиле и нажать одну из клавиш.
        Для включения поворотников используйте стрелки влево/вправо, а для включения аварийной сигнализации стрелку вниз.`
    },
    {
        question: "Я увидел нарушение, что делать?",
        answer: `Вы можете пожаловаться на нарушителя  в разделе “Репорт” в личном меню. При отправке жалобы указывайте ID игрока.
        Если у вас есть запись нарушения, то вы можете оставить жалобу на форуме.`
    },
];

var playerMenu = new Vue({
    el: "#player-menu",
    data: {
        show: false,
        enable: false,
        inputFocus: false,
        lastShowTime: 0,
        menuBar: menuBar,
        socialData: socialData,
        menuBarFocus: menuBar[0],
        name: "Cyrus Raider", // API: Имя игрока
        admin: 1,
        factionId: 0,
        media: 0,
        coins: 1000, // API: СС
        dateTimer: null,
        minutesTimer: null,
        time: '00:00',
        date: '00.00.0000',
        confirmation: null,
        codeMod: false,
        code: '',
        longName: false,
    },
    computed: {
        blurMod() {
            return this.confirmation;
        },
        socialStatus() {
            // API: социальный статус //0-гражданский/1-админ/2-госс/3-бандит/4-медиа
            if (this.admin) return 1;
            if (this.media) return 4;
            if (!this.factionId) return 0;
            if (this.factionId < 8) return 2;

            return 3;
        },
    },
    methods: {
        onClickMenuBarItem(name) {
            this.menuBarFocus = name;
            settingsmainWindowData.currentWindow = name.window;
        },
        onClickExit() {
            this.show = false;
        },
        showConfirmWindow(head, description, handler, leftWord, rightWord) {
            this.confirmation = {
                head: head,
                description: description,
                leftWord: (leftWord) ? leftWord : 'Подтвердить',
                rightWord: (rightWord) ? rightWord : 'Отказаться',
                acceptHandler: handler,
            }
        },
        enterCode() {
            this.codeMod = true;
            playerMenu.showConfirmWindow(
                "Ввод промокода",
                `Промокод - краткий код, созданный админстрацией для<br /> поощрения игроков<br />
                различными бонусами и игровой валютой
                `,
                this.sendCode,
                "Отправить",
                "Назад",
            );
        },
        sendCode() {
            // TODO: Отправка промокода .this.code
            // console.log(this.code);
            if (this.code) mp.trigger(`callRemote`, `promocodes.activate`, this.code);

            this.codeMod = false; //Оставить!
        },
        init(data) {
            if (typeof data == 'string') data = JSON.parse(data);

            this.name = data.playerName;
            this.coins = data.donate;
            this.admin = data.admin;
            this.factionId = data.factionId;

            this.setBiz(data.biz);
            this.setHouse(data.house);
            this.setStatistics(data);
            this.setDonatePrice(data);
            this.setSlots(data.slots);
            this.setPromocode(data.promocode);
            this.setInvited(data.invited);
            this.setCompleted(data.completed);
            this.setMedia(data.media);
            this.setPasswordDate(data.passwordDate);
            this.setSettings(data.settings);
            this.setEmail(data.email, data.confirmEmail);
            this.setChips(data.chips);

            addslotWindowData.maxSlots = data.slotsMax;
        },
        setBiz(biz) {
            if (typeof biz == 'string') biz = JSON.parse(biz);
            if (biz) {
                businessInfo = [
                    {
                        head: "Номер",
                        value: biz.id,
                    },
                    {
                        head: "Тип",
                        value: biz.type
                    },
                    {
                        head: "Имя",
                        value: biz.name,
                    },
                    // {
                    //     head: "Улица",
                    //     value: biz.street,
                    // },
                    // {
                    //     head: "Гос. стоимость",
                    //     value: biz.price,
                    //     color: "#0f0",
                    //     moneyFilter: true
                    // }
                ];
            } else {
                businessInfo = [
                    {
                        head: "Номер",
                        value: "-",
                    },
                    {
                        head: "Тип",
                        value: "-",
                    },
                    {
                        head: "Имя",
                        value: "-",
                    },
                ];
            }
        },
        setHouse(house) {
            if (typeof house == 'string') house = JSON.parse(house);
            if (house) {
                houseInfo = [{
                        head: "Номер",
                        value: house.id,
                    },
                    {
                        head: "Класс",
                        value: house.class,
                    },
                    {
                        head: "Улица",
                        value: house.street,
                    },

                    // {
                    //     head: "Комнат",
                    //     value: house.rooms,
                    // },
                    // {
                    //     head: "Вместительность гаража",
                    //     value: house.carPlaces,
                    // },
                    // {
                    //     head: "Гос. стоимость",
                    //     value: house.price,
                    //     color: "#0f0",
                    //     moneyFilter: true
                    // },
                ];
            } else {
                houseInfo = [
                    {
                        head: "Номер",
                        value: "-",
                    },
                    {
                        head: "Класс",
                        value: "-",
                    },
                    {
                        head: "Улица",
                        value: "-",
                    },
                ];
            }
        },
        setStatistics(stats) {
            if (typeof stats == 'string') stats = JSON.parse(stats);
            statistics["minutes"].value = stats.minutes;
            statistics["sex"].value = ["Мужской", "Женский"][stats.gender];
            statistics["cash"].value = stats.cash;
            statistics["factionName"].value = stats.factionName || "-";
            statistics["factionRank"].value = stats.factionRank || "-";
            statistics["jobName"].value = stats.jobName || "-";
            statistics["wanted"].value = `${stats.wanted} зв.`;
            statistics["law"].value = stats.law;
            statistics["crimes"].value = stats.crimes;
            statistics["fines"].value = stats.fines;
            statistics["narcotism"].value = stats.narcotism;
            statistics["nicotine"].value = stats.nicotine;

            clearInterval(this.minutesTimer);
            this.minutesTimer = setInterval(() => {
                statistics["minutes"].value++;
            }, 60000);
        },
        setDonatePrice(data) {
            if (typeof data == 'string') data = JSON.parse(data);

            convertWindowData.coefficient = data.convertCash;
            changenameWindowData.price = data.nicknamePrice;
            warnWindowData.price = data.clearWarnPrice;
            warnWindowData.amountWarns = data.warns;
            addslotWindowData.price = data.slotPrice;
        },
        setFaction(data) {
            if (typeof data == 'string') data = JSON.parse(data);

            this.factionId = data.factionId;
            statistics["factionName"].value = data.factionName || "-";
            statistics["factionRank"].value = data.factionRank || "-";
        },
        setFactionRank(data) {
            if (typeof data == 'string') data = JSON.parse(data);

            statistics["factionRank"].value = data.factionRank || "-";
        },
        setJob(data) {
            if (typeof data == 'string') data = JSON.parse(data);

            statistics["jobName"].value = data.jobName || "-";
        },
        setWanted(wanted) {
            var oldWanted = parseInt(statistics["wanted"].value);
            statistics["wanted"].value = `${wanted} зв.`;

            if (wanted > oldWanted) statistics["crimes"].value += wanted - oldWanted;
        },
        setFines(fines) {
            statistics["fines"].value = fines;
        },
        setLaw(law) {
            statistics["law"].value = law;
        },
        setNarcotism(narcotism) {
            statistics["narcotism"].value = narcotism;
        },
        setNicotine(nicotine) {
            statistics["nicotine"].value = nicotine;
        },
        setSkills(data) {
            if (typeof data == 'string') data = JSON.parse(data);

            data.forEach(skill => {
                skills.push({
                    head: skill.name,
                    value: skill.exp,
                    jobId: skill.jobId,
                });
            });

            this.enable = true;
        },
        setSkill(data) {
            if (typeof data == 'string') data = JSON.parse(data);

            var skill = skills.find(x => x.jobId == data.jobId);
            var oldExp = skill.value;
            skill.value = data.exp;

            if (parseInt(skill.value) == parseInt(oldExp)) return;
            if (parseInt(skill.value) > parseInt(oldExp)) prompt.show(`Навык '${skill.head}' повысился до ${parseInt(skill.value)}%`);
            else prompt.show(`Навык '${skill.head}' понизился до ${parseInt(skill.value)}%`);
        },
        setCash(cash) {
            statistics["cash"].value = cash;
        },
        setChips(chips) {
            statistics["casinoChips"].value = chips;
        },
        setDonate(donate) {
            this.coins = donate;
        },
        setWarns(warns) {
            warnWindowData.amountWarns = warns;
        },
        setSlots(slots) {
            addslotWindowData.amountSlots = slots;
        },
        setPromocode(code) {
            referenceData.code = code;
        },
        setInvited(val) {
            referenceData.amountInvitees = val;
        },
        setCompleted(val) {
            referenceData.amountCompleted = val;
        },
        setMedia(val) {
            this.media = val;
        },
        setPasswordDate(time) {
            var diff = Date.now() - time;
            protectionWindowData.passMessage = `изменен ${parseInt(diff / 1000 / 60 / 60 / 24)} д. назад`;
        },
        setPasswordVeracity(val) { /* val: bool*/
            /*
                Если при изменении пароля, старый пароль не совпал,
                то необходимо передать false.
                true - смена пароля прошла успешно.
            */
            protectionWindowData.passMatched = val;
        },
        setSettings(settings) {
            for (var key in settings) {
                if (!settingsmainWindowData.settingsList[key]) continue;

                settingsmainWindowData.settingsList[key].value = settings[key];
                if (key == 'chatTimestamp') mp.events.call("setTimeChat", !!settings[key]);
                else if (key == 'chatSize') mp.events.call('setSizeChat', settings[key] + 1);
                else if (key == 'nicknames') mp.trigger(`nametags.show`, !!settings[key]);
                else if (key == 'hudKeys') hud.keysShow = !!settings[key];
                else if (key == 'ghetto') {
                    mp.trigger(`bands.bandZones.show`, !!settings[key]);
                    mp.trigger(`mafia.mafiaZones.show`, !!settings[key]);
                }
            }
        },
        setEmail(email, confirm = 0) {
            protectionWindowData.email = email;
            protectionWindowData.isConfirmed = confirm;
            protectionWindowData.codeChecking = false;
        },
        setName(name) {
            this.name = name;
        },
        setAdmin(admin) {
            this.admin = admin;
        },
        setNumber(number) {
            statistics["number"].value = number;
        },
        setSpouse(spouse) {
            if (typeof spouse == 'string') spouse = JSON.parse(spouse);
            if (spouse) {
                var str = (spouse.gender) ? "женат на " : "замужем за "
                statistics["spouse"].value = str + spouse.name;
            } else {
                statistics["spouse"].value = "-";
            }
        },
        setFamiliar(count) {
            statistics["familiar"].value = count;
        },
    },
    watch: {
        show(val) {
            mp.trigger("blur", val, 300);
            hud.show = !val;
            if (val) {
                busy.add("playerMenu", true, true);
                mp.trigger(`radar.display`, false);
                mp.trigger(`chat.opacity.set`, 0)
            } else {
                busy.remove("playerMenu", true);
                mp.trigger(`radar.display`, true);
                mp.trigger(`chat.opacity.set`, 1)
            }

            this.lastShowTime = Date.now();
            if (!val && this.dateTimer) {
                clearInterval(this.dateTimer);
                return;
            }

            function setTime() {
                let date = convertToMoscowDate(new Date());
                let hours = date.getHours();
                let minutes = date.getMinutes();
                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getUTCFullYear();

                if (hours < 10) hours = "0" + hours;
                if (minutes < 10) minutes = "0" + minutes;
                if (day < 10) day = "0" + day;
                if (month < 10) month = "0" + month;
                playerMenu.time = `${hours}:${minutes}`;
                playerMenu.date = `${day}.${month}.${year}`;
            };
            setTime();
            this.dateTimer = setInterval(setTime, 60000);

            setTimeout(() => {
                if (this.$refs.name)
                    this.longName = this.$refs.name.offsetHeight > this.$refs.def.offsetHeight * 2;
            }, 100);
        },
        codeMod(val) {
            if (val) this.code = '';
        },
        name(val) {
            setTimeout(() => {
                if (this.$refs.name)
                    playerMenu.longName = this.$refs.name.offsetHeight > this.$refs.def.offsetHeight * 2;
            }, 100);
        }
    },
    filters: {
        test(val) {
            return "tes";
        }
    },
    mounted() {
        window.addEventListener('keyup', (e) => {
            if (busy.includes(["chat", "terminal", "interaction", "mapCase", "phone", "inventory", "inputWindow", "playersList", "bugTracker"])) return;
            if (selectMenu.isEditing) return;
            if (Date.now() - this.lastShowTime < 500) return;
            if (!this.enable) return;
            if (e.keyCode == 77 && !this.inputFocus) this.show = !this.show;
            if (e.keyCode == 27 && this.show) this.show = false;
        });
    },
});

Vue.component('player-menu-character', {
    template: '#player-menu-character',
    data: () => ({
        statistics: statistics,
        houseInfo: houseInfo,
        businessInfo: businessInfo,
        skills: skills,

        count: 0,
    }),
    computed: {
        skillsList() {
            let newList = [];
            for (let i = 0; i < this.skills.length; i += 2) {
                newList.push([this.skills[i], this.skills[i + 1]]);
            }
            return newList;
        }
    },
    methods: {
        onClickArrow(isDown) {
            if (!isDown && this.count == 0) return;
            if (isDown && this.count > this.skillsList.length - 4) return;
            (isDown) ? this.count++: this.count--;
        }
    }
});

Vue.component('player-menu-settings', {
    template: '#player-menu-settings',
});

var reportLastSentTime = 0;
Vue.component('player-menu-report', {
    template: '#player-menu-report',
    data: () => ({
        maxlength: 120,
        message: "",
        showHint: false,
        waitTime: 60 * 1000,
    }),
    computed: {
        chars() {
            return this.maxlength - this.message.length;
        },
    },
    methods: {
        send() {
            if (!this.message.length) return;
            if (!playerMenu.media) {
                var diff = Date.now() - reportLastSentTime;
                if (diff < this.waitTime) return notifications.push('error', `Ожидайте ${parseInt((this.waitTime - diff) / 1000)} сек.`);
            }
            mp.trigger(`callRemote`, `admin.report`, this.message);
            reportLastSentTime = Date.now();

            // Что ниже, оставить!
            this.message = "";
            this.showHint = true;
            setTimeout(() => {
                this.showHint = false;
            }, 5000)
        },
        setFocus(enable) {
            playerMenu.inputFocus = enable;
        }
    }
});

Vue.component('player-menu-help', {
    template: "#player-menu-help",
    data: () => ({
        maxlength: 120,
        message: "",
        messages: helpMessages,
        currentAnswer: null,
    }),
    computed: {
        searchResult() {
            // TODO: Более хитрая сортировка, если надо.
            return this.messages.filter(record => record.question.toLowerCase().includes(this.message.toLowerCase()))
        },
    },
    methods: {
        showAnswer(index) {
            if (!this.messages[index].answer) return;
            this.currentAnswer = (index == this.currentAnswer) ? null : index;
        },
        send() {
            if (!this.message.length) return;

            helpMessages.unshift({
                question: this.message,
                answer: ""
            });
            // TODO: Отправка на сервер this.message

            this.message = "";
        },
        setFocus(enable) {
            playerMenu.inputFocus = enable;
        }
    },
});

Vue.component('player-menu-reference', {
    template: "#player-menu-reference",
    props: {
        code: String,
        amountInvitees: Number,
        amountCompleted: Number,
    },
    data: () => ({
        /*code: referenceData.code,
        amountInvitees: referenceData.amountInvitees,
        amountCompleted: referenceData.amountCompleted,*/
    }),
});

Vue.component('player-menu-window-sidebar', {
    template: "#player-menu-window-sidebar",
    props: {
        head: String,
        headImg: String,
        menu: Array,
        bottom: Object,
        windowData: Object,
    },
    data: () => ({
        currentWindow: "test",
        menuFocus: null,
    }),
    computed: {
        dataForWindow() {
            return {
                ...this.menuFocus.windowData,
                coins: playerMenu.coins,
            }
        }
    },
    methods: {
        onClickMenuItem(item) {
            this.menuFocus = item;
            settingsmainWindowData.currentWindow = item.window;
        },
    },
    watch: {
        head(val) {
            this.menuFocus = this.menu[0];
        }
    },
    mounted() {
        this.menuFocus = this.menu[0];
    }
});

Vue.component('player-menu-donate-convert', {
    template: "#player-menu-donate-convert",
    props: {
        coefficient: Number,
        acceptConvert: Function,
    },
    data: () => ({
        price: '',
    }),
    computed: {
        virtualCoins() {
            if (isNaN(this.price) || this.price <= 0) return "$ 0";
            return "$ " + prettyMoney(this.price * this.coefficient);
        },
        isEnable() {
            return this.price && this.price != 0 && (this.price <= playerMenu.coins);
        }
    },
    methods: {
        inputCheck(event) {
            let regex = new RegExp("[0-9]")
            if (!regex.test(event.key))
                event.preventDefault();
            /*if (this.price + event.key > playerMenu.coins) {
                this.price = playerMenu.coins;
                event.preventDefault();
            }*/
        },
        convert() {
            if (!this.isEnable) return;
            playerMenu.showConfirmWindow(
                "Подтверждение действия",
                `Вы действительно хотите ковертировать <br />
                <span style="color: #FFDF29">${playerMenuMoneySplit(this.price)} TC</span> в
                <span style="color: #34DE3B">${playerMenuMoneySplit(this.virtualCoins)} $</span>
                `,
                this.acConvert,
            );

        },
        acConvert() {
            this.acceptConvert(this.price);
            this.price = '';
        },
        setFocus(enable) {
            playerMenu.inputFocus = enable;
        }
    }
});

Vue.component('player-menu-donate-changename', {
    template: "#player-menu-donate-changename",
    props: {
        price: Number,
        acceptChange: Function,
        coins: Number,
    },
    data: () => ({
        firstname: '',
        lastname: '',
    }),
    methods: {
        inputCheck(event) {
            let regex = new RegExp("[a-zA-Z]")
            if (!regex.test(event.key))
                event.preventDefault();
        },
        changename() {
            if (!this.firstname || !this.lastname) return;
            if (this.price > this.coins) return;

            playerMenu.showConfirmWindow(
                "Подтверждение действия",
                `Вы действительно хотите <br />
                сменить имя и фамилию?
                `,
                this.acChange,
            );

        },
        acChange() {
            this.acceptChange(this.firstname, this.lastname);
            this.firstname = '';
            this.lastname = '';
        },
        setFocus(enable) {
            playerMenu.inputFocus = enable;
        }
    }
});

Vue.component('player-menu-donate-changeskin', {
    template: "#player-menu-donate-changeskin",
    props: {
        price: Number,
        acceptChange: Function,
        coins: Number,
    },
    data: () => ({
    }),
    methods: {
        changeskin() {
            if (this.price > this.coins) return;

            playerMenu.showConfirmWindow(
                "Подтверждение действия",
                `Вы действительно хотите <br />
                сменить внешность?
                `,
                this.acceptChange,
            );

        },
    }
});

Vue.component('player-menu-donate-warn', {
    template: "#player-menu-donate-warn",
    props: {
        amountWarns: Number,
        price: Number,
        takeoffWarn: Function,
        coins: Number,
    },
    data: () => ({}),
    computed: {

    },
    methods: {
        localtakeoffWarn() {
            if (!this.amountWarns) return;
            if (this.price > this.coins) return;

            playerMenu.showConfirmWindow(
                "Подтверждение действия",
                `Вы действительно хотите <br />
                снять варн?
                `,
                this.takeoffWarn,
            );
        }
    }
});

Vue.component('player-menu-donate-addslot', {
    template: "#player-menu-donate-addslot",
    props: {
        amountSlots: Number,
        maxSlots: Number,
        price: Number,
        addSlot: Function,
        coins: Number,
    },
    data: () => ({}),
    computed: {

    },
    methods: {
        localaddSlot() {
            if (this.amountSlots == this.maxSlots) return;
            if (this.price > this.coins) return;

            playerMenu.showConfirmWindow(
                "Подтверждение действия",
                `Вы действительно хотите <br />
                добавить слот?
                `,
                this.addSlot,
            );
        }
    }
});

Vue.component('player-menu-settings-main', {
    template: "#player-menu-settings-main",
    props: {
        currentWindow: String,
        settingsList: Object,
        saveChanges: Function,
    },
    data: () => ({
        localSettings: {},
        modifiedSettings: {},
    }),
    computed: {
        noChanges() {
            let keys = Object.keys(this.localSettings);
            this.modifiedSettings = {};
            for (let i = 0; i < keys.length; i++) {
                if (this.settingsList[keys[i]].value != this.localSettings[keys[i]].value) {
                    this.modifiedSettings[keys[i]] = this.localSettings[keys[i]].value;
                }
            }

            return !Object.keys(this.modifiedSettings).length;
        }
    },
    methods: {
        save() {
            if (this.noChanges) return;

            this.saveChanges(this.modifiedSettings);
        },
        right(key) {
            let val = this.localSettings[key].value;
            let len = this.localSettings[key].pull.length;

            this.localSettings[key].value = (val == len - 1) ? 0 : ++val;
        },
        left(key) {
            let val = this.localSettings[key].value;
            let len = this.localSettings[key].pull.length;

            this.localSettings[key].value = (val == 0) ? len - 1 : --val;
        }
    },
    mounted() {
        this.localsSettings = {};
        for (key in settingsmainWindowData.settingsList)
            this.$set(this.localSettings, key, {
                ...settingsmainWindowData.settingsList[key]
            });
    }
});

Vue.component('player-menu-settings-protection', {
    template: "#player-menu-settings-protection",
    props: {
        email: String,
        isConfirmed: Boolean,
        passMatched: Boolean,
        passMessage: String,
        maxWaiting: Number,
        changeMail: Function,
        changePassword: Function,
        sendCode: Function,
        checkCode: Function,
        codeMod: Boolean,
        codeChecking: Boolean,
        waiting: String,
        seconds: Number,
        intervalId: Object,
    },
    data: () => ({
        newEmail: '',
        code: '',
        changeMailMod: false,
        changePassMod: false,
        wrongCode: false,
        //codeMod: false,
        oldPass: '',
        newPass: '',
        newPass2: '',
        //waiting: '',

        //seconds: 0,

        //maxWaiting: 10,
    }),
    computed: {
        emailIsValid() {
            var pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;

            return pattern.test(this.newEmail)
        },
        passIsValid() {
            if (!this.oldPass || !this.newPass/* || !this.newPass2*/) return false;
            // if (this.newPass != this.newPass2) return false;

            return true;
        }
    },
    methods: {
        saveMail() {
            if (!this.emailIsValid)
                return;

            playerMenu.showConfirmWindow(
                "Подтверждение действия",
                `Вы действительно хотите <br />
                сменить адрес почты?
                `,
                this.acSaveMail,
            );
        },
        acSaveMail() {
            this.changeMail(this.newEmail);

            this.newEmail = "";
            this.changeMailMod = false;
        },
        confCode() {
            if (!this.code)
                return;

            this.checkCode(this.code);

            protectionWindowData.codeChecking = true;
            //this.code = '';
            this.wrongCode = false;
        },
        savePass() {
            if (!this.passIsValid)
                return;
            /*if (!this.oldPass || !this.newPass || !this.newPass2) return;
            if (this.newPass != this.newPass2) return;*/
            playerMenu.showConfirmWindow(
                "Подтверждение действия",
                `Вы действительно хотите <br />
                сменить пароль?
                `,
                this.changePass,
            );
            // this.changePassMod = false;
        },
        localsendCode() {
            protectionWindowData.codeMod = true;
            protectionWindowData.waiting = `(${this.maxWaiting})`;
            protectionWindowData.seconds = 0;
            protectionWindowData.intervalId = setInterval(() => {
                protectionWindowData.waiting = `(${this.maxWaiting - ++protectionWindowData.seconds})`;

                if (protectionWindowData.seconds > this.maxWaiting) {
                    protectionWindowData.waiting = '';
                    clearInterval(protectionWindowData.intervalId);
                    protectionWindowData.intervalId = null;
                }

            }, 1000);

            this.sendCode();
        },
        changePass() {
            this.changePassword(this.oldPass, this.newPass);
            protectionWindowData.passMatched = null;
            this.oldPass = '';
            this.newPass = '';
        },
        cancel() {
            if (protectionWindowData.intervalId)
                return;
            this.changeMailMod = false;
            protectionWindowData.codeMod = false;
            this.code = '';
            this.newEmail = '';
        },
        passCancel() {
            this.changePassMod = false;
            this.oldPass = '';
            this.newPass = '';
            this.newPass2 = '';
        },
        inputCheck(event) {
            let regex = new RegExp("[0-9]")
            if (!regex.test(event.key))
                event.preventDefault();
        },
        setFocus(enable) {
            playerMenu.inputFocus = enable;
        }
    },
    watch: {
        isConfirmed(val) {
            if (val) protectionWindowData.codeMod = false;
            this.code = '';

            if (protectionWindowData.intervalId)
                clearInterval(protectionWindowData.intervalId);
            protectionWindowData.intervalId = null;
            protectionWindowData.waiting = '';
        },
        codeChecking(val, oldVal) {
            if (!val && !isConfirmed) {
                this.wrongCode = true;
            }
        },
        passMatched(val, oldVal) {
            if (val) {
                this.passCancel();
            }
        },
    },
    /*destroyed () {
        alert(32);
    }*/
});

// playerMenu.show = true;
// playerMenu.name = "Looooooonnnnnng Naaaaaaammeeeeee";
// playerMenu.showConfirmWindow("Подтверждение действия", "Вы действителdddddddddd sd sdfsddddddddddd sdfsd fsdfsdьно хотите что-то сделать?")
