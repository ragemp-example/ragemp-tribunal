let notify;
let death;
let timer;
let inventory;
let utils;
let ammunation;

const header = "Игровая зона";

const startPoint = {
    x: -268.4685974121094,
    y: -2032.1922607421875,
    z: 30.145584106445312
}


module.exports = {
    accessLevel: 0,
    rooms: [],
    locations: [],

    clothes: [
        [
            [
                [11, 1, 1],
                [3, 0, 0],
                [4, 19, 0],
                [6, 76, 0]
            ],
            [
                [11, 22, 0],
                [3, 0, 0],
                [4, 45, 0],
                [6, 26, 0]
            ]
        ],
        [
            [
                [11, 0, 1],
                [3, 0, 0],
                [4, 31, 0],
                [6, 80, 0]
            ],
            [
                [11, 23, 0],
                [3, 0, 0],
                [4, 47, 0],
                [6, 3, 0]
            ]
        ]
    ],

    weaponsConfig: [
        {
            name: 'Heavy Revolver',
            itemId: 84,
            gameId: 'weapon_revolver',
            products: 95,
            type: 'pistols'
        },
        {
            name: 'Combat Pistol',
            itemId: 20,
            gameId: 'weapon_combatpistol',
            products: 95,
            type: 'pistols'
        },
        {
            name: 'SMG',
            itemId: 48,
            gameId: 'weapon_smg',
            products: 260,
            type: 'rifles'
        },
        {
            name: 'Pump Shotgun',
            itemId: 21,
            gameId: 'weapon_pumpshotgun',
            products: 270,
            type: 'shotguns'
        },
        {
            name: 'Carbine Rifle',
            itemId: 22,
            gameId: 'weapon_carbinerifle',
            products: 320,
            type: 'rifles'
        },
        {
            name: 'Machine Pistol',
            itemId: 89,
            gameId: 'weapon_machinepistol',
            products: 245,
            type: 'pistols'
        },
        {
            name: 'Compact Rifle',
            itemId: 52,
            gameId: 'weapon_compactrifle',
            products: 305,
            type: 'rifles'
        },
        {
            name: 'Carbine Rifle Mk II',
            itemId: 99,
            gameId: 'weapon_carbinerifle_mk2',
            products: 355
        },
        {
            name: 'Pump Shotgun Mk II',
            itemId: 91,
            gameId: 'weapon_pumpshotgun_mk2',
            products: 290,
            type: 'shotguns'
        },
        {
            name: 'Heavy Pistol',
            itemId: 80,
            gameId: 'weapon_heavypistol',
            products: 175,
            type: 'pistols'
        },
        {
            name: 'Advanced Rifle',
            itemId: 100,
            gameId: 'weapon_advancedrifle',
            products: 390,
            type: 'rifles'
        },
        {
            name: 'Assault SMG',
            itemId: 87,
            gameId: 'weapon_assaultsmg',
            products: 375,
            type: 'rifles'
        },
    ],

    async init() {
        this.locations = await db.Models.RoomLocation.findAll();

        timer = call('timer');
        notify = call('notifications');
        death = call('death');
        inventory = call('inventory');
        utils = call('utils');
        ammunation = call('ammunation');

        this.createStartPoint();

        inited(__dirname);
    },

    createStartPoint() {
        const { x, y, z } = startPoint;

        startPoint.marker = mp.markers.new(1, new mp.Vector3(x, y, z - 1), 2.0, {
            rotation: 0,
            dimension: 0,
            color: [255, 255, 125, 200]
        });

        const shape = mp.colshapes.newSphere(x, y, z, 2.0);
        shape.dimension = 0;
        shape.onEnter = (player) => {
            if (player.character.admin < this.accessLevel) return notify.error(player, 'Нет доступа', header);
            if (this.locations.length === 0) return notify.error(player, 'Отсутствуют локации', header);
            player.call('gungame.menu');
        }
        shape.onExit = (player) => {
            player.call('gungame.menu.close');
        }

        startPoint.shape = shape;

        startPoint.blip = mp.blips.new(491, new mp.Vector3(x, y, z), {
            name: 'Гангейм зона',
            color: 59,
            shortRange: true
        });
    },

    async addLocation(player, name) {
        const loc = this.getLocationByName(name);
        if (loc) return notify.error(player, 'Локация с таким названием уже существует');

        const newLoc = {
            name: name,
            x: player.position.x,
            y: player.position.y,
            z: player.position.z
        }

        const locInfo = await db.Models.RoomLocation.create(newLoc);
        this.locations.push(locInfo);
        notify.success(player, `Локация добавлена. ID: ${locInfo.id}`, header);
        notify.info(player, 'Добавьте точки спавна команд', header);
    },

    async deleteLocation(player, id) {
        const loc = this.getLocationById(id);
        if (!loc) return notify.error(player, 'Локации с таким id не существует', header);

        await loc.destroy();

        this.locations = this.locations.filter(l => l.id !== id);
    },

    async addTeamPoint(player, locId) {
        const { x, y, z } = player.position;

        const loc = this.getLocationById(locId);
        if (!loc) return notify.error(player, 'Такой локации не существует', header);
        if (loc.fX && loc.sX) return notify.error(player, 'В локации уже добавлены точки команд', header);

        if (!loc.fX) {
            loc.fX = x;
            loc.fY = y;
            loc.fZ = z;
        } else if (!loc.sX) {
            loc.sX = x;
            loc.sY = y;
            loc.sZ = z;
        }

        await loc.save();
        notify.success(player, 'Точка спавна команды добавлена', header);
    },

    setClothes(player) {
        inventory.clearAllView(player);
        const gender = player.character.gender;
        let clths;

        if (player.room.team === 0) {
            const rndIndex = utils.randomInteger(0, 1);
            clths = this.clothes[gender][rndIndex];

        } else {
            clths = this.clothes[gender][player.room.team - 1];
        }

        clths.forEach(params => player.setClothes(params[0], params[1], params[2], 0))
    },

    getLocationById(id) {
        return this.locations.find(l => l.id === id);
    },

    getLocationByName(name) {
        return this.locations.find(l => l.name === name);
    },

    goToLocation(player, id) {
        const loc = this.getLocationById(id);
        if (!loc) return notify.error(player, 'Локация не найдена', header);

        player.position = new mp.Vector3(loc.x, loc.y, loc.z);
    },

    getRoom(id) {
        return this.rooms.find(r => r.id === id);
    },

    getRoomByPlayer(player) {
        if (!player.character) return;

        this.rooms.find(r => r.players.find(p => {
            if (!p.character) return;
            return p.character.id === player.character.id;
        }));
    },

    addRoom(player, settings) {
        const { location, type, size, weapon, ammo, time } = settings;

        const loc = this.locations[location];
        // if ()

        const id = this.rooms[this.rooms.length - 1] ? this.rooms[this.rooms.length - 1].id + 1 : 1;

        const room = {
            id: id,
            players: [],
            location: loc,
            time: time,
            size: size,
            weapon: weapon,
            ammo: ammo,
            type: type,
            dimension: id + 1000
        }

        this.createSpawnPoints(room);

        this.rooms.push(room);
        mp.events.call('gungame.room.enter', player, room.id);
        // this.enterRoom(player, room.id);
    },

    deleteRoom(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;
        if (room.players.length > 0) return;

        this.clearRoomTimer(room);
        this.rooms = this.rooms.filter(r => r.id !== roomId);
    },

    createSpawnPoints(room) {
        if (!room) return;
        const spawnPoints = [];
        const { x, y, z, fX, fY, fZ, sX, sY, sZ } = room.location;
        spawnPoints.push(new mp.Vector3(x, y, z));
        if (fX) spawnPoints.push(new mp.Vector3(fX, fY, fZ));
        if (sX) spawnPoints.push(new mp.Vector3(sX, sY, sZ));

        room.spawnPoints = spawnPoints;
    },

    getRoomPlayers(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        return [ ...room.players[0], ...room.players[1] ];
    },

    enterRoom(player, roomId) {
        if (!player.character) return;

        const room = this.getRoom(roomId);
        if (!room) return;

        if (room.players.length === room.size) return notify.error(player, 'В комнате нет места', header);
        room.players.push(player);
        if (room.type === 0) player.room.team = 0;

        if (room.players.length === (room.size)) {
            // timer.add(() => this.startRoom(room), 5000);
            this.startRoom(room);
        }

        // this.chooseTeam(player);
        // TODO
        notify.success(player, `Вы присоединились к комнате #${room.id}`, header);
        this.respawnPlayer(player);
        player.setVariable("room", true);
        this.setClothes(player);

        this.updateRoomInfo(room.id);
    },

    exitRoom(player) {
        if (!player.character) return;
        if (!player.room) return;

        const room = this.getRoom(player.room.id);
        if (!room) return;

        room.players = room.players.filter(p => p.character.id !== player.character.id);
        player.room = null;
        this.removeWeapon(player, room.weapon);
        this.tpPlayer(player, startPoint, 0);
        player.setVariable("room", false);
        inventory.clearAllView(player);
        inventory.updateAllView(player);

        if (room.players.length === 0) return this.deleteRoom(room.id);
        this.updateRoomInfo(room.id);
    },

    startRoom(room) {
        this.initScore(room.id);
        this.updateRoomScore(room.id);
        room.players.forEach(p => this.respawnPlayer(p));
        this.sendMessage(room, 'Битва началась!');

        timer.add(() => {
            this.sendMessage(room, 'До конца битвы осталось 10 секунд');
        }, room.time - 10000);

        room.timer = timer.add(() => {
            this.stopRoom(room);
        }, room.time);
    },

    stopRoom(room) {
        // room.players.forEach(p => {
        //     if  (!p.character) return;
        //     if (!p.room) return;
        //
        //     const score = this.sortedScore(room.id);
        //
        //     p.call('gungame.score.show', [score]);
        // })

        const sums = this.getTeamSums(room.id);
        const sortedScore = this.sortedScore(room.id);

        if (room.type === 0) {
            const winner = sortedScore[0][0];
            this.sendMessage(room, `Победитель ${winner.name} (${winner.kills} убийств)`);
        } else {
            if (sums[1] > sums[2]) this.sendMessage(room, `Победила команда 1`);
            else  if (sums[1] < sums[2]) this.sendMessage(room, `Победила команда 2`);
            else this.sendMessage(room, `Ничья!`);
        }

        this.sendMessage(room, 'Автоматический выход из комнаты через 5 сек.')

        timer.add(() => {
            room.players.forEach(p => {
                if (!p.character) return;
                this.exitRoom(p);
            });

            this.deleteRoom(room.id);
        }, 5000);
    },

    tpPlayer(player, pos, dimension) {
        player.position = new mp.Vector3(pos.x, pos.y, pos.z);
        player.dimension = dimension;
    },

    chooseTeam(player) {
        if (!player.room) return;
        if (player.room.team) return;
        const roomId = player.room.id;
        if (!roomId) return;
        const room = this.getRoom(roomId);
        if (!room) return;

        if (room.type === 0) return player.room.team = 0;
        else return player.call('gungame.teams.show');
    },

    respawnPlayer(player) {
        if (!player.room) return;
        const roomInfo = this.getRoom(player.room.id);
        if (!roomInfo) return;

        if (roomInfo.type !== 0 && player.room.team === 0) return;

        if (player.room.team === 0) {
            const rndIndex = utils.randomInteger(0, 2);
            player.spawn(roomInfo.spawnPoints[rndIndex]);
        } else {
            player.spawn(roomInfo.spawnPoints[player.room.team]);
        }

        player.dimension = roomInfo.dimension;
        player.health = 100;
        death.removeKnocked(player);
        const weapon = roomInfo.weapon;
        const ammo = roomInfo.ammo;
        weapon && ammo && this.giveWeapon(player, weapon, ammo);
    },

    clearRoomTimer(room) {
        if (!room) return;
        room.timer && timer.remove(room.timer);
        room.timer = null;
    },

    giveWeapon(player, weapon, ammo) {
        const hash = mp.joaat(weapon);
        inventory.giveWeapon(player, hash, ammo);
    },

    removeWeapon(player, weapon) {
        const hash = mp.joaat(weapon);
        player.setWeaponAmmo(hash, 0);
        player.removeWeapon(hash);
        inventory.removeWeapon(player, hash);
        player.call(`weapons.removeWeapon`, [hash.toString()]);
    },

    sendMessage(room, message) {
        if (!room) return;

        room.players.forEach(p => {
            if (!p.character) return;
            if (!p.room) return;
            notify.info(p, message, header);
        });
    },

    updateRoomScore(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        const score = this.sortedScore(room.id);
        room.players.forEach(p => {
            p.call('gungame.score.update', [score]);
        });
    },

    updateRoomInfo(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        const info = {
            players: room.players.length,
            max: room.size,
            time: room.time / 1000 / 60,
            type: room.type
        }

        room.players.forEach(p => {
            p.call('gungame.info.update', [info]);
        });
    },

    initScore(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        room.score = [[], [], []];

        room.players.forEach(p => {
            if (!p.room) return;
            room.score[p.room.team].push({
                id: p.character.id,
                name: p.character.name,
                kills: 0
            });
        })
    },

    playerKill(player) {
        if (!player.character) return;
        if (!player.room) return;
        const room = this.getRoom(player.room.id);
        if (!room) return;

        const team = player.room.team;

        const index = room.score[team].findIndex(s => s.id === player.character.id);
        if (index === -1) return;
        room.score[team][index].kills += 1;

        player.call('gungame.player.kill');
        this.updateRoomScore(room.id);
    },

    sortedScore(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        const compare = (a, b) => (a.kills < b.kills) ? 1 : -1;

        return room.score.map(s => s.sort(compare));
    },

    getTeamSums(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        return room.score.map(s => s.reduce((a, b) => a + b.kills, 0));
    }
}