"use strict";

let inventory = call('inventory');

module.exports = {
    // связь тип_патронов-оружие
    ammo: {
        // 9mm (пистолеты)
        37: [20, 44, 46, 47, 48, 80, 87, 88, 89, 90, 84],
        // 12mm (крупные пулеметы, дробовики)
        38: [21, 49, 91, 93, 96],
        // 7.62mm (винтовки)
        39: [50, 52, 107],
        // 5.56mm (Полу-автоматические винтовки)
        40: [22, 99, 100],
    },
    getAmmoTypeByItemId(itemId) {
        if ([20, 44, 46, 47, 48, 80, 87, 88, 89, 90, 84].includes(itemId)) return "9mm";
        if ([21, 49, 91, 93, 96].includes(itemId)) return "12mm";
        if ([50, 52, 107].includes(itemId)) return "7.62mm";
        if ([22, 99, 100].includes(itemId)) return "5.56mm";
    },
    init() {
        inventory.mergeList = Object.assign(inventory.mergeList, this.ammo);
    },
    // получить ID предмета патронов по ID предмета оружия
    getAmmoItemId(itemId) {
        for (var ammoId in this.ammo) {
            var list = this.ammo[ammoId];
            if (list.includes(itemId)) return parseInt(ammoId);
        }
        return null;
    },
    // получить оружие по типу патронов
    getWeaponByAmmoId(player, ammoId) {
        var weapons = inventory.getArrayWeapons(player);
        for (var i = 0; i < weapons.length; i++) {
            var weapon = weapons[i];
            if (this.ammo[ammoId].includes(weapon.itemId)) return weapon;
        }
        return null;
    },
}
