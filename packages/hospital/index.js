"use strict";

module.exports = {
    // Кол-во хп при использования аптечки (самолечение)
    medHealth: 20,
    // Кол-во хп при использования пластыря (самолечение)
    patchHealth: 5,
    // Макс. кол-во хп при использовании аптечки/пластыря (самолечение)
    medMaxHealth: 80,
    // Цена за лечение 1 ХП игрока (предложение лечения)
    healingPrice: 1,
    // Кол-во боеприпасов, списываемое за выдачу формы
    clothesAmmo: 0,
    // Кол-во медикаментов, списываемое за выдачу снаряжения
    itemMedicines: 100,
    // Цена за реанимацию игрока
    knockedPrice: 50,
    // Анти-флуд получения премии за реанимацию
    knockedWaitTime: 60 * 60 * 1000,
    // Сохраненные реанимации (characterId : time)
    knockedLogs: {},
    // Мин. ранг для выдачи медкарты
    giveMedCardRank: 5,
    // Срок действия медкарты (дни)
    medCardDays: 30,
    pedHealingPrice: 300,
    healingShapePos: new mp.Vector3(308.9210205078125, -594.1929321289062, 43.28398132324219),
    init() {
        this.createHealingShape();
    },
    createHealingShape() {
        let pos = this.healingShapePos;
        mp.blips.new(153, pos, {
            name: 'Лечение',
            shortRange: true,
            color: 2
        });

        mp.labels.new(`~g~Лечение`, new mp.Vector3(pos.x, pos.y, pos.z + 1.1), {
            los: false,
            font: 0,
            drawDistance: 3,
        });

        let shape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 2);
        shape.onEnter = (player) => {
            if (player.vehicle) return;
            player.call('hospital.healing.enter', [true, this.pedHealingPrice]);
        };
        shape.onExit = (player) => {
            player.call('hospital.healing.enter', [false]);
        };
    }
};
