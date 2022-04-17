"use strict";

module.exports = {
    // Эмоции
    moods: [null, "mood_aiming_1", "mood_angry_1", "mood_happy_1", "mood_stressed_1", "mood_sulk_1"],

    set(player, index) {
        index = Math.clamp(index, 0, this.moods.length - 1);
        player.setVariable("mood", this.moods[index]);
    }
};
