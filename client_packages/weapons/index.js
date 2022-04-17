"use strict";

mp.weapons = {
    needSync: false,
    lastSync: 0,
    waitSync: 20000,
    lastData: {},
    hashes: [],
    weaponData: require('weapons/data.js'),
    lastIsFreeAiming: false,
    lastIsInMeleeCombat: false,
    lastWeapon: null,

    sync(force = false) {
        var data = {};
        this.hashes.forEach(hash => {
            var ammo = this.getAmmoWeapon(hash);
            if (!force && this.lastData[hash] == ammo) return;
            this.lastData[hash] = ammo;
            data[hash] = ammo;
        });
        this.lastSync = Date.now();
        this.needSync = false;

        if (!Object.keys(data).length) return;
        // mp.terminal.push(`debug`, `sync weapons ammo:`);
        // mp.terminal.push(`debug`, data);
        // mp.events.callRemote(`weapons.ammo.sync`, JSON.stringify(data));
    },
    getAmmoWeapon(weaponhash) {
        weaponhash = this.hashToValid(weaponhash);
        return mp.game.invoke('0x015A522136D7F951', mp.players.local.handle, weaponhash);
    },
    currentWeapon() {
        return mp.game.invoke('0x0A6DB4965674D243', mp.players.local.handle);
    },
    getAmmoType() {
        return mp.game.invoke(`0xa38dcffcea8962fa`, mp.players.local.handle, mp.players.local.weapon);
    },
    getWeaponSlot(weaponhash) {
        return mp.game.invoke('0x4215460B9B8B7FA0', weaponhash);
    },
    getWeaponName(weaponHash) {
        if (!weaponHash) return null;
        if (!this.weaponData[weaponHash]) weaponHash = this.hashToValid(weaponHash);
        if (!this.weaponData[weaponHash]) return null;
        return this.weaponData[weaponHash].name;
    },
    hashToValid(hash) {
        if (hash == 3675956304) return -619010992; // weapon_machinepistol
        if (hash == 3173288789) return -1121678507; // weapon_minismg
        if (hash == 2578377531) return -1716589765; // weapon_pistol50
        if (hash == 3220176749) return -1074790547; // weapon_assaultrifle
        if (hash == 4019527611) return -275439685; // weapon_dbshotgun
        if (hash == 4208062921) return -86904375; // weapon_carbinerifle_mk2
        if (hash == 4024951519) return -270015777; // Assult SMG
        if (hash == 2937143193) return -1357824103; // Advanced Rifle
        if (hash == 3523564046) return -771403250; // Heavy Pistol
        var hashes = [2210333304];
        if (hashes.includes(hash)) return -2084633992;
        return hash;
    },
    setCurrentWeapon(weaponhash) {
        // d(`setCurrentWeapon: ${weaponhash}`)
        weaponhash = this.hashToValid(weaponhash);
        return mp.game.invoke('0xADF692B254977C0C', mp.players.local.handle, weaponhash, true);
    },
};

mp.events.add({
    "render": () => {
        // var player = mp.players.local;
        // mp.utils.drawText2d(`curr: ${mp.weapons.currentWeapon()} (${mp.weapons.getAmmoWeapon(mp.weapons.currentWeapon())}) weap: ${player.weapon} (${mp.weapons.getAmmoWeapon(player.weapon)}) |
        //     type: ${mp.weapons.getAmmoType()} slot: ${mp.weapons.getWeaponSlot(mp.weapons.currentWeapon())}`);
        // mp.utils.drawText2d(`hashes: ${JSON.stringify(mp.weapons.hashes)}`, [0.8, 0.6]);
        // mp.utils.drawText2d(`name: ${mp.weapons.getWeaponName(mp.weapons.currentWeapon())}`, [0.8, 0.65]);
        // mp.utils.drawText2d(`isShooting: ${mp.players.local.isShooting()}`, [0.8, 0.67]);
        // mp.utils.drawText2d(`mp.game.player.isFreeAiming(): ${mp.game.player.isFreeAiming()}`, [0.8, 0.69]);

        var isFreeAiming = mp.game.player.isFreeAiming();
        if (isFreeAiming && !mp.weapons.lastIsFreeAiming) {
            mp.events.call("playerStartFreeAiming");
        }
        if (!isFreeAiming && mp.weapons.lastIsFreeAiming) {
            mp.events.call("playerEndFreeAiming");
        }
        mp.weapons.lastIsFreeAiming = isFreeAiming;

        var isInMeleeCombat = mp.players.local.isInMeleeCombat();
        if (isInMeleeCombat && !mp.weapons.lastIsInMeleeCombat) {
            mp.events.call("playerStartMeleeCombat");
        }
        if (!isInMeleeCombat && mp.weapons.lastIsInMeleeCombat) {
            mp.events.call("playerEndMeleeCombat");
        }
        mp.weapons.lastIsInMeleeCombat = isInMeleeCombat;

        var weapon = mp.players.local.weapon;
        if (weapon != mp.weapons.lastWeapon) mp.events.call("playerWeaponChanged", weapon, mp.weapons.lastWeapon);
        mp.weapons.lastWeapon = weapon;
    },
    "time.main.tick": () => {
        var player = mp.players.local;
        // фикс пропажи оружия при достижении 0 патронов
        if (mp.weapons.hashes.length && player.weapon != mp.weapons.hashes[0] && player.getHealth() > 0) {
            mp.weapons.setCurrentWeapon(mp.weapons.hashes[0]);
        }

        // if (!mp.weapons.needSync) return;
        // if (Date.now() - mp.weapons.lastSync < mp.weapons.waitSync) return;
        // mp.weapons.sync();
    },
    "playerWeaponShot": (targetPos, targetEntity) => {
        // mp.weapons.needSync = true;
    },
    "weapons.giveWeapon": (hash) => {
        hash = parseInt(hash);
        // mp.terminal.push(`debug`, `give: ${hash} ${typeof hash}`)
        mp.events.call("weapons.removeWeapon", hash);
        mp.weapons.hashes.push(hash);
        mp.weapons.lastData[hash] = mp.weapons.getAmmoWeapon(hash)
    },
    "weapons.removeWeapon": (hash) => {
        hash = parseInt(hash);
        // mp.notify.info(`remove: ${hash}`)
        var i = mp.weapons.hashes.indexOf(hash);
        if (i == -1) return;
        mp.weapons.hashes.splice(i, 1);
        delete mp.weapons.lastData[hash];
    },
    "weapons.ammo.sync": (force = false) => {
        // mp.weapons.sync(force);
    },
    "weapons.ammo.remove": (sqlId, hash) => {
        hash = parseInt(hash);
        var ammo = mp.weapons.getAmmoWeapon(hash);
        mp.events.callRemote("weapons.ammo.remove", sqlId, ammo);
    },
});
