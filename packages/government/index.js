"use strict";
let factions;
let notify;

module.exports = {
    // Кол-во боеприпасов, списываемое за выдачу формы
    clothesAmmo: 0,
    // Кол-во боеприпасов, списываемое за выдачу бронежилета
    // armourAmmo: 100,
    // Кол-во боеприпасов, списываемое за выдачу снаряжения
    itemAmmo: 100,
    // Кол-во боеприпасов, списываемое за выдачу оружия
    gunAmmo: 100,
    // Кол-во боеприпасов, списываемое за выдачу патронов
    ammoAmmo: 1,
    // Позиция маркера с услугами правительства
    servicePos: new mp.Vector3(-551.1565551757812, -190.6352996826172, 38.215824127197266 - 1),
    // Маркер налогов
    taxPos: new mp.Vector3(242.3413848876953, 211.3042755126953, 110.28295135498047 - 1),
    // Блип на маркере с услугами правительства
    serviceBlip: 525,
    // Стоимость восстановления ключей от авто
    restoreVehKeysPrice: 1000,
    giveGunLicenseRank: 8,
    giveVehicleLicenseRank: 5,
    freeRank: 8,
    // Процент с налога, идущий в казну
    treasuryMultiplier: 0.1,
    // Максимальная сумма, идущая в казну
    maxTreasuryTotal: 3000,
    changeNamePrice: 50000,
    taxBizes: [
        {
            module: 'fuelstations',
            name: 'АЗС',
        },
        {
            module: 'supermarket',
            name: 'Супермаркеты',
        },
        {
            module: 'tuning',
            name: 'LSC',
        },
        {
            module: 'ammunation',
            name: 'Магазины оружия',
        },
        {
            module: 'masks',
            name: 'Магазин масок',
        },
        {
            module: 'barbershop',
            name: 'Парикмахерские',
        },
        {
            module: 'tattoo',
            name: 'Тату-салоны',
        },
        {
            module: 'clothingShop',
            name: 'Магазины одежды',
        },
        {
            module: 'clubs',
            name: 'Клубы',
        },
        {
            module: 'oilrigs',
            name: 'Нефтевышки',
        },
    ],
    init() {
        factions = call('factions');
        notify = call('notifications');
        this.createServiceMarker();
        // TEMP
        //this.createTaxMarker();
    },
    createServiceMarker() {
        var pos = this.servicePos;
        var service = mp.markers.new(1, pos, 0.5, {
            color: [0, 187, 255, 70],
            dimension: 0
        });

        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, service.dimension);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            var data = {
                fines: player.character.Fines,
                vehicles: player.vehicleList || [],
                changeNamePrice: this.changeNamePrice
            };
            player.call(`government.service.showMenu`, [data]);
        };
        colshape.onExit = (player) => {
            player.call(`selectMenu.hide`);
        };
        service.colshape = colshape;
        service.blip = mp.blips.new(this.serviceBlip, pos, {
            color: 0,
            name: `Услуги`,
            shortRange: 10,
            scale: 1,
            dimension: service.dimension
        });
    },
    createTaxMarker() {
        let pos = this.taxPos;
        mp.markers.new(1, pos, 0.5, {
            color: [24, 217, 75, 100],
            dimension: 1
        });

        let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5, 1);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (player.character.factionId != 1 || !factions.isLeader(player))
                return notify.error(player, 'Доступно только губернатору');

            player.call(`government.tax.showMenu`, [this.taxBizes]);
        };
        colshape.onExit = (player) => {
            player.call(`selectMenu.hide`);
        };
    },
    getTreasuryTotalByTax(tax) {
        let total = tax * this.treasuryMultiplier;
        return parseInt(total > this.maxTreasuryTotal ? this.maxTreasuryTotal : total);
    }
};
