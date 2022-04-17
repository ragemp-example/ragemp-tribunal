"use strict";

let inventory = call('inventory');
let notifs = call('notifications');
let terminal = call('terminal');
let weapons = call('weapons');

module.exports = {
    "init": () => {
        weapons.init();
        inited(__dirname);
    },
    "weapons.ammo.sync": (player, data) => {
        // data = JSON.parse(data);
        // console.log(`weapons.ammo.sync: ${player.name}`)
        // console.log(data);
        // var weapons = inventory.getArrayWeapons(player);
        // weapons.forEach(item => {
        //     var params = inventory.getParamsValues(item);
        //     var newVal = data[params.weaponHash];
        //     if (newVal == null) return;
        //     if (newVal > params.ammo) {
        //         terminal.log(`[weapons.ammo.sync] ${player.name} имеет на клиенте ${newVal} патрон, на сервере ${params.ammo} (weapon: ${params.weaponHash})`);
        //         // notifs.error(player, `Вы были кикнуты по подозрению в читерстве`, `Античит`);
        //         // player.kick();
        //         // return;
        //     }
        //     newVal = Math.clamp(newVal, 0, 1000);
        //     inventory.updateParam(player, item, 'ammo', newVal);
        // });
    },
    "weapons.ammo.remove": (player, sqlId, ammo) => {
        // console.log(`weapons.ammo.remove: ${player.name} ${sqlId} (${ammo} пт.)`)
        var header = `Разрядка оружия`
        var weapon = inventory.getItem(player, sqlId);
        if (!weapon) return notifs.error(player, `Предмет #${sqlId} не найден`, header);
        if (!inventory.isInHands(weapon)) return notifs.error(player, `Оружие должно находиться в руках`, header);
        var ammoId = weapons.getAmmoItemId(weapon.itemId);
        var name = inventory.getName(weapon.itemId);
        if (!ammoId) return notifs.error(player, `Тип патронов для ${name} не найден`, header);
        var params = inventory.getParamsValues(weapon);
        if (!params.ammo) return notifs.error(player, `${name} пустой`, header);
        if (ammo > params.ammo) {
            terminal.log(`[weapons.ammo.remove] ${player.name} имеет на клиенте ${ammo} патрон, на сервере ${params.ammo} (weapon: ${params.weaponHash})`);
            notifs.error(player, `Вы были кикнуты по подозрению в читерстве`, `Античит`);
            player.kick();
            return;
        }

        inventory.addItem(player, ammoId, {
            count: ammo
        }, (e) => {
            if (e) return notifs.error(player, e, header);
            var ammoName = inventory.getName(ammoId);

            inventory.updateParam(player, weapon, 'ammo', 0);
            player.setWeaponAmmo(params.weaponHash, 0);
            notifs.success(player, `${name} разряжен`, ammoName);
            inventory.notifyOverhead(player, `Разрядил '${name}'`);
        });
    },
    "weapons.ammo.fill": (player, ammo, weapon) => {
        // console.log(`weapons.ammo.fill: ${player.name} ${ammo} (${weapon})`)
        var header = `Зарядка оружия`;
        if (typeof ammo == 'number') ammo = inventory.getItem(player, ammo);
        if (!ammo) return notifs.error(player, `Патроны не найдены`, header);

        var params = inventory.getParamsValues(ammo);
        if (!params.count) return notifs.error(player, `Патронов: 0 ед.`, header);
        if (!weapon) weapon = weapons.getWeaponByAmmoId(player, ammo.itemId);
        if (!weapon) return notifs.error(player, `Подходящее оружие не найдено`, header);
        // if (!inventory.isInHands(weapon)) return notifs.error(player, `Оружие должно находиться в руках`, header);
        if (weapons.getAmmoItemId(weapon.itemId) != ammo.itemId) return notifs.error(player, `Неверный тип патронов`, header);

        var name = inventory.getName(weapon.itemId);
        var ammoName = inventory.getName(ammo.itemId);

        var weaponParams = inventory.getParamsValues(weapon);
        var newAmmo = weaponParams.ammo + params.count;
        inventory.updateParam(player, weapon, 'ammo', newAmmo);
        inventory.deleteItem(player, ammo);
        if (inventory.isInHands(weapon)) player.setWeaponAmmo(weaponParams.weaponHash, newAmmo);
        notifs.success(player, `${name} заряжен`, ammoName);
        inventory.notifyOverhead(player, `Зарядил '${name}'`);
    },
    "weapons.weapon.ammo.fill": (player, sqlId) => {
        var header = `Зарядка оружия`;
        var weapon = inventory.getItem(player, sqlId);
        if (!weapon) return notifs.error(player, `Предмет #${sqlId} не найден`, header);
        // if (!inventory.isInHands(weapon)) return notifs.error(player, `Оружие должно находиться в руках`, header);
        var ammoId = weapons.getAmmoItemId(weapon.itemId);
        var name = inventory.getName(weapon.itemId);
        if (!ammoId) return notifs.error(player, `Тип патронов для ${name} не найден`, header);
        var ammo = inventory.getItemByItemId(player, ammoId);
        if (!ammo) return notifs.error(player, `Подходящие патроны не найдены`, name);
        mp.events.call(`weapons.ammo.fill`, player, ammo, weapon);
        inventory.notifyOverhead(player, `Зарядил '${name}'`);
    },
}
