let chat;
let timer;
let utils;

module.exports = {
    enabled: true,
    // Вид действия: 0 - оповещение админов, 1 - оповещение админов и игрока + кик
    cheats: [
        {
            id: 0,
            name: 'Запрещенное оружие',
            actionType: 1,
        },
        {
            id: 1,
            name: 'Убийство из запрещенного оружия',
            actionType: 1,
        },
        {
            id: 2,
            name: 'Телепорт/Fly',
            actionType: 0,
        },
        {
            id: 3,
            name: 'Телепорт/Fly в авто',
            actionType: 0,
        },
        {
            id: 4,
            name: 'Спидхак',
            actionType: 0,
        },
        {
            id: 5,
            name: 'Вождение незаведенного авто',
            actionType: 0,
        },
    ],
    bannedWeaponNames: [
        "WEAPON_PASSENGER_ROCKET",
        "weapon_minigun",
        "weapon_firework",
        "weapon_rpg",
        "weapon_grenadelauncher",
        "weapon_grenadelauncher_smoke",
        "weapon_railgun",
        "weapon_hominglauncher",
        "weapon_compactlauncher",
        "weapon_rayminigun",
        "WEAPON_STINGER",
        "WEAPON_AIRSTRIKE_ROCKET",
        "weapon_dagger",
        "weapon_bottle",
        "weapon_crowbar",
        "weapon_hammer",
        "weapon_knuckle",
        "weapon_knife",
        "weapon_machete",
        "weapon_switchblade",
        "weapon_wrench",
        "weapon_battleaxe",
        "weapon_poolcue",
    ],
    bannedWeapons: [],
    // Интервал проверки
    checkInterval: 2000,
    // Дистанция, которая считается телепортом
    teleportDist: 50,
    // Дистанция, которая считается телепортом для игрока в авто
    teleportDistVehicle: 300,
    init() {
        chat = call('chat');
        timer = call('timer');
        utils = call('utils');
        this.initBannedWeapons();
        this.initChecker();
    },
    initChecker() {
        timer.addInterval(() => {
            if (!this.enabled) return;
            mp.players.forEach(current => {
                if (!current.character) return;
                if (current.character.admin) return;
                if (!current.anticheat) current.anticheat = {};
                this.checkTeleport(current);
                this.checkFakeEngine(current);
            });
        }, this.checkInterval)
    },
    initBannedWeapons() {
        this.bannedWeaponNames.forEach(x => this.bannedWeapons.push({hash: mp.joaat(x), name: x}));
    },
    action(player, index, description, client = false) {
        if (player.character.admin) return;
        let cheat = this.cheats.find(x => x.id === index);
        if (!cheat) return;
        let cheatInfo = cheat.name;
        mp.events.call('admin.notify.all',
            `!{#ff4242}[AC] ${player.name} [${player.id}] ${cheat.actionType ? 'кикнут за' : 'возможно использует'} ${cheatInfo}`);
        if (description) {
            mp.events.call('admin.notify.all', `!{#ff4242}[AC] Описание: ${description}`);
        }
        console.log('\x1b[33m', `[AC] ${player.name} [${player.id}]: ${cheatInfo} | ${description}`, '\x1b[0m');
        let code = `${client ? 'C' : 'S'}${index}`;
        this.log(player, code, cheatInfo, description);
        if (cheat.actionType) {
            chat.push(player, `!{#ff4242}[AC] Вы были кикнуты по подозрению в читерстве`);
            chat.push(player, `!{#ff4242}[AC] Код античита: !{#ffbd42}${code}`);
            if (mp.players.exists(player)) {
                player.kick('AC');
            }
        }
    },
    checkBannedWeapon(player, hash) {
        let weapon = this.bannedWeapons.find(x => x.hash === hash);
        if (weapon) this.action(player, 0, weapon.name.toUpperCase());
    },
    checkBannedReason(player, hash) {
        let reason = this.bannedWeapons.find(x => x.hash === hash);
        if (reason) this.action(player, 1, reason.name.toUpperCase());
    },
    checkTeleport(player) {
        if (!player.anticheat.lastPos) return player.anticheat.lastPos = player.position;
        if (player.anticheat.exception) {
            player.anticheat.exception = false;
            player.anticheat.lastPos = player.position;
            return;
        }
        let lastPos = player.anticheat.lastPos;
        let newPos = player.position;
        let dist = utils.vdistSqr(lastPos, newPos);
        if (player.vehicle && dist > this.teleportDistVehicle) {
            this.action(player, 3,
                `${this.getDescVector(lastPos)} -> ${this.getDescVector(newPos)} (${parseInt(dist)} м) | ${player.vehicle.modelName}`);
        } else if (!player.vehicle && dist > this.teleportDist) {
            this.action(player, 2,
                `${this.getDescVector(lastPos)} -> ${this.getDescVector(newPos)} (${parseInt(dist)} м)`);
        }
        player.anticheat.lastPos = newPos;
    },
    getDescVector(pos) {
        return `${parseInt(pos.x)} ${parseInt(pos.y)} ${parseInt(pos.z)}`;
    },
    checkFakeEngine(player) {
        let vehicle = player.vehicle;
        if (!vehicle) return;
        if (player.seat !== 0) return;
        if (vehicle.key === 'newbierent' || vehicle.key === 'boatsrent' || vehicle.key === 'testdrive' || vehicle.key === 'admin') return;
        if (vehicle.key === 'private' && vehicle.owner === player.character.id) return;
        if (vehicle.key === 'faction' && vehicle.owner === player.character.factionId) return;
        if (!vehicle.engineStatus && vehicle.engine) {
            this.action(player, 5, `${vehicle.modelName} (${vehicle.key})`);
        }
    },
    log(player, code, name, description) {
        if (!player.character) return;
        let data = {
            characterId: player.character.id,
            playerId: player.id,
            code: code,
            name: name,
            description: description
        }
        db.Models.AnticheatLog.create(data);
    }
}