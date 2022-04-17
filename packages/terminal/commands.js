let terminal = call('terminal');

module.exports = {
    "/cmdname": {
        access: 6,
        description: "Изменить название команды.",
        args: "[команда] [название]",
        handler: (player, args, out) => {
            if (args[0][0] != "/") args[0] = "/" + args[0];
            if (args[1][0] != "/") args[1] = "/" + args[1];

            var cmd = terminal.commands[args[0]];
            if (!cmd) return out.error(`Команда ${args[0]} не найдена`, player);
            if (cmd.access > player.character.admin) return out.error(`Команда ${args[0]} выше вашего доступа`, player);
            if (terminal.commands[args[1]]) return out.error(`Команда ${args[1]} уже существует`, player);

            out.info(`${player.name} изменил название команды (${args[0]} => ${args[1]})`);
            terminal.setCmdName(args[0], args[1]);
        }
    },
    "/cmddesc": {
        access: 6,
        description: "Изменить описание команды.",
        args: "[команда] [описание]",
        handler: (player, args, out) => {
            if (args[0][0] != "/") args[0] = "/" + args[0];
            var name = args[0];

            var cmd = terminal.commands[name];
            if (!cmd) return out.error(`Команда ${name} не найдена`, player);
            if (cmd.access > player.character.admin) return out.error(`Команда ${name} выше вашего доступа`, player);

            args.shift();
            var description = args.join(" ");

            out.info(`${player.name} изменил описание команды ${name} (${cmd.description} => ${description})`);
            terminal.setCmdDescription(name, description);
        }
    },
    "/cmdaccess": {
        access: 6,
        description: "Изменить уровень доступа к команде.",
        args: "[команда] [уровень]:n",
        handler: (player, args, out) => {
            if (args[0][0] != "/") args[0] = "/" + args[0];
            args[1] = Math.clamp(args[1], 1, 6);
            var name = args[0];

            var cmd = terminal.commands[name];
            if (!cmd) return out.error(`Команда ${name} не найдена`, player);
            if (cmd.access > player.character.admin) return out.error(`Команда ${name} выше вашего доступа`, player);

            out.info(`${player.name} изменил уровень команды ${name} (${cmd.access} => ${args[1]})`);
            terminal.setCmdAccess(name, args[1]);
        }
    },
}
