var inputWindow = new Vue({
    el: "#input-window",
    data: {
        show: false,
        name: '',
        header: '',
        description: '', //Текст под заголовком.
        hint: '', //Текст над полем ввода.
        inputHint: '', //Текст-подсказка в поле ввода.
        leftWord: 'Принять', //Слово на зелёном фоне.
        rightWord: 'Отменить', //Слово на красном фоне.
        value: '', //Значеие из поя ввода.
        windows: {
            "mafia_power_sell": {
                name: `mafia_power_sell`,
                header: `Продажа крыши бизнеса`,
                hint: `Введите сумму`,
                inputHint: `Сумма`,
                leftWord: `Продать`,
                rightWord: `Отменить`
            },
            "fib_veh_plate": {
                name: `fib_veh_plate`,
                header: `Смена номера авто`,
                hint: `Введите номер`,
                inputHint: `Номер`,
                leftWord: `Сменить`,
                rightWord: `Отменить`
            },
        },
    },
    computed: {},
    methods: {
        showByName(name) {
            var win = this.windows[name];
            if (!win) return;
            for (var key in win) {
                this[key] = win[key];
            }
            this.show = true;
        },
        accept() {
            if (this.name == 'money_giving') {
                mp.trigger('interaction.money.accept', this.value);
            }
            if (this.name == 'carsell_id') {
                mp.trigger('vehicles.sell.id', this.value);
            }
            if (this.name == 'carsell_price') {
                mp.trigger('vehicles.sell.price', this.value);
            }
            if (this.name == 'fuelstations_litres') {
                mp.trigger('fuelstations.fill.litres.send', this.value);
            }
            if (this.name == 'mafia_power_sell') {
                if (isNaN(this.value)) return notifications.push(`error`, `Требуется число`);
                if (this.value <= 0) return notifications.push(`error`, `Требуется положительное число`);
                var data = {
                    recId: this.playerId,
                    sum: parseInt(this.value),
                };
                this.show = false;
                mp.trigger(`callRemote`, `mafia.power.sell`, JSON.stringify(data));
            }
            if (this.name == 'fib_veh_plate') {
                if (!this.value.length) return notifications.push(`error`, `Введите номер`);
                if (this.value.length > 8) return notifications.push(`error`, `Не более 8 символов`);
                var data = {
                    vehId: this.vehId,
                    plate: this.value,
                };
                this.show = false;
                mp.trigger(`callRemote`, `fib.vehicle.plate.set`, JSON.stringify(data));
            }
            if (this.name == 'dice') {
                let value = parseInt(this.value);
                if (isNaN(value)) return notifications.push(`error`, `Требуется число`);
                if (value <= 0 || value > 1000000) return notifications.push(`error`, `Некорректное число`);
                var data = {
                    targetId: this.playerId,
                    amount: value,
                };
                this.show = false;
                mp.trigger(`callRemote`, `casino.dice.offer.send`, JSON.stringify(data));
            }
        },
        decline() {
            if (this.name == 'money_giving') {
                mp.trigger('interaction.money.decline');
            }
            if (this.name == 'carsell_id') {
                mp.trigger('vehicles.sell.close');
            }
            if (this.name == 'carsell_price') {
                mp.trigger('vehicles.sell.close');
            }
            if (this.name == 'fuelstations_litres') {
                mp.trigger('fuelstations.fill.litres.close');
            }
            if (this.name == 'mafia_power_sell') {
                this.show = false;
            }
            if (this.name == 'fib_veh_plate') {
                this.show = false;
            }
            if (this.name == 'dice') {
                this.show = false;
            }
        },
    },
    watch: {
        show(val) {
            if (val) busy.add("inputWindow", true, true);
            else busy.remove("inputWindow", true);
        }
    },
});

//for tests
// inputWindow.show = true;
// inputWindow.name = 'money_giving';
// inputWindow.header = "Перевод денег Swift Dunhill";
// inputWindow.description = "Вы желаете перевести <span class='money'>мильйон $</span>?"
// inputWindow.hint = "Введите сумму перевода";
// inputWindow.inputHint = "Введите сумму...";
// inputWindow.leftWord = "Подтвердить";
// inputWindow.showByName("mafia_power_sell");
