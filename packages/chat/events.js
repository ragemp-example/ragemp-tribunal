"use strict";
var factions = require('../factions');
var chat = require('./index');
let news = call('news');
let admin = call('admin');
let notify = call('notifications');
let jobs = call('jobs');
let utils = call('utils');

module.exports = {

    "characterInit.done": (player) => { //characterInit.done
        player.call('chat.load');
        player.call('chat.message.push', ['!{#ff42f7} Добро пожаловать на Tribunal Roleplay!']);

        if (player.character.admin > 0) {
            mp.events.call('admin.notify.all', `!{#85c4ff}[A] Администратор ${player.character.admin} уровня ${player.name} авторизовался`);
        }
        if (player.character.muteTime) chat.setMute(player, player.character.muteTime);
    },

    "playerQuit": (player) => {
        if (!player.character || !player.mute) return;

        player.character.muteTime -= Date.now() - player.mute.startTime;
        player.character.save();
    },

    // "player.joined": (player) => {
    //     player.call('chat.load');
    //     player.call('chat.message.push', ['!{#00abff} Добро пожаловать на Tribunal Roleplay!']);
    // },

    "chat.tags.update": () => {
        /*
        TODO:
        Вызывать функцию при выборе персонажа/принятии/увольнении
        Сделать проверку на то, состоит ли человек в организации
        Если состоит, вызываем на клиенте addChatTags и передаем туда массив нужных тэгов
        Рация
        */
    },


    "chat.message.get": (player, type, message) => {

        if (message.length > 300) {
            message = message.slice(0, 300);
        };

        if (message[0] == '/') {

            let args = message.split(' ');
            let command = args[0];
            args.splice(0, 1);
            mp.events.call('chat.command.handle', player, command, args)

        } else {
            if (!/\S/.test(message)) return;

            if (message == ')') return mp.events.call('/me', player, 'улыбается');
            if (message == '))') return mp.events.call('/me', player, 'смеется');
            if (message == '(') return mp.events.call('/me', player, 'расстроился');
            if (message == '((') return mp.events.call('/me', player, 'сильно расстроился');

            switch (type) {
                case 0: {
                    mp.events.call('chat.action.say', player, message);
                    break;
                }
                case 1: {
                    mp.events.call('/s', player, message);
                    break;
                }
                case 2: {
                    mp.events.call('/r', player, message);
                    break;
                }
                case 3: {
                    mp.events.call('/n', player, message);
                    break;
                }
                case 4: {
                    mp.events.call('/me', player, message);
                    break;
                }
                case 5: {
                    mp.events.call('/do', player, message);
                    break;
                }
                case 6: {
                    mp.events.call('/try', player, message);
                    break;
                }
            }
        }
    },

    "chat.command.handle": (player, command, args) => {
        switch (command) {
            case '/s':
            case '/f':
            case '/n':
            case '/b':
            case '/me':
            case '/do':
            case '/try':
            case '/gnews':
            case '/d':
            case '/m':
            case '/dice':
            case '/w':
            case '/fb':
            case '/pay':
            case '/giverank':
                if (!/\S/.test(args.join(' '))) return;
                if (command == '/b') command = '/n';
                mp.events.call(command, player, args);
                break;
            case '/tp':
                mp.events.call('/tp', player);
                break;
            default:
                if (!player.character.admin) return;
                mp.events.call('admin.command.handle', player, command, args);
                break;
        }
    },

    "chat.action.say": (player, message) => {
        //var playerInStream = news.isInStream(player);

        mp.players.forEachInRange(player.position, 10, (currentPlayer) => {
            if (currentPlayer.dimension == player.dimension) {
                // Тот, кто участвует в эфире Weazel News, не слышит себя в чате
                //if (playerInStream && currentPlayer.id == player.id) return;

                currentPlayer.call('chat.action.say', [player.name, player.id, message]);

                if (currentPlayer.spy) { // если на игроке установлена прослушка
                    var fibAgent = mp.players.at(currentPlayer.spy.playerId);
                    if (!fibAgent) return delete currentPlayer.spy;
                    if (!fibAgent.character) return delete currentPlayer.spy;
                    if (fibAgent.character.id != currentPlayer.spy.characterId) return delete currentPlayer.spy;

                    var dist = parseInt(fibAgent.dist(currentPlayer.position));
                    if (dist > 100) {
                        fibAgent.call('chat.action.say', [player.name, player.id, `* сигнал потерян *`]);
                        return delete currentPlayer.spy;
                    }
                    var text = (dist > 50) ? `* пшшшшшшш пшшшш пшшшш *` : `${message} (${dist} м.)`;
                    fibAgent.call('chat.action.say', [player.name, player.id, text]);
                }
            };
        });
    },

    "chat.mute.clear": (player) => {
        if (player.mute && Date.now() - player.mute.startTime > player.mute.time) {
            delete player.mute;
            player.character.muteTime = 0;
            player.character.save();
        }
    },

    "/s": (player, message) => {
        //var playerInStream = news.isInStream(player);

        mp.players.forEachInRange(player.position, 20, (currentPlayer) => {
            if (currentPlayer.dimension == player.dimension) {
                // Тот, кто участвует в эфире Weazel News, не слышит себя в чате
                //if (playerInStream && currentPlayer.id == player.id) return;

                currentPlayer.call('chat.action.shout', [player.name, player.id, message]);

                if (currentPlayer.spy) { // если на игроке установлена прослушка
                    var fibAgent = mp.players.at(currentPlayer.spy.playerId);
                    if (!fibAgent) return delete currentPlayer.spy;
                    if (!fibAgent.character) return delete currentPlayer.spy;
                    if (fibAgent.character.id != currentPlayer.spy.characterId) return delete currentPlayer.spy;

                    var dist = parseInt(player.dist(currentPlayer.position));
                    if (dist > 100) {
                        fibAgent.call('chat.action.shout', [player.name, player.id, `* сигнал потерян *`]);
                        return delete currentPlayer.spy;
                    }
                    var text = (dist > 50) ? `* пшшшшшшш пшшшш пшшшш *` : `${message} (${dist} м.)`;
                    fibAgent.call('chat.action.shout', [player.name, player.id, text]);
                }
            };
        });
    },

    "/f": (player, message) => {
        if (!player.character) return;
        if (player.character.job) {
            jobs.sayRadio(player, message.join(' '));
        } else {
            factions.sayRadio(player, message.join(' '));
        }
    },

    "/fb": (player, message) => {
        if (!player.character) return;
        if (player.character.job) {
            jobs.sayRadio(player, message.join(' '), true);
        } else {
            factions.sayRadio(player, message.join(' '), true);
        }
    },

    "/n": (player, message) => {
        mp.players.forEachInRange(player.position, 10, (currentPlayer) => {
            if (currentPlayer.dimension == player.dimension) {
                currentPlayer.call('chat.action.nonrp', [player.name, player.id, message]);
            };
        });
    },

    "/me": (player, message) => {
        mp.players.forEachInRange(player.position, 10, (currentPlayer) => {
            if (currentPlayer.dimension == player.dimension) {
                currentPlayer.call('chat.action.me', [player.name, player.id, message]);
            };
        });
    },
    "/do": (player, message) => {
        mp.players.forEachInRange(player.position, 10, (currentPlayer) => {
            if (currentPlayer.dimension == player.dimension) {
                currentPlayer.call('chat.action.do', [player.name, player.id, message]);
            };
        });
    },

    "/gnews": (player, message) => {
        if (!player.character) return;
        if (!factions.isStateFaction(player.character.factionId)) return;

        let faction = factions.getFaction(player.character.factionId);
        let rank = factions.getRankById(faction, player.character.factionRank).rank;
        if (rank < faction.gnewsRank) return notify.error(player, `Гос. новости доступны с ${faction.gnewsRank} ранга`);

        mp.players.forEach((currentPlayer) => {
            if (!currentPlayer.character) return;

            let tag;

            switch (player.character.factionId) {
                case 1:
                    tag = 'GOV';
                    break;
                case 2:
                    tag = 'LSPD';
                    break;
                case 3:
                    tag = 'LSCSD';
                    break;
                case 4:
                    tag = 'FIB';
                    break;
                case 5:
                    tag = 'EMS';
                    break;
                case 6:
                    tag = 'ARMY';
                    break;
                case 7:
                    tag = 'WN';
                    break;
                case 15:
                    tag = 'MWS';
                    break;
                default:
                    tag = 'NONE';
            }

            currentPlayer.call('chat.message.split', [message.join(' '), `!{#306bff}[Гос. новости] ${player.character.name}[${player.id}]: [${tag}] `]);
        });
    },

    "/d": (player, message) => {
        if (!player.character) return;
        if (!factions.isStateFaction(player.character.factionId)) return;

        let rank = factions.getRankById(player.character.factionId, player.character.factionRank).name;
        mp.players.forEach((currentPlayer) => {
            if (!currentPlayer.character) return;
            if (!factions.isStateFaction(currentPlayer.character.factionId)) return;
            currentPlayer.call('chat.message.split', [message.join(' '), `!{#59b3cf}[D] ${rank} ${player.character.name}[${player.id}]: `]);
        });
    },

    "/try": (player, message) => {

        let result = false;
        if (Math.random() > 0.5) result = true;

        mp.players.forEachInRange(player.position, 10, (currentPlayer) => {
            if (currentPlayer.dimension == player.dimension) {
                currentPlayer.call('chat.action.try', [player.name, player.id, message, result]);
            };
        });
    },

    "/tp": (player) => {
        let data = admin.getMassTeleportData();
        if (!data || !data.position) return notify.error(player, 'Массовый телепорт отключен');
        if (player.character.arrestTime) return notify.error(player, 'Вы в тюрьме');

        player.returnPosition = player.position;
        player.returnDimension = player.dimension;
        utils.setPlayerPosition(player, data.position);
        //player.position = data.position;
        player.dimension = data.dimension;
        notify.success(player, 'Вы были телепортированы');
    },

    "/dice": (player, args) => {
        if (!player.character) return;
        if (!args || args.length < 2) return notify.warning(player, `Используйте /dice [id] [сумма]`)
        let targetId = parseInt(args[0]);
        let amount = parseInt(args[1]);
        if (isNaN(targetId) || isNaN(amount) || amount <= 0) return notify.warning(player, `Некорректные данные`);
        let data = {
            targetId: args[0],
            amount: amount
        }
        mp.events.call('casino.dice.offer.send', player, data);
    },

    "/m": (player, message) => {
        if (!player.character) return;
        let factionId = player.character.factionId;
        if (!factions.isPoliceFaction(factionId) &&
            !factions.isFibFaction(factionId) && !factions.isArmyFaction(factionId)) return;
        if (!player.vehicle ||
            !(player.vehicle.key == 'faction' && player.vehicle.owner == factionId)) return notify.error(player, 'Вы не в служебном транспорте');
        mp.players.forEachInRange(player.position, 15, (currentPlayer) => {
            if (!currentPlayer.character) return;
            currentPlayer.call('chat.message.split', [message.join(' '), `!{#ffcd45}[Мегафон] ${player.character.name}[${player.id}]: `]);
        });
    },

    "/w": (player, args) => {
        let target = mp.players.at(args[0]);
        if (!target) return notify.error(player, 'Игрок не найден');
        if (utils.vdistSqr(player.position, target.position) > 5) return notify.error(player, 'Игрок далеко');
        if (player === target) return notify.error(player, 'Нельзя шептать себе');

        args.splice(0, 1);
        player.call('chat.action.whisper.own', [target.name, target.id, args]);
        target.call('chat.action.whisper', [player.name, player.id, args]);
    },

    "/pay": (player, args) => {
        mp.events.call('interaction.money.give', player, args[0], args[1]);
    },

    "/giverank": (player, args) => {
        if (!player.character.factionId) return;
        mp.events.call('factions.giverank.set', player, JSON.stringify([args[0], args[1]]));
    },
}
