mp.events.add("fpsync.update", (player, camPitch, camHeading) => {
    mp.players.call(player.streamedPlayers, "fpsync.update", [player.id, camPitch, camHeading]);

});

mp.events.add("pointing.stop", (player) => {
    // mp.events.call('animations.stop', player)
    player.stopAnimation();
});