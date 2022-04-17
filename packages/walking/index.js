"use strict";

let clubs = call('clubs');

module.exports = {
    // Походки
    walkings: [null, "move_m@brave", "move_m@confident", "move_m@shadyped@a", "move_m@quick", "move_m@sad@a", "move_m@fat@a", "move_m@drunk@verydrunk"],

    set(player, index) {
        if (index != clubs.drunkWalkingId && player.drunkenness >= clubs.walkingDrunkenness) return;
        index = Math.clamp(index, 0, this.walkings.length - 1);
        player.setVariable("walking", this.walkings[index]);
    }
};
