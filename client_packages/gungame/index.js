// let roomsList = [];

mp.events.add({
    "gungame.menu": () => {
        mp.callCEFV(`selectMenu.showByName('roomMain')`);
    },
    "gungame.menu.close": () => {
        mp.callCEFV(`selectMenu.show = false`);
    },
    "gungame.room.list.set": (rooms) => {
        mp.callCEFV(`selectMenu.loader = false`);
        if (rooms.length === 0) return;
        const roomsNumbers = rooms.map(r => {
            return {
                text: `Комната #${r.id}`,
                id: r.id,
            }
        });
        mp.callCEFV(`selectMenu.setItems('roomList', ${JSON.stringify(roomsNumbers)});`);
        mp.callCEFV(`selectMenu.showByName('roomList')`);
    },
    "gungame.room.info.set": (info) => {
        mp.callCEFV(`selectMenu.loader = false`);
        const roomInfo = Object.entries(info).map(([k, v]) => {
            return {
                text: k,
                values: [v.toString()]
            }
        });

        roomInfo.push({
            text: 'Присоединиться'
        })
        mp.callCEFV(`selectMenu.setItems('roomInfo', ${JSON.stringify(roomInfo)});`);
        mp.callCEFV(`selectMenu.showByName('roomInfo')`);
    },
    "gungame.room.add.menu": (weaponsConfig, locationsConfig) => {
        let weapons = [];
        let locations = [];
        weaponsConfig.forEach(current => weapons.push(current.name));
        locationsConfig.forEach(current => locations.push(current.name));

        const items = [
            {
                text: "Локация",
                values: locations
            },
            {
                text: "Тип",
                values: ["Каждый сам за себя", "Команда на команду"],
            },
            {
                text: "Время битвы (мин)",
                i: 0,
                type: "editable"
            },
            {
                text: "Оружие",
                values: weapons
            },
            {
                text: "Количество патронов",
                type: "editable",
                i: 0
            },
            {
                text: "Количество игроков",
                type: "editable",
                i: 0
            },
            {
                text: "Создать",
            },
            {
                text: "Назад"
            }
        ];

        mp.callCEFV(`selectMenu.setItems('roomCreate', ${JSON.stringify(items)});`);
        mp.callCEFV(`selectMenu.showByName('roomCreate')`);
    },
    "gungame.room.add.menu.close": () => {
        mp.callCEFV(`selectMenu.show = false`);
    },
    "gungame.room.add": (settings) => {
        mp.events.callRemote('gungame.room.add', settings);
    },
    "gungame.teams.show": () => {
        mp.callCEFV(`selectMenu.showByName('roomTeamChoose')`);
    },
    "gungame.teams.close": () => {
        mp.callCEFV(`selectMenu.show = false`);
    },
    "gungame.info.update": (info) => {
        mp.callCEFV(`gungame.info = ${JSON.stringify(info)}`);
    },
    "gungame.score.update": (score) => {
        mp.callCEFV(`gungame.score = ${JSON.stringify(score)}`);
    },
    "gungame.player.kill": () => {
        mp.callCEFV(`gungame.kill()`);
    }
});

mp.events.addDataHandler("room", (player, state) => {
    if (player.remoteId == mp.players.local.remoteId) {
        mp.callCEFV(`interactionMenu.room = ${state}`);
        mp.callCEFV(`gungame.show = ${state}`);
        mp.inventory.enable(!state);
        // if (state) mp.busy.add('room', false);
        // else mp.busy.remove('room');
    }
})