let notifs = call('notifications');
let woodman = call('woodman');

module.exports = {
    "init": async () => {
        await woodman.init();
        inited(__dirname);
    },
    "woodman.items.buy": (player, index) => {
        woodman.buyItem(player, index);
    },
    "woodman.clothes.buy": (player, index) => {
        woodman.buyClothes(player, index);
    },
    "woodman.items.sell": (player) => {
        woodman.sellItems(player);
    },
    "woodman.trees.hit": (player) => {
        var header = `Лесоруб`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.tree) return out(`Вы не у дерева`);
        woodman.hitTree(player, player.tree);
    },
    "woodman.logs.add": (player, slot) => {
        slot = JSON.parse(slot);
        var header = `Лесоруб`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.tree) return out(`Вы не у дерева`);
        woodman.addLogObject(player.tree, slot);
    },
    "woodman.logs.hit": (player, index) => {
        var header = `Лесоруб`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.treeLog) return out(`Вы не у бревна`);
        woodman.hitLog(player, player.treeLog, index);
    },
    "woodman.items.add": (player, slots) => {
        slots = JSON.parse(slots);
        var header = `Лесоруб`;
        var out = (text) => {
            notifs.error(player, text, header);
        };
        if (!player.treeLog) return out(`Вы не у бревна`);
        woodman.addLogItems(player.treeLog, slots);
    },
    "playerEnterWorldObject": (player, colshape) => {
        if (colshape.db.type != 1) return;
        if (colshape.destroyTime) {
            if (Date.now() - colshape.destroyTime > woodman.respawnTreeTime) {
                colshape.health = 100;
                delete colshape.destroyTime;
            }
        }
        player.tree = colshape;
        player.call(`woodman.tree.inside`, [colshape.db.pos, colshape.health]);
    },
    "playerExitWorldObject": (player, obj) => {
        if (!player.tree) return;
        delete player.tree;
        player.call(`woodman.tree.inside`);
    },
};
