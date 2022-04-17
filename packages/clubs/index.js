"use strict";

let bizes;
let factions;
let inventory;
let money;
let notifs;
let walking;

module.exports = {
    // Инфо о бизнесе
    business: {
        type: 10,
        name: "Клуб",
        productName: "Спиртное",
        // isFactionOwner: true,
    },
    productPrice: 1,
    rentPerDayMultiplier: 0.01,
    // Клубы
    clubs: [],
    // Алкогольные напитки
    alcohol: {
        // Багама (La Cosa Nostra)
        1: [{
            price: 390,
            params: {
                name: "Мохито",
                alcohol: 30
            },
        },
            {
                price: 400,
                params: {
                    name: "Апероль Шпритц",
                    alcohol: 35
                },
            },
            {
                price: 395,
                params: {
                    name: "Негрони",
                    alcohol: 40
                },
            },
            {
                price: 410,
                params: {
                    name: "Мартини & Тоник",
                    alcohol: 25
                },
            },
            {
                price: 415,
                params: {
                    name: "Бьянко Санрайз",
                    alcohol: 45
                },
            },
            {
                price: 385,
                params: {
                    name: "Валентино",
                    alcohol: 30
                },
            },
        ],
        // Текила (La Eme)
        2: [{
            price: 390,
            params: {
                name: "Амиго",
                alcohol: 40
            },
        },
            {
                price: 415,
                params: {
                    name: "Эль-бандито",
                    alcohol: 45
                },
            },
            {
                price: 395,
                params: {
                    name: "Маргарита",
                    alcohol: 30
                },
            },
            {
                price: 410,
                params: {
                    name: "Пина-колада",
                    alcohol: 25
                },
            },
            {
                price: 385,
                params: {
                    name: "Сангрита",
                    alcohol: 30
                },
            },
            {
                price: 400,
                params: {
                    name: "Палома",
                    alcohol: 35
                },
            },
        ],
        // Ванила (Russian Mafia)
        3: [{
            price: 395,
            params: {
                name: "Отвёртка",
                alcohol: 40
            },
        },
            {
                price: 385,
                params: {
                    name: "Холодное лето 1986 года",
                    alcohol: 30
                },
            },
            {
                price: 400,
                params: {
                    name: "Российский флаг",
                    alcohol: 45
                },
            },
            {
                price: 390,
                params: {
                    name: "Балалайка",
                    alcohol: 25
                },
            },
            {
                price: 415,
                params: {
                    name: "Кровавая мэри",
                    alcohol: 35
                },
            },
            {
                price: 410,
                params: {
                    name: "Белый туман",
                    alcohol: 30
                },
            },
        ],
    },
    // Закуски
    snacks: {
        // Багама (La Cosa Nostra)
        1: [{
            price: 420,
            params: {
                name: "Брускетта с помидорами",
                satiety: 55,
            }
        },
            {
                price: 340,
                params: {
                    name: "Аранчини",
                    satiety: 50,
                }
            },
            {
                price: 450,
                params: {
                    name: "Моцарелла с базаликом",
                    satiety: 60,
                }
            },
            {
                price: 650,
                params: {
                    name: "Креветки в соусе песто",
                    satiety: 70,
                }
            }
        ],
        // Текила (La Eme)
        2: [{
            price: 450,
            params: {
                name: "Кесадилья с курицей",
                satiety: 60,
            }
        },
            {
                price: 420,
                params: {
                    name: "Сэндвич с каперсами",
                    satiety: 55,
                }
            },
            {
                price: 650,
                params: {
                    name: "Бурритос с курицей",
                    satiety: 70,
                }
            },
            {
                price: 340,
                params: {
                    name: "Гуакамоле с грушей",
                    satiety: 50,
                }
            }
        ],
        // Ванила (Russian Mafia)
        3: [{
            price: 420,
            params: {
                name: "Селёдка с солёным огурцом",
                satiety: 55,
            }
        },
            {
                price: 450,
                params: {
                    name: "Рулетики из ветчины с сыром",
                    satiety: 60,
                }
            },
            {
                price: 340,
                params: {
                    name: "Бутерброд со шпротами",
                    satiety: 50,
                }
            },
            {
                price: 650,
                params: {
                    name: "Шаурма в пите",
                    satiety: 70,
                }
            }
        ],
    },
    // Сигареты
    smoke: {
        // Багама (La Cosa Nostra)
        1: [{
            price: 630,
            params: {
                name: "Arturo Fuente",
                count: 20,
            }
        }],
        // Текила (La Eme)
        2: [{
            price: 630,
            params: {
                name: "Te Amo",
                count: 20,
            }
        }],
        // Ванила (Russian Mafia)
        3: [{
            price: 630,
            params: {
                name: "Погарская сигара",
                count: 20,
            }
        }],
    },
    // Ид предметов инвентаря
    alcoholItemId: 133,
    snackItemId: 134,
    smokeItemId: 16,
    // Ид пьяной походки
    drunkWalkingId: 7,
    // Мин. значение опьянения, при котором меняется походка
    walkingDrunkenness: 70,
    // Мин. значение опьянения, при котором будет визуальный эффект
    vfxDrunkenness: 30,
    // Визуальный эффект от опьянения
    vfxName: "DrugsDrivingOut",
    // Ожидание снятия опьянения
    drunkennessWaitClear: 2 * 60 * 1000,
    // Кол-во ед. опьянения, отнимаемых в таймере
    drunkennessDec: 10,
    minAlcoholPrice: 1,
    maxAlcoholPrice: 8,

    init() {
        bizes = call('bizes');
        factions = call('factions');
        inventory = call('inventory');
        money = call('money');
        notifs = call('notifications');
        walking = call('walking');
    },

    async initAfterBiz() {
        await this.loadClubsFromDB();
    },
    async loadClubsFromDB() {
        let dbClubs = await db.Models.Club.findAll();
        dbClubs.forEach(db => {
            let club = {
                db: db,
                biz: bizes.getBizById(db.bizId)
            };
            club.blip = this.createBlip(club);
            club.enterMarker = this.createEnterMarker(club);
            club.exitMarker = this.createExitMarker(club);
            this.clubs.push(club);
        });

        console.log(`[CLUBS] Клубы загружены (${this.clubs.length} шт.)`);
    },
    createBlip(club) {
        let pos = new mp.Vector3(club.db.enterX, club.db.enterY, club.db.enterZ - 1);
        let blip = mp.blips.new(club.db.blip, pos, {
            color: 1,
            name: club.biz.info.name,
            shortRange: 10,
            scale: 1
        })

        return blip;
    },
    createEnterMarker(club) {
        let pos = new mp.Vector3(club.db.enterX, club.db.enterY, club.db.enterZ - 1);

        let enterMarker = mp.markers.new(1, pos, 0.5, {
            color: [0, 187, 255, 70]
        });
        enterMarker.isOpen = true;

        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, 0);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (player.clubId) {
                delete player.clubId;
                player.call(`clubs.setCurrentClub`);
                return;
            }
            if (!enterMarker.isOpen) {
                if (player.character.id != club.biz.info.characterId) return notifs.error(player, `Клуб закрыт`, club.biz.info.name);
            }

            player.dimension = club.biz.info.factionId;
            player.position = new mp.Vector3(club.db.exitX, club.db.exitY, club.db.exitZ);
            player.heading = club.db.exitH;
        };
        colshape.onExit = (player) => {

        };
        enterMarker.colshape = colshape;

        return enterMarker;
    },
    createExitMarker(club) {
        var pos = new mp.Vector3(club.db.exitX, club.db.exitY, club.db.exitZ - 1);

        var exitMarker = mp.markers.new(1, pos, 0.5, {
            color: [0, 187, 255, 70],
            dimension: club.biz.info.factionId
        });

        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, exitMarker.dimension);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (!player.clubId) {
                player.clubId = club.db.id;
                player.call(`clubs.setCurrentClub`, [{
                    id: club.db.id,
                    name: club.biz.info.name,
                    alcoholPrice: club.db.alcoholPrice,
                    alcohol: this.alcohol[player.clubId],
                    snacks: this.snacks[player.clubId],
                    smoke: this.smoke[player.clubId],
                }]);

                return;
            }

            player.heading = club.db.enterH;
            player.dimension = 0;
            player.position = new mp.Vector3(club.db.enterX, club.db.enterY, club.db.enterZ);
        };
        colshape.onExit = (player) => {

        };
        exitMarker.colshape = colshape;

        return exitMarker;
    },
    buyAlcohol(player, index) {
        if (!player.clubId) return notifs.error(player, `Вы не в клубе`);
        var club = this.clubs.find(x => x.db.id == player.clubId);
        if (!club) return notifs.error(player, `Клуб не найден`);
        var header = `Барная стойка ${club.biz.info.name}`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var alcoholList = this.alcohol[club.db.id];
        index = Math.clamp(index, 0, alcoholList.length - 1);
        var item = alcoholList[index];
        var price = item.price * club.db.alcoholPrice;
        if (player.character.cash < price) return out(`Необходимо $${price}`);
        if (club.biz.info.productsCount < price) return out(`У клуба недостаточно продуктов`);

        var cantAdd = inventory.cantAdd(player, this.alcoholItemId, item.params);
        if (cantAdd) return out(cantAdd);

        money.removeCash(player, price, (res) => {
            if (!res) out(`Ошибка списания наличных`);
            this.updateCashbox(club.biz.info.id, price);
            bizes.removeProducts(club.biz.info.id, price);
        }, `Покупка напитка в клубе с bizId #${club.biz.info.id}`);

        inventory.addItem(player, this.alcoholItemId, item.params, (e) => {
            if (e) notifs.error(player, e);
        });

        notifs.success(player, `Вы приобрели ${item.params.name}`, header);
    },
    buySnack(player, index) {
        if (!player.clubId) return notifs.error(player, `Вы не в клубе`);
        var club = this.clubs.find(x => x.db.id == player.clubId);
        if (!club) return notifs.error(player, `Клуб не найден`);
        var header = `Барная стойка ${club.biz.info.name}`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var snackList = this.snacks[club.db.id];
        index = Math.clamp(index, 0, snackList.length - 1);
        var item = snackList[index];
        var price = item.price * club.db.alcoholPrice;
        if (player.character.cash < price) return out(`Необходимо $${price}`);
        if (club.biz.info.productsCount < price) return out(`У клуба недостаточно продуктов`);

        var cantAdd = inventory.cantAdd(player, this.snackItemId, item.params);
        if (cantAdd) return out(cantAdd);

        money.removeCash(player, price, (res) => {
            if (!res) out(`Ошибка списания наличных`);
            this.updateCashbox(club.biz.info.id, price);
            bizes.removeProducts(club.biz.info.id, price);
        }, `Покупка закуски в клубе с bizId #${club.biz.info.id}`);

        inventory.addItem(player, this.snackItemId, item.params, (e) => {
            if (e) notifs.error(player, e);
        });

        notifs.success(player, `Вы приобрели ${item.params.name}`, header);
    },
    buySmoke(player, index) {
        if (!player.clubId) return notifs.error(player, `Вы не в клубе`);
        var club = this.clubs.find(x => x.db.id == player.clubId);
        if (!club) return notifs.error(player, `Клуб не найден`);
        var header = `Барная стойка ${club.biz.info.name}`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        var smokeList = this.smoke[club.db.id];
        index = Math.clamp(index, 0, smokeList.length - 1);
        var item = smokeList[index];
        var price = item.price * club.db.alcoholPrice;
        if (player.character.cash < price) return out(`Необходимо $${price}`);
        if (club.biz.info.productsCount < price) return out(`У клуба недостаточно продуктов`);

        var cantAdd = inventory.cantAdd(player, this.smokeItemId, item.params);
        if (cantAdd) return out(cantAdd);

        money.removeCash(player, price, (res) => {
            if (!res) out(`Ошибка списания наличных`);
            this.updateCashbox(club.biz.info.id, price);
            bizes.removeProducts(club.biz.info.id, price);
        }, `Покупка сигарет в клубе с bizId #${club.biz.info.id}`);

        inventory.addItem(player, this.smokeItemId, item.params, (e) => {
            if (e) notifs.error(player, e);
        });

        notifs.success(player, `Вы приобрели пачку ${item.params.name}`, header);
    },
    openClub(player) {
        var club = this.clubs.find(x => x.biz.info.characterId == player.character.id);
        if (!club) return notifs.error(player, `Вы не владелец клуба`);
        const isOpen = !club.enterMarker.isOpen;
        var header = `Управление ${club.biz.info.name}`;
        var out = (text) => {
            notifs.error(player, text, header);
        };

        club.enterMarker.isOpen = isOpen;
        notifs.success(player, `Клуб ${isOpen? 'открыт' : 'закрыт'}`, header);
    },
    addDrunkenness(player, value) {
        var oldValue = player.drunkenness || 0;
        var newValue = Math.clamp(oldValue + value, 0, 100);

        player.drunkenness = newValue;
        player.call(`clubs.drunkenness.set`, [newValue]);

        if (oldValue < this.walkingDrunkenness && newValue >= this.walkingDrunkenness) this.setDrunkWalking(player, true);
    },
    deleteDrunkenness(player, value) {
        var oldValue = player.drunkenness || 0;
        var newValue = Math.clamp(oldValue - value, 0, 100);

        player.drunkenness = newValue;
        player.call(`clubs.drunkenness.set`, [newValue]);

        if (oldValue >= this.walkingDrunkenness && newValue < this.walkingDrunkenness) this.setDrunkWalking(player, false);
    },
    setDrunkWalking(player, enable) {
        var style = (enable) ? this.drunkWalkingId : player.character.settings.walking;
        walking.set(player, style);
    },
    getBizParamsById(id) {
        let club = this.clubs.find(x => x.biz.info.id == id);
        if (!club) return;
        return [
            {
                key: 'alcoholPrice',
                name: 'Цена спиртного',
                max: this.maxAlcoholPrice,
                min: this.minAlcoholPrice,
                current: club.db.alcoholPrice,
                isInteger: true
            }
        ];
    },
    setBizParam(id, key, value) {
        let club = this.clubs.find(x => x.biz.info.id == id);
        if (!club) return;
        club.db[key] = value;
        club.db.save();
    },
    updateCashbox(id, money) {
        let club = this.clubs.find(x => x.biz.info.id == id);
        let bizId = club.biz.info.id;
        bizes.bizUpdateCashBox(bizId, money);
    },
};
