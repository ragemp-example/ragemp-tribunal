"use strict";



mp.moduleMarkers = {
    drawRadius: 60,
};

mp.events.add({
    "time.main.tick": () => {
        var start = Date.now();
        // mp.markers.forEachInStreamRange(marker => {
        //     if (marker.ignoreCheckVisible) return;
        //     var pos = mp.players.local.position;
        //     marker.visible = !(mp.vdist(pos, marker.position) > mp.moduleMarkers.drawRadius);
        // });
        mp.timeMainChecker.modules.markers = Date.now() - start;
    },
    "markers.tp.player.teleported": (playerId, pos, heading, markerId) => {
        if ((mp.police.followPlayer && mp.police.followPlayer.remoteId == playerId) ||
            (mp.mafia.followPlayer && mp.mafia.followPlayer.remoteId == playerId)) {
            // mp.players.local.setCoordsNoOffset(pos.x, pos.y, pos.z, false, false, false);
            // mp.players.local.setHeading(heading);
            var pos = mp.markers.atRemoteId(markerId).position;
            mp.players.local.taskFollowNavMeshToCoord(pos.x, pos.y, pos.z, 1, -1, 1, true, 0);
        }
    },
});
