var offerDialog = new Vue({
    el: "#offerDialog",
    data: {
        showTime: 10000,
        dialogs: {
            "documents": {
                text: "Carter Slade хочет показать вам паспорт",
                on(values) {
                    this.text = `<span>${values.name}</span> хочет показать Вам ${values.doc}`;
                },
                yes() {
                    mp.trigger("callRemote", "documents.offer.accept", 1);
                },
                no() {
                    mp.trigger("callRemote", "documents.offer.accept", 0);
                    mp.trigger("offerDialog.close");
                },
                ignore() {
                    mp.trigger("callRemote", "documents.offer.accept", 0);
                    mp.trigger("offerDialog.close");
                },
            },
            "carservice_diagnostics": {
                text: "Вы желаете провести диагностику вашего транспорта",
                price: 100,
                name: "Cyrus Raider",
                on(values) {
                    this.name = values.name;
                    this.text = `Вы желаете провести диагностику вашего транспорта за <br /><span class="money">${offerDialog.pretty(values.price)} $</span>?`;
                },
                yes() {
                    mp.trigger("callRemote", "carservice.diagnostics.accept", 1);
                    mp.trigger("offerDialog.close");
                },
                no() {
                    mp.trigger("callRemote", "carservice.diagnostics.accept", 0);
                    mp.trigger("offerDialog.close");
                },
                ignore() {
                    mp.trigger("callRemote", "carservice.diagnostics.accept", 0);
                    mp.trigger("offerDialog.close");
                },
            },
            "house_sell": {
                text: "Swifty Swift предлагает вам купить его дом за 1`",
                price: 100,
                name: "Cyrus Rader",
                on(values) {
                    this.price = values.price;
                    this.name = values.name;
                    this.text = `Вы желаете приобрести дом за <br /><span class="money">${offerDialog.pretty(values.price)} $</span>?`;
                },
                yes() {
                    mp.trigger("callRemote", "house.sell.ans", 1);
                },
                no() {
                    mp.trigger("callRemote", "house.sell.ans", 2);
                },
                ignore() {
                    mp.trigger("callRemote", "house.sell.ans", 2);
                },
            },
            "biz_sell": {
                text: "Swifty Swift предлагает вам купить его бизнес",
                price: 100,
                name: "Cy Raider",
                on(values) {
                    this.price = values.price;
                    this.name = values.name;
                    this.text = `Вы желаете приобрести бизнес за <br /><span class="money">${offerDialog.pretty(values.price)} $</span>?`;
                },
                yes() {
                    mp.trigger("callRemote", "biz.sell.ans", 1);
                },
                no() {
                    mp.trigger("callRemote", "biz.sell.ans", 2);
                },
                ignore() {
                    mp.trigger("callRemote", "biz.sell.ans", 2);
                },
            },
            "vehicles_sell": {
                text: `Carter Slade предлагает вам купить т/с "Glendale" (AYE741)`,
                price: 228,
                on(values) {
                    this.price = values.price;
                    this.name = values.name
                    this.text = `Вы желаете приобрести т/с ${values.model} (${values.plate}) за <br /><span class="money">${offerDialog.pretty(values.price)} $</span>?`;
                },
                yes() {
                    mp.trigger("callRemote", "vehicles.sell.offer.accept", 1);
                    loader.show = true;
                    mp.trigger("offerDialog.close");
                },
                no() {
                    mp.trigger("callRemote", "vehicles.sell.offer.accept", 0);
                    mp.trigger("offerDialog.close");
                },
                ignore() {
                    mp.trigger("callRemote", "vehicles.sell.offer.accept", 0);
                    mp.trigger("offerDialog.close");
                },
            },
            "faction_invite": {
                text: `Carter Slade предлагает вам вступить в Groove Street`,
                on(values) {
                    this.text = `<span>${values.name}</span> предлагает вам вступить в ${values.faction}`;
                },
                yes() {
                    mp.trigger("callRemote", "factions.invite.accept");
                },
                no() {
                    mp.trigger("callRemote", "factions.invite.cancel");
                },
                ignore() {
                    mp.trigger("callRemote", "factions.invite.cancel");
                },
            },
            "hospital_healing": {
                text: `Carter Slade предлагает вам лечение`,
                price: 100,
                on(values) {
                    this.name = values.name;
                    this.text = `Вы желаете вылечиться за <br /><span class="money">${offerDialog.pretty(values.price)} $</span>?`;
                    this.price = values.price;
                },
                yes() {
                    mp.trigger("callRemote", "hospital.healing.accept");
                },
                no() {
                    mp.trigger("callRemote", "hospital.healing.cancel");
                },
                ignore() {
                    mp.trigger("callRemote", "hospital.healing.cancel");
                },
            },
            "carrier_job": {
                text: `Вы желаете арендовать рендовать грузовик за <span>100 $</span>?`,
                price: 999,
                name: "Parking", // TODO: Необходимо имя!
                on(values) {
                    this.text = `Вы желаете арендовать грузовик за <br /><span class="money">${offerDialog.pretty(values.price)} $</span>?`;
                    this.price = values.price;
                },
                yes() {
                    mp.trigger("callRemote", "carrier.vehicle.buy");
                },
                no() {},
                ignore() {},
            },
            "familiar": {
                text: `Незнакомец (ID: 11) хочет пожать вам руку`,
                playerId: null,
                on(values) {
                    this.text = `Незнакомец (ID: ${values.playerId}) хочет пожать вам руку`;
                    this.playerId = values.playerId;
                },
                yes() {
                    mp.trigger("callRemote", "familiar.accept", this.playerId);
                },
                no() {},
                ignore() {},
            },
            "death": {
                text: `Дождаться медиков?`,
                medKnockTime: 0,
                knockTime: 0,
                on(data) {
                    this.medKnockTime = data.medKnockTime;
                    this.knockTime = data.knockTime;
                },
                yes() {
                    mp.trigger(`callRemote`, `death.wait`, this.medKnockTime);
                    inventory.dropWeapon();
                },
                no() {
                    mp.trigger(`callRemote`, `death.wait`, this.knockTime);
                    inventory.dropWeapon();
                    // mp.trigger(`death.callRemote.spawn`);
                },
                ignore() {
                    mp.trigger(`callRemote`, `death.wait`);
                    inventory.dropWeapon();
                },
            },
            "vehicle_unload": {
                text: `Начать разгрузку боеприпасов?`,
                vehId: null,
                on(values) {
                    if (values.type == 'ammo') this.text = `Начать разгрузку боеприпасов?`;
                    else if (values.type == 'medicines') this.text = `Начать разгрузку медикаментов?`;
                    this.vehId = values.vehId;
                },
                yes() {
                    mp.trigger(`callRemote`, `factions.vehicle.unload.start`, this.vehId);
                },
                no() {},
                ignore() {},
            },
            "faction_cash_check": {
                text: `Желаете пополнить общак The Ballas на сумму $999999?`,
                on(values) {
                    this.text = `Желаете пополнить общак <span>${values.name}</span> на сумму $${values.sum}?`;
                },
                yes() {
                    mp.trigger(`callRemote`, `factions.cash.offer.accept`);
                },
                no() {
                    mp.trigger(`callRemote`, `factions.cash.offer.cancel`);
                },
                ignore() {
                    mp.trigger(`callRemote`, `factions.cash.offer.cancel`);
                },
            },
            "mafia_power_sell": {
                text: `Carter Slade предлагает вам крышу АЗС за $999`,
                on(values) {
                    this.text = `${values.player} предлагает вам крышу ${values.biz} за $${values.sum}`;
                },
                yes() {
                    mp.trigger(`callRemote`, `mafia.power.sell.accept`);
                },
                no() {
                    mp.trigger(`callRemote`, `mafia.power.sell.cancel`);
                },
                ignore() {
                    mp.trigger(`callRemote`, `mafia.power.sell.cancel`);
                },
            },
            "wedding_male": {
                text: `Вы хотите сделать Swifty Swift предложение?`,
                recId: null,
                on(values) {
                    this.recId = values.recId;
                    this.text = `Вы хотите сделать <span>${values.name}</span> предложение?`;
                },
                yes() {
                    mp.trigger(`callRemote`, `wedding.add`, this.recId);
                },
                no() {},
                ignore() {},
            },
            "wedding_female": {
                text: `Carter Slade предлагает вам выйти замуж`,
                on(values) {
                    this.text = `<span>${values.name}</span> предлагает вам выйти замуж`;
                },
                yes() {
                    mp.trigger(`callRemote`, `wedding.add.accept`, this.recId);
                },
                no() {
                    mp.trigger(`callRemote`, `wedding.add.cancel`, this.recId);
                },
                ignore() {
                    mp.trigger(`callRemote`, `wedding.add.cancel`, this.recId);
                },
            },
            "unarrest": {
                text: `Carter Slade предлагает вас освободить`,
                price: 999,
                name: null,
                on(values) {
                    this.text = `Вы желаете выйти на свободу за <br /><span class="money">${offerDialog.pretty(values.price)} $</span>?`;
                    this.price = values.price;
                    this.name = values.name;
                },
                yes() {
                    mp.trigger(`callRemote`, `government.unarrest.accept`);
                },
                no() {
                    mp.trigger(`callRemote`, `government.unarrest.cancel`);
                },
                ignore() {
                    mp.trigger(`callRemote`, `government.unarrest.cancel`);
                },
            },
            "dice": {
                text: `Carter Slade предлагает вам сыграть в кости`,
                price: 999,
                on(values) {
                    this.text = `ID: ${values.id} предлагает вам сыграть в кости <br /><span class="money">${offerDialog.pretty(values.amount)} <i class="fas fa-coins"></i></span>`;
                    this.price = values.amount;
                },
                yes() {
                    mp.trigger(`callRemote`, `casino.dice.offer.accept`, 1);
                },
                no() {
                    mp.trigger(`callRemote`, `casino.dice.offer.accept`, 0);
                },
                ignore() {
                    mp.trigger(`callRemote`, `casino.dice.offer.accept`, 0);
                },
            },
            "winter_job": {
                text: `Вы желаете арендовать рендовать трактор за <span>100 $</span>?`,
                on(values) {
                    this.text = `Вы желаете арендовать трактор за <br /><span class="money">${offerDialog.pretty(values.price)} $</span>?`;
                },
                yes() {
                    mp.trigger("callRemote", "winter.vehicle.buy");
                },
                no() {},
                ignore() {},
            },
        },
        dialog: null,
        timeout: null,
        green: false,
        red: false,
    },
    methods: {
        show(name, values) {
            this.green = this.red = false;
            if (typeof values == 'string') values = JSON.parse(values);
            this.dialogs[name].on(values);
            this.dialog = this.dialogs[name];
            var self = this;
            clearTimeout(self.timeout);
            self.timeout = setTimeout(() => {
                self.dialog.ignore();
                self.hide();
            }, self.showTime);
        },
        hide() {
            clearTimeout(this.timeout);
            this.dialog = null;
        },
        pretty(val) {
            return prettyMoney(val);
        }
    },
    mounted() {
        let self = this;
        window.addEventListener('keyup', function(e) {
            if (!self.dialog) return;
            self.green = self.red = false;
            if (busy.includes(["chat", "terminal", "mapCase", "phone"])) return;
            if (e.keyCode == 89) { // Y
                self.dialog.yes();
                self.hide();
            } else if (e.keyCode == 78) { // N
                self.dialog.no();
                self.hide();
            }
        });
        window.addEventListener('keydown', function(e) {
            if (!self.dialog) return;
            if (busy.includes(["chat", "terminal", "mapCase", "phone"])) return;
            if (e.keyCode == 89) { // Y
                self.green = true;
            } else if (e.keyCode == 78) { // N
                self.red = true;
            }
        });
    },
    watch: {
        dialog(val) {
            if (val) busy.add("offerDialog", false, true);
            else busy.remove("offerDialog", true);
        }
    },
});

// for tests
// offerDialog.show("unarrest", {name: "Kir", price: "200000"});
