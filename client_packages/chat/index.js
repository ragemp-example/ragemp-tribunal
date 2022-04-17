"use strict";

mp.gui.chat.activate(false);
mp.gui.chat.show(false);
mp.chat = {
    clearMuteTime: 0,

    debug: (message) => { /// выводит в чат строку белым цветом (для дебага)
        mp.events.call('chat.message.push', `!{#ffffff} ${message}`);
    },
    correctName(name) {
        if (name == mp.players.local.name) return name;
        let player = mp.utils.getPlayerByName(name);
        if (player && !player.isFamiliar) return `Незнакомец`;
        return name;
    }
};


var chatOpacity = 1.0;
var isOpen = false;
const defaultSplitLimit = 95;

const TAGS_LIST = [{
        id: 0,
        name: "Сказать",
        color: "#ffffff"
    },
    {
        id: 1,
        name: "Крикнуть",
        color: "#ffdfa8"
    },
    {
        id: 2,
        name: "Рация",
        color: "#33cc66"
    },
    {
        id: 3,
        name: "НонРП",
        color: "#c6c695"
    },
    {
        id: 4,
        name: "Действие",
        color: "#dd90ff"
    },
    {
        id: 5,
        name: "Пояснение",
        color: "#82dbff"
    },
    {
        id: 6,
        name: "Попытка",
        color: "#ddff82"
    }
];

var availableTags = [];

function setDefaultTags() {
    TAGS_LIST.forEach((tag) => {
        if (tag.id != 2) {
            availableTags.push(tag);
        }
    })
}

mp.events.add('chat.load', () => {
    setDefaultTags();
    mp.callCEFR('setTagsChat', [availableTags]);
    mp.callCEFR('showChat', [true]);
    mp.callCEFR('setOpacityChat', [1.0]);
    mp.callCEFR('setTimeChat', [true]);

    mp.keys.bind(0x54, true, function() {
        if (mp.game.ui.isPauseMenuActive()) return;
        //if (mp.busy.includes()) return;
        if (!(mp.busy.includes() === 0 || (mp.busy.includes() === 1 && (mp.busy.includes('lostAttach') || mp.busy.includes('cuffs') || mp.busy.includes('jobProcess') || mp.busy.includes('timer'))))) return;
        mp.busy.add('chat', true);
        isOpen = true;
        mp.callCEFR('setFocusChat', [true]);
    });

    mp.keys.bind(0x76, true, function() {
        if (mp.game.ui.isPauseMenuActive()) return;
        if (mp.busy.includes()) return;

        if (isOpen) return;

        switch (chatOpacity) {
            case 1.0:
                chatOpacity = 0.5;
                break;
            case 0.5:
                chatOpacity = 0.0;
                break;
            case 0.0:
                chatOpacity = 1.0;
                break;
        }
        mp.callCEFR('setOpacityChat', [chatOpacity]);
    });
});

mp.events.add('chat.close', () => {
    mp.callCEFR('setFocusChat', [false]);
    isOpen = false;
    mp.busy.remove('chat');
});

mp.events.add('chat.opacity.set', (enable) => {
    mp.callCEFR('setOpacityChat', [enable]);
});

mp.events.add('chat.tags.add', (tagIDs) => {
    tagIDs.forEach((tagID) => {
        if (!isTagExisting(TAGS_LIST[tagID])) {
            availableTags.push(TAGS_LIST[tagID]);
        }
    });
    sortTagsById();
    mp.callCEFR('setTagsChat', [availableTags]);
});

mp.events.add('chat.tags.delete', (tagIDs) => {
    tagIDs.forEach((tagID) => {
        let i = availableTags.findIndex(x => x.id == tagID)
        if (i != -1) {
            availableTags.splice(i, 1);
        }
    });
    sortTagsById();
    mp.callCEFR('setTagsChat', [availableTags]);
});

function isTagExisting(tag) {
    for (let i = 0; i < availableTags.length; i++) {
        if (tag.id == availableTags[i].id) return true;
    }
    return false;
}

function sortTagsById() {
    availableTags.sort((a, b) => {
        return a.id - b.id;
    });
}

function playChatAnimation(id) {
    var player = mp.players.atRemoteId(id);
    if (!player || player.vehicle || player.getVariable("knocked")) return;
    if (!player.getHealth()) return;
    if (mp.factions.hasBox(player)) return;
    if (player.getVariable("cuffs")) return;
    if (player.getVariable("anim")) return;
    if (player.getVariable("hands")) return;

    mp.animations.playAnimation(player, {
        dict: "special_ped@baygor@monologue_3@monologue_3e",
        name: "trees_can_talk_4",
        speed: 1,
        flag: 49
    }, 3000);
}

