"use strict";
let admin = require("./index.js");
let commands = {};

module.exports = {
    "init": () => {
        /// Список всех команд на сервере
        admin.init();
        commands = admin.getCommands();

        inited(__dirname);
    },
    /// обработка админ команд
    "admin.command.handle": (player, command, args) => {
        if (command == "/ahelp") return mp.events.call('admin.command.help', player, args);
        let cmd = commands[command];
        if (!cmd) return;

        // TODO: проверка на access
        if (player.character.admin >= cmd.access) {
            if (cmd.args) {
                let requiredArgs;
                if (admin.isTerminalCommand(cmd.args)) {
                    requiredArgs = cmd.args.split(' ');
                } else {
                    requiredArgs = cmd.args.split('] ');
                }
                if (args.length < requiredArgs.length) {
                    return player.call('chat.message.push', [`!{#ffffff} Используйте: ${command} ${cmd.args}`]);
                }
                for (let i = 0; i < requiredArgs.length; i++) {
                    let argType = requiredArgs[i].split(":")[1];
                    if (!argType) continue;
                    if (!admin.isValidArg(argType, args[i])) return player.call('chat.message.push', [`Неверное значение "${args[i]}" для параметра ${requiredArgs[i]}`])
                    else args[i] = admin.toValidArg(argType, args[i]);
                }
            }

            cmd.handler(player, args, {
                log(text, player) {
                    let messages = text.split('<br/>');
                    if (player) {
                        messages.forEach((message) => {
                            if (!message) return;
                            player.call('chat.message.push', [`!{#e0b8ff} ${message}`])
                        });
                    } else {
                        messages.forEach((message) => {
                            if (!message) return;
                            mp.events.call('admin.notify.all', `!{#e0b8ff}[A] ${message}`);
                        });
                    }
                },
                info(text, player) {
                    let messages = text.split('<br/>');
                    if (player) {
                        messages.forEach((message) => {
                            if (!message) return;
                            player.call('chat.message.push', [`!{#59dbff} ${message}`])
                        });
                    } else {
                        messages.forEach((message) => {
                            if (!message) return;
                            mp.events.call('admin.notify.all', `!{#59dbff}[A] ${message}`);
                        });
                    }
                },
                warning(text, player) {
                    let messages = text.split('<br/>');
                    if (player) {
                        messages.forEach((message) => {
                            if (!message) return;
                            player.call('chat.message.push', [`!{#ffcc24} ${message}`])
                        });
                    } else {
                        messages.forEach((message) => {
                            if (!message) return;
                            mp.events.call('admin.notify.all', `!{#ffcc24}[A] ${message}`);
                        });
                    }
                },
                error(text, player) {
                    let messages = text.split('<br/>');
                    if (player) {
                        messages.forEach((message) => {
                            if (!message) return;
                            player.call('chat.message.push', [`!{#ff0000} ${message}`])
                        });
                    } else {
                        messages.forEach((message) => {
                            if (!message) return;
                            mp.events.call('admin.notify.all', `!{#ff0000}[A] ${message}`);
                        });
                    }
                },
                debug(text, player) {
                    let messages = text.split('<br/>');
                    if (player) {
                        messages.forEach((message) => {
                            if (!message) return;
                            player.call('chat.message.push', [`!{#ffffff} ${message}`])
                        });
                    } else {
                        messages.forEach((message) => {
                            if (!message) return;
                            mp.events.call('admin.notify.all', `!{#ffffff}[A] ${message}`);
                        });
                    }
                },
            });
        }
    },
    /// обработка команды ahelp
    "admin.command.help": (player, args) => {
        if (!args[0] || isNaN(parseInt(args[0]))) return player.call('chat.message.push', [`!{#ffffff} Используйте /ahelp [уровень администрирования]`]);

        if (args[0] < 1 || args[0] > player.character.admin) return player.call('chat.message.push', [`!{#ffffff} Нет доступа`]);

        player.call('chat.message.push', [`!{#c1f051}Команды ${args[0]} уровня администрирования:`]);
        for (let cmd in commands) {
            if (commands[cmd].access == args[0]) {
                player.call('chat.message.push', [`!{#ffffff} ${commands[cmd].description}: ${cmd} ${commands[cmd].args}`]);
            }
        }
    },
    /// Отправить сообщение всем админам
    "admin.notify.all": (message) => {
        mp.players.forEach((current) => {
            if (current.character) {
                if (current.character.admin > 0) {
                    try {
                        current.call('chat.message.push', [message]);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        });
    },
    "admin.notify.all.split": (message, fixed, color) => {
        mp.players.forEach((current) => {
            if (current.character) {
                if (current.character.admin > 0) {
                        current.call('chat.message.split', [message, fixed, color]);
                }
            }
        });
    },
    /// Отправить сообщение всем игрокам
    "admin.notify.players": (message) => {
        mp.players.forEach((current) => {
            if (!current.character) return;
            try {
                current.call('chat.message.push', [message]);
            } catch (err) {
                console.log(err);
            }
        });
    },
    "admin.notify.players.split": (message, fixed, color) => {
        mp.players.forEach((current) => {
            if (!current.character) return;
                current.call('chat.message.split', [message, fixed, color]);
        });
    },
    // Поступила жалоба от игрока
    "admin.report": (player, message) => {
        var media = player.character.Promocode.media;
        var color = (!media) ? "#ffe838" : "#ff3ec8";
        player.call('chat.message.split', [message, `!{#87c924}Ваш репорт:!{${color}} `]);
        mp.events.call('admin.notify.all.split', message, `!{#87c924}${player.name}[${player.id}]:!{${color}} `);
    },
    "characterInit.done": (player) => {
        let level = player.character.admin;
        if (level > 0) {
           player.call('admin.set', [level]);
        }
    },
}
