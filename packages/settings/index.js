"use strict";

let mood = call('mood');
let walking = call('walking');

module.exports = {
    // Кол-во походок
    walkingCount: 7,
    // Кол-во эмоций
    moodCount: 7,

    apply(player, modified = null) {
        if (modified.walking != null) walking.set(player, player.character.settings.walking);
        if (modified.mood != null) mood.set(player, player.character.settings.mood);
    }
};
