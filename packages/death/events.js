let death = call('death');
let factions = call('factions');
let notifs = call('notifications');
let utils = call('utils');

module.exports = {
    "init": () => {
        inited(__dirname);
    },
    "death.wait": (player, time) => {
        player.spawn(player.position);
        player.health = death.health;
        if (player.character && player.character.arrestTime) return;
        death.addKnocked(player, time);
        if (time > 100 * 1000) mp.events.call(`mapCase.ems.calls.add`, player, `Ранение`);
    },
    "death.spawn": (player, groundZ, dimension, fromClient = false) => {
        if (player.character.arrestTime) {
            player.spawn(player.position);
            player.dimension = 0;
            player.health = 10;
            return;
        }
        // var marker = factions.getMarker(5);
        //player.spawn(marker.position);
        //player.dimension = marker.dimension;
        let hospitalPos = new mp.Vector3(295.670654296875, -583.5636596679688, 43.15401077270508);
        if (fromClient) {
            utils.spawnPlayer(player, hospitalPos);
        } else {
            player.spawn(hospitalPos);
        }
        player.dimension = 0;
        player.health = 10;
        death.removeKnocked(player);
    },
    "playerDeath": (player, reason, killer) => {

    },
    "playerQuit": (player) => {
        if (!player.getVariable("knocked")) return;

        death.addKnocked(player);
    },
};
