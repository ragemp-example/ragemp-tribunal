let factions = call('factions');
let jobs = require('./index.js');
let notifs = require('../notifications');

module.exports = {
    "init": async () => {
        await jobs.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        jobs.initJobSkills(player);
        if (jobs.bonusPay > 1) player.call('chat.message.push', [`!{#59ff38} На сервере действует х${jobs.bonusPay} бонус на зарплаты!`]);
    },
    "jobs.set": (player, jobId) => {
        var header = `Устройство на работу`;
        var job = jobs.getJob(jobId);
        if (!job) return notifs.error(player, `Работа #${jobId} не найдена`, header);
        if (player.character.factionId && !factions.isCrimeFaction(player.character.factionId)) return notifs.error(player, `Вы состоите в ${factions.getFactionName(player)}`, header);
        if (player.character.job == job.id) return notifs.error(player, `Вы уже ${job.name}`, header);
        if (player.character.job) jobs.clearJobApps(player);
        jobs.addMember(player, job);
        notifs.success(player, `Вы устроились на работу`, job.name);
    },
    "jobs.leave": (player) => {
        var header = `Увольнение с работы`;
        if (!player.character.job) return notifs.error(player, `Вы не работаете`, header);
        jobs.clearJobApps(player);
        var job = jobs.getJob(player.character.job);
        notifs.success(player, `Вы уволились с работы`, job.name);
        jobs.deleteMember(player);
    }
}
