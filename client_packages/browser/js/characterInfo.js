var characterInfo = new Vue({
    el: "#characterInfo",
    data: {
        show: false,

        coins: 0, // Коинсы в углу
        showAddCoins: false, // Скрыть копку пополнения счёта.

        characters: [], // массив с данными о персонажах
        slots: 1, // кол-во слотов
        limitSlots: 3, // максимум слотов
        // Индекс текущего персонажа
        i: 0,
    },
    computed: {
        // Возможность создать ещё одного персонажа
        canNewCharacter() {
            return this.slots > this.characters.length;
        },
    },
    methods: {
        pretty(val) {
            return prettyMoney(val);
        },
        addCharacter(character) {
            if (typeof character == 'string') character = JSON.parse(character);
            this.characters.push(character);
        },
        addCoins() {
            // TODO:
            console.log("characterInfo.addCoins()");
        }
    }
});

// for tests
// characterInfo.addCharacter({
//     name: "Benedictium Alfagrandsour",
//     cash: 13234,
//     bank: 52533,
//     status: "Администратор",
//     hours: 15,
//     faction: "Байкеры",
//     job: "Доктор наук",
//     house: "Ричман Глен (228)",
//     biz: "Парикмахерская (28)",
//     warns: 1
// });
// characterInfo.addCharacter({
//     name: "Carter Slade",
//     cash: 1000,
//     bank: 20000,
//     status: "Бывалый",
//     hours: 30,
//     faction: "Groove Street",
//     job: "Дальнобойщий",
//     house: "Грув Стрит (10)",
//     biz: "Автосалон (1)",
//     warns: 0
// });
// characterInfo.show = true;

var characterSelector = new Vue({
    el: "#characterSelector",
    methods: {
        left() {
            if (loader.show || this.leftArrowDisabled) return;
            mp.trigger("characterInit.chooseLeft");
        },
        enter() {
            if (loader.show || this.enterDisabled) return;
            loader.show = true;
            mp.trigger("characterInit.choose");
        },
        right() {
            if (loader.show || this.rightArrowDisabled) return;
            mp.trigger("characterInit.chooseRight");
        },
    },
    computed: {
        show() {
            return characterInfo.show && characterInfo.characters.length;
        },
        leftArrowDisabled() {
            return characterInfo.i <= 0;
        },
        rightArrowDisabled() {
            return characterInfo.i == characterInfo.slots || characterInfo.i == characterInfo.limitSlots-1 || characterInfo.i == characterInfo.characters.length;
            /*if (characterInfo.i == characterInfo.characters.length && characterInfo.canNewCharacter) return true;
            return characterInfo.i > characterInfo.characters.length;*/
        },
        enterDisabled() {
            return characterInfo.i > characterInfo.characters.length - 1;
        },
    }
});

var createCharacter = new Vue({
    el: "#createCharacter",
    computed: {
        show() {
            return characterInfo.canNewCharacter && characterInfo.show &&
                (characterInfo.i >= characterInfo.characters.length ||
                !characterInfo.characters.length);
        }
    },
    methods: {
        onClickCreateCharacter() {
            if (loader.show) return;
            loader.show = true;
            mp.trigger("characterInit.choose");
        }
    }
});

var characterAddSlot = new Vue({
    el: "#characterAddSlot",
    data: {
        price: 500,
        hours: "N",
    },
    computed: {
        show() {
            return !createCharacter.show && characterInfo.i > characterInfo.characters.length - 1 && characterInfo.show;
        },
        oneSlot() {
            return characterInfo.slots == 1;
        }
    },
    methods: {
        addSlot() {
            loader.show = true;
            mp.trigger("characterInit.slot.buy");
        }
    }

});
