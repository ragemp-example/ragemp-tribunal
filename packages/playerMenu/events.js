let notifs = call('notifications');
let playerMenu = call('playerMenu');

module.exports = {
    "characterInit.done": (player) => {
        playerMenu.init(player);
    },
    "jobSkillsInit.done": (player) => {
        playerMenu.setSkills(player);
    },
    "phoneInit.done": (player) => {
        playerMenu.setNumber(player);
    },
    "spouseInit.done": (player) => {
        playerMenu.setSpouse(player);
    },
    "playerMenu.kick": (player) => {
        notifs.success(player, `До скорого! :)`);
        player.kick();
    },
    "player.faction.changed": (player) => {
        playerMenu.setFaction(player);
    },
    "player.factionRank.changed": (player) => {
        playerMenu.setFactionRank(player);
    },
    "player.job.changed": (player) => {
        playerMenu.setJob(player);
    },
    "player.biz.changed": (player) => {
        playerMenu.setBiz(player);
    },
    "player.house.changed": (player) => {
        playerMenu.setHouse(player);
    },
    "player.jobSkill.changed": (player, skill) => {
        playerMenu.setSkill(player, skill);
    },
    "player.donate.changed": (player) => {
        playerMenu.setDonate(player);
    },
    "player.warns.changed": (player) => {
        playerMenu.setWarns(player);
    },
    "player.slots.changed": (player) => {
        playerMenu.setSlots(player);
    },
    "player.promocode.activated": (player, promocode) => {
        var owner = mp.players.getBySqlId(promocode.characterId);
        if (owner && owner.character) {
            owner.character.Promocode = promocode;

            playerMenu.setInvited(owner);
            notifs.success(owner, `${player.name} активировал ваш промокод`);
        }
    },
    "player.promocode.changed": (player) => {
        playerMenu.setPromocode(player);
    },
    "player.completed.changed": (player) => {
        playerMenu.setCompleted(player);
    },
    "player.media.changed": (player) => {
        playerMenu.setMedia(player);
    },
    "player.password.changed": (player) => {
        playerMenu.setPasswordDate(player);
    },
    "player.email.changed": (player) => {
        playerMenu.setEmail(player);
    },
    "player.name.changed": (player) => {
        playerMenu.setName(player);
    },
    "player.admin.changed": (player) => {
        playerMenu.setAdmin(player);
    },
    "player.law.changed": (player) => {
        playerMenu.setLaw(player);
    },
    "player.narcotism.changed": (player) => {
        playerMenu.setNarcotism(player);
    },
    "player.nicotine.changed": (player) => {
        playerMenu.setNicotine(player);
    },
    "player.phone.number.changed": (player) => {
        debug(`player.phone.number.changed`)
        playerMenu.setNumber(player);
    },
    "player.spouse.changed": (player) => {
        playerMenu.setSpouse(player);
    },
    "player.fines.changed": (player) => {
        playerMenu.setFines(player);
    },
}