mp.events.add('chat.message.get', (type, message) => {
    //mp.afk.action();
    if (message.length > 300) {
        message = message.slice(0, 300);
    }

    if (mp.chat.clearMuteTime && (message[0] != '/' || ["/s", "/r", "/f", "/n", "/me", "/do", "/gnews", "/d", "/try", "/m", "/b"].includes(message.split(' ')[0]))) {
        if (mp.chat.clearMuteTime < Date.now()) {
            mp.chat.clearMuteTime = 0;
            mp.notify.success(`Использование чатов снова доступно. Не нарушайте правила сервера.`, `MUTE`);
            mp.events.callRemote(`chat.mute.clear`);
            mp.events.call("hud.setData", {
                mute: false
            });
        } else {
            var mins = Math.ceil((mp.chat.clearMuteTime - Date.now()) / 1000 / 60);
            return mp.notify.error(`До разблокировки чата осталось ${mins} мин!`);
        }
    }
    mp.events.callRemote('chat.message.get', type, message);
});

mp.events.add('chat.action.say', (nickname, id, message) => {
    nickname = mp.chat.correctName(nickname);

    splitChatMessage(message, `!{#ffffff}${nickname}[${id}]: `)
    //playChatAnimation(id);
    if (mp.players.local.remoteId != id) mp.utils.addOverheadText(id, message);
});

mp.events.add('chat.action.shout', (nickname, id, message) => {
    nickname = mp.chat.correctName(nickname);

    if (typeof(message) != "string") message = message.join(' ');
    splitChatMessage(message, `!{#ffdfa8}${nickname}[${id}] кричит: `)
});

mp.events.add('chat.action.walkietalkie', (nickname, id, rank, message, isJobRadio = false) => {
    if (typeof(message) != "string") message = message.join(' ');
    splitChatMessage(message, `${isJobRadio ? '!{#40f5ec}' : '!{#33cc66}'}[F] ${rank} ${nickname}[${id}]: `)
});

mp.events.add('chat.action.nonrp', (nickname, id, message) => {
    nickname = mp.chat.correctName(nickname);

    if (typeof(message) != "string") message = message.join(' ');
    splitChatMessage(message, `!{#c6c695}[OOC] ${nickname}[${id}]: `);
});

mp.events.add('chat.action.me', (nickname, id, message) => {
    nickname = mp.chat.correctName(nickname);

    if (typeof(message) != "string") message = message.join(' ');
    if (mp.players.local.remoteId != id) mp.utils.addOverheadText(id, message, [221, 144, 255, 255]);
    message = `!{#dd90ff}${nickname}[${id}] ${message}`;
    splitChatMessage(message, null, '!{#dd90ff}');
});

mp.events.add('chat.action.do', (nickname, id, message) => {
    nickname = mp.chat.correctName(nickname);

    if (typeof(message) != "string") message = message.join(' ');
    message = `!{#dd90ff}${message} (${nickname}[${id}])`;
    splitChatMessage(message, null, '!{#dd90ff}');
});

mp.events.add('chat.action.try', (nickname, id, message, result) => {
    nickname = mp.chat.correctName(nickname);
    if (typeof(message) != "string") message = message.join(' ');
    mp.events.call('chat.message.push', `!{#dd90ff}${nickname}[${id}] ${message} ${result ? '!{#66cc00} [Удачно]' : '!{#ff6600} [Неудачно]'}`);
});

mp.events.add('chat.action.whisper', (nickname, id, message) => {
    nickname = mp.chat.correctName(nickname);

    if (typeof(message) != "string") message = message.join(' ');
    splitChatMessage(message, `!{#c2c2c2}${nickname}[${id}] шепнул Вам: `)
});

mp.events.add('chat.action.whisper.own', (nickname, id, message) => {
    nickname = mp.chat.correctName(nickname);

    if (typeof(message) != "string") message = message.join(' ');
    splitChatMessage(message, `!{#c2c2c2}Вы шепнули ${nickname}[${id}]: `)
});

mp.events.add('chat.message.push', (message) => {
    mp.callCEFR('pushChatMessage', [message]);
});

mp.events.add('chat.message.split', (message, fixed, color) => {
    splitChatMessage(message, fixed, color);
});

mp.events.add('chat.mute.set', (time) => {
    mp.chat.clearMuteTime = Date.now() + time;
    mp.events.call("hud.setData", {
        mute: time > 0
    });
});

function splitChatMessage(message, fixed, color) {
    if (!fixed) fixed = '';
    if (!color) color = '';
    mp.events.call('chat.message.push', `${color}${fixed}${message}`);
}
