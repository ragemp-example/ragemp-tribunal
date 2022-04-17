var hud = require('./index.js');

module.exports = {
    /// Отображение онлайна в худе
    "player.joined": (player) => {
        mp.players.forEach((current) => {
            current.call("hud.setData", [{players: mp.players.length}]);
        });
    },
    "characterInit.done": (player) => {
        player.call('hud.load');

        if (player.character.admin > 0) {
            player.call('hud.players.list.load', [hud.loadPlayers()]);
        }

        mp.players.forEach(current => {
            if (current.character && current.id != player.id && current.character.admin > 0 ) {
                current.call('hud.players.list.add', [hud.loadNewPlayer(player)])
            }
        });
    },
    "playerQuit": (player) => {
        mp.players.forEach((current) => {
            current.call("hud.setData", [{players: mp.players.length - 1}]); /// После выхода из игры игрок какое-то время висит в пуле, возможно стоит создать таймер
            if (current.character && current.id != player.id && current.character.admin > 0 ) {
                current.call('hud.players.list.remove', [player.id]);
            }
        });
    },
    "hud.players.list.show": (player) => {
        if (player.character.admin > 0) {
            player.call("hud.players.list.show", [true]);
        }
    },
    "player.faction.changed": (player) => {
        hud.setFaction(player);
    }
}
