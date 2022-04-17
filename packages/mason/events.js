let notifs = call('notifications');
let mason = call('mason');

module.exports = {
    "init": async () => {
        await mason.init();
        inited(__dirname);
    },
    "mason.items.buy": (player, index) => {
        mason.buyItem(player, index);
    },
    "mason.clothes.buy": (player, index) => {
        mason.buyClothes(player, index);
    },
    "mason.items.sell": (player) => {
        mason.sellItems(player);
    },
    "mason.rocks.hit": (player) => {
        var header = `Каменщик`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.rock) return out(`Вы не у каменной породы`);
        mason.hitRock(player, player.rock);
    },
    "mason.items.add": (player, slots) => {
        slots = JSON.parse(slots);
        var header = `Каменщик`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.rock) return out(`Вы не у каменной породы`);
        mason.addRockItems(player.rock, slots);
    },
    "playerEnterWorldObject": (player, colshape) => {
        if (colshape.db.type != 2) return;
        if (colshape.destroyTime) {
            if (Date.now() - colshape.destroyTime > mason.respawnRockTime) {
                colshape.health = 100;
                delete colshape.destroyTime;
            }
        }
        player.rock = colshape;
        player.call(`mason.rock.inside`, [colshape.db.pos, colshape.health]);
    },
    "playerExitWorldObject": (player, obj) => {
        if (!player.rock) return;
        delete player.rock;
        player.call(`mason.rock.inside`);
    },
};
