let jobs = call('jobs');
let notifs = call('notifications');

module.exports = {
    "/jlist": {
        description: "Посмотреть список работ.",
        access: 6,
        args: "",
        handler: (player, args, out) => {
            var text = "ID) Имя<br/>";
            for (var i = 0; i < jobs.jobs.length; i++) {
                var job = jobs.jobs[i];
                text += `${job.id}) ${job.name}<br/>`;
            }
            out.log(text, player);
        }
    },
    "/jadd": {
        access: 4,
        description: "Сменить работу игрока.",
        args: "[ид_игрока]:n [ид_работы]:n",
        handler: (player, args, out) => {
            var job = jobs.getJob(args[1]);
            if (!job) return out.error(`Работа #${args[1]} не найдена`, player);
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);
            if (rec.character.factionId) return out.error(`${rec.name} состоит в организации`, player);

            jobs.addMember(rec, job);
            out.info(`${player.name} устроил ${rec.name} на работу ${job.name}`);
            notifs.info(rec, `${player.name} устроил вас на работу`, job.name);
        }
    },
    "/jexp": {
        access: 4,
        description: "Изменить навык работы игрока.",
        args: "[ид_игрока]:n [ид_работы]:n [навык]:n",
        handler: (player, args, out) => {
            var job = jobs.getJob(args[1]);
            if (!job) return out.error(`Работа #${args[1]} не найдена`, player);
            var rec = mp.players.at(args[0]);
            if (!rec || !rec.character) return out.error(`Игрок #${args[0]} не найден`, player);

            var skill = jobs.getJobSkill(rec, job);
            jobs.setJobExp(rec, skill, args[2]);

            out.info(`${player.name} изменил навык ${job.name} у ${rec.name} на ${skill.exp}%`);
            notifs.info(rec, `${player.name} изменил ваш навык на ${skill.exp}%`, job.name);
        }
    },
}
