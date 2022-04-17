const gg = require('./index');
let timer;

const convertTime = time => {
    if (isNaN(parseInt(time))) return 3 * 1000 * 60;
    if (!time || parseInt(time) === 0) return 3 * 1000 * 60;
    if (Math.abs(parseInt(time)) > 15) return 15 * 1000 * 60;
    return Math.abs(parseInt(time)) * 60 * 1000;
};

const convertAmmo = ammo => {
    if (isNaN(parseInt(ammo))) return 100;
    if (!ammo || parseInt(ammo) === 0) return 100;
    if (parseInt(ammo) > 10000) return 10000;
    return Math.abs(parseInt(ammo));
};

const convertMaxPlayers = players => {
    if (isNaN(parseInt(players))) return 10;
    if (!players || parseInt(players) === 0) return 10;
    if (parseInt(players) > 1000) return 999;
    return Math.abs(parseInt(players));
};

module.exports = {
    "init": async () => {
        await gg.init();
        timer = call('timer');
    },
    "gungame.room.add": (player, settings) => {
        settings = JSON.parse(settings);

        gg.addRoom(player, {
            ...settings,
            ammo: convertAmmo(settings.ammo),
            time: convertTime(settings.time),
            size: convertMaxPlayers(settings.size),
            weapon: gg.weaponsConfig[settings.weapon].gameId
        })
    },
    "gungame.room.list": (player) => {
        const info = gg.rooms.map(r => {
            return {
                players: r.players.length,
                max: r.size,
                weapon: gg.weaponsConfig.find(w => w.gameId === r.weapon).name,
                location: r.location.name,
                time: r.time / 60 / 1000,
                id: r.id
            }
        });

        // console.log(info);

        player.call('gungame.room.list.set', [info]);
    },
    "gungame.room.info": (player, roomId) => {
        const room = gg.getRoom(parseInt(roomId));
        if (!room) return;

        const info = {
            'Номер': room.id,
            'Игроков': room.players.length,
            'Максимум': room.size,
            'Оружие': gg.weaponsConfig.find(w => w.gameId === room.weapon).name,
            'Локация': room.location.name,
            'Время': room.time / 60 / 1000,
        }

        player.call('gungame.room.info.set', [info]);
    },
    "gungame.room.create.menu": (player) => {
        const filteredLocations = gg.locations.filter(l => l.fX !== null);
        player.call('gungame.room.add.menu', [gg.weaponsConfig, filteredLocations]);
    },
    "gungame.room.enter": (player, roomId) => {
        roomId = parseInt(roomId);
        const room = gg.getRoom(roomId);
        if (!room) return;
        player.room = { id: roomId };
        if (room.type === 0) {
            gg.enterRoom(player, roomId);
        } else {
            gg.chooseTeam(player);
        }
    },
    "gungame.room.exit": (player) => {
        if (!player.room) return;
        gg.exitRoom(player);
    },
    "gungame.teams.choose": (player, team) => {
        if (team !== 1 && team !== 2) return;

        player.room.team = team;
        gg.enterRoom(player, player.room.id);
    },
    "playerDeath": (player, reason, killer) => {
        if (!player.character) return;
        if (!player.room) return;
        if (!killer || !killer.character) {
            timer.add(() => {
                gg.respawnPlayer(player);
            }, 3000);
        }
    },
    "customDeath": (player, reason, killer) => {
        if (!player.character) return;
        if (!player.room) return;
        if (!killer.room) return;

        const room = gg.getRoom(player.room.id);
        if (!room) return;
        if (!room.timer) return;
        if (room.type === 1 && (player.room.team === killer.room.team)) return;
        gg.playerKill(killer);
    },
    "playerQuit": (player) => {
        gg.exitRoom(player);
    }
}