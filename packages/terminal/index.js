"use strict";
let logger = call('logger');
let notifs = require('../notifications');
let admin;

module.exports = {
    // Мин. уровень админки для доступа к консоли (character.admin)
    access: 1,
    // Доступные команды
    commands: {},


    async init() {
        admin = call('admin');
        this.commands = admin.getCommands();
        await this.loadCommandsFromDB();
    },
    async loadCommandsFromDB() {
        var dbCommands = await db.Models.Command.findAll();
        dbCommands.forEach(dbCmd => {
            var cmd = this.commands[dbCmd.cmd];
            if (!cmd) return;
            if (dbCmd.cmd != dbCmd.name) {
                this.commands[dbCmd.name] = cmd;
                delete this.commands[dbCmd.cmd];
            }
            cmd.description = dbCmd.description;
            cmd.access = dbCmd.access;
            cmd.db = dbCmd;
        });

        console.log(`[TERMINAL] Команды загружены (${dbCommands.length} / ${Object.keys(this.commands).length} шт.)`);
    },
    setCmdName(cmdName, name) {
        var cmd = this.commands[cmdName];
        if (!cmd) return;
        var dbCmd = cmd.db;
        if (!dbCmd) {
            dbCmd = db.Models.Command.build({
                cmd: cmdName,
                name: name,
                description: cmd.description,
                access: cmd.access
            });
            cmd.db = dbCmd;
        }

        dbCmd.name = name;
        dbCmd.save();

        this.commands[name] = cmd;
        delete this.commands[cmdName];
    },
    setCmdDescription(cmdName, description) {
        var cmd = this.commands[cmdName];
        if (!cmd) return;
        var dbCmd = cmd.db;
        if (!dbCmd) {
            dbCmd = db.Models.Command.build({
                cmd: cmdName,
                name: cmdName,
                description: description,
                access: cmd.access
            });
            cmd.db = dbCmd;
        }

        dbCmd.description = description;
        dbCmd.save();

        cmd.description = description;
    },
    setCmdAccess(cmdName, access) {
        var cmd = this.commands[cmdName];
        if (!cmd) return;
        var dbCmd = cmd.db;
        if (!dbCmd) {
            dbCmd = db.Models.Command.build({
                cmd: cmdName,
                name: cmdName,
                description: cmd.description,
                access: access
            });
            cmd.db = dbCmd;
        }

        dbCmd.access = access;
        dbCmd.save();

        cmd.access = access;
    },
    haveAccess(player) {
        return player.character.admin >= this.access;
    },
    handleCommand(player, cmdName, cmdArgs) {
        if (!this.haveAccess(player)) return notifs.error(player, `Доступ запрещен`, "Терминал");
        if (cmdName == "help") return this.helpCmdHandler(player, cmdArgs);
        var cmd = this.commands["/" + cmdName];
        if (!cmd) return this.error(`Команда "${cmdName}" не найдена. Введите "help" для просмотра всех команд.`, player);
        if (cmd.args.length > 0) {
            var syntax = cmd.args.split(" ");
            if (cmdArgs.length < syntax.length) return this.warning(`Неверное количество параметров.<br/>Используйте "${cmdName} ${cmd.args}"`, player);
            for (var i = 0; i < syntax.length; i++) {
                var argType = syntax[i].split(":")[1];
                if (!argType) continue;
                if (!this.isValidArg(argType, cmdArgs[i])) return this.error(`Неверное значение "${cmdArgs[i]}" для параметра ${syntax[i]}!`, player);
                else cmdArgs[i] = this.toValidArg(argType, cmdArgs[i]);
            }
        }
        if (player.character.admin < cmd.access) return this.warning(`Вам недоступна эта команда. Введите "help [name]" для ознакомления`, player);
        cmd.handler(player, cmdArgs, this);
    },
    helpCmdHandler(player, cmdArgs) {
        if (cmdArgs.length > 0) {
            if (parseInt(cmdArgs[0]) >= 0) {
                var level = parseInt(cmdArgs[0]);
                if (level > player.character.admin) return this.error(`Отказано в доступе`, player);
                var text = `${level} уровень администратора:<br/>`;
                var count = 0;
                for (var name in this.commands) {
                    var cmd = this.commands[name];
                    if (cmd.access != level) continue;
                    count++;
                    text += `<b>${name}</b> <i>${cmd.args}</i> - ${cmd.description}<br/>`;
                }
                text += `<br/>Всего команд: ${count} шт.<br/>Введите "help [name]" или "help [level]" для ознакомления с командой`;
                return this.log(text, player);
            }
            var cmdName = cmdArgs[0];
            var cmd = this.commands["/" + cmdName];
            if (!cmd) return this.error(`Команда "${cmdName}" не найдена`, player);
            var message = `${cmdName} ${cmd.args} - ${cmd.description}<br/>Мин. уровень: ${cmd.access}`;
            this.log(message, player);
        } else {
            var text = "";
            for (var name in this.commands) {
                var cmd = this.commands[name];
                if (cmd.access > player.character.admin) continue;
                text += `<b>${name}</b> ${cmd.args} (${cmd.access} lvl.) - ${cmd.description}<br/>`;
            }
            var keys = Object.keys(this.commands);
            text += `<br/>Всего команд: ${keys.length} шт.<br/>Введите "help [name]" или "help [level]" для ознакомления с командой`;
            this.log(text, player);
        }
    },
    isValidArg(type, arg) {
        if (type == "n") return !isNaN(arg) && arg.length > 0;
        if (type == "s") return arg && arg.length > 0;
        if (type == "b") return !isNaN(arg) && (arg == 0 || arg == 1);
        return false;
    },
    toValidArg(type, arg) {
        if (type == "n") return parseFloat(arg);
        if (type == "b") return arg == 1 ? true : false;
        return arg;
    },
    log(text, player) {
        this.push('log', text, player);
    },
    info(text, player) {
        this.push('info', text, player);
    },
    warning(text, player) {
        this.push('warning', text, player);
    },
    error(text, player) {
        this.push('error', text, player);
    },
    debug(text, player) {
        this.push('debug', text, player);
        if (!player) console.log(text);
    },
    push(type, text, player) {
        if (player) return player.call(`terminal.push`, [type, text]);

        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (this.haveAccess(rec)) rec.call(`terminal.push`, [type, text]);
        });
        if (type != "debug" && text) logger.log(`[${type}] ${text}`, `terminal`);
    },
};
