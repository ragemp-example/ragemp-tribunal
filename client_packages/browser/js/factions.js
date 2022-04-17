function isBandFaction(factionId) {
    return (factionId >= 8 && factionId <= 11) || factionId == 16;
}

function isMafiaFaction(factionId) {
    return (factionId >= 12 && factionId <= 14) || factionId == 17;
}