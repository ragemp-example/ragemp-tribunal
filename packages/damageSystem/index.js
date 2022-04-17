"use strict";

let weaponDamageInfo = [];

module.exports = {
    defaultDamage: 10,
    async init() {
        weaponDamageInfo = await db.Models.WeaponDamage.findAll();
    },
    show() {
        let infoStrings = [];
        for (let i = 0; i < weaponDamageInfo.length; i++) {
            infoStrings.push(`Weapon:\t${weaponDamageInfo[i].name}\t Value:\t${weaponDamageInfo[i].value}`)
        }
        return infoStrings;
    },
    async addOrUpdate(weaponName, damageValue) {
        let weaponHash = genHash(weaponName);
        let infoIndex = weaponDamageInfo.findIndex(info => info.name === weaponName);
        if (infoIndex === -1) {
            let newDamageInfoItem = await db.Models.WeaponDamage.create({
                name: weaponName,
                hash: weaponHash,
                value: damageValue
            });
            weaponDamageInfo.push(newDamageInfoItem);
            return 1;
        }
        else {
            weaponDamageInfo[infoIndex].value = damageValue;
            await db.Models.WeaponDamage.update({
                value: damageValue,
            }, {
                where: {
                    id: weaponDamageInfo[infoIndex].id
                }
            });
            return 2;
        }
    },
    async remove(weaponName) {
        let infoIndex = weaponDamageInfo.findIndex(info => info.name === weaponName);
        if (infoIndex === -1) {
            return 0;
        }
        await weaponDamageInfo[infoIndex].destroy();
        weaponDamageInfo.splice(infoIndex, 1);
        return 1;
    },
    findDamageValue(weaponHash) {
        if (weaponHash != null) {
            let infoIndex = weaponDamageInfo.findIndex(info => info.hash === weaponHash);
            if (infoIndex !== -1) {
                return weaponDamageInfo[infoIndex].value;
            }
        }
        return null;
    },
    damagePlayer(damagedPlayerInfo, damageValue) {

        if (damagedPlayerInfo.armour <= 0) {
            damagedPlayerInfo.health -= damageValue;
        } else {
            if (damagedPlayerInfo.armour >= damageValue) {
                damagedPlayerInfo.armour -= damageValue;
            }
            else {
                let damageArmour = damagedPlayerInfo.armour;
                damagedPlayerInfo.armour = 0;
                damagedPlayerInfo.health -= damageValue - damageArmour;
            }
        }
    }
};

let genHash = (str) => {
    let toUTF8Array = (str) => {
        let utf8 = [];
        for (let i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                    0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                    | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >>18),
                    0x80 | ((charcode>>12) & 0x3f),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
        }
        return utf8;
    }

    let genHash = (str) => {
        str = toUTF8Array(str);

        let h = new Uint32Array(1);
        h[0] = 0;
        for (let i = 0; i < str.length; i++)
        {
            h[0] += str[i];
            h[0] += h[0] << 10;
            h[0] ^= h[0] >>> 6;
        }
        h[0] += (h[0] << 3);
        h[0] ^= (h[0] >>> 11);
        h[0] += (h[0] << 15);

        return h[0];
    }

    return genHash(str);
}