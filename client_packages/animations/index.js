"use strict";

mp.animations = {
    animatorActive: false,
    animId: 0,
    animationTimers: {},
    isOwnPlayingAnimId: null, // анимация из меню на L
    animationData: require('animations/data.js'),

    playAnimation(player, a, time = null) {
        var localId = mp.players.local.remoteId;
        mp.timer.remove(this.animationTimers[player.remoteId]);
        var oldAnim = player.anim;
        delete player.anim;
        if (player.isJumping() || player.isShooting() || player.isSwimming() || player.isFalling()) return;
        // player.clearTasksImmediately();
        if (oldAnim) {
            if (localId == player.remoteId) player.stopAnimTask(oldAnim.dict, oldAnim.name, 3);
            else player.clearTasksImmediately();
        }
        if (!a) return;
        mp.utils.requestAnimDict(a.dict, () => {
            player.taskPlayAnim(a.dict, a.name, a.speed, 0, -1, a.flag, 0, false, false, false);
            player.anim = a;
        });
        if (!time) return;
        var id = player.remoteId;
        mp.timer.remove(this.animationTimers[id]);
        this.animationTimers[id] = mp.timer.add(() => {
            var rec = mp.players.atRemoteId(id);
            if (rec && rec.anim) {
                if (localId == rec.remoteId) rec.stopAnimTask(rec.anim.dict, rec.anim.name, 3);
                else rec.clearTasksImmediately();
            }
            delete this.animationTimers[id];
            delete rec.anim;
        }, time);
    },
    animator() {
        this.animatorActive = !this.animatorActive;
        if (this.animatorActive) {
            mp.keys.bind(37, false, () => { //left
                this.animId--;
                if (this.animId < 0) this.animId = 0;
                mp.events.callRemote("animations.playById", this.animId);
            });

            mp.keys.bind(39, false, () => { //right
                this.animId++;
                mp.events.callRemote("animations.playById", this.animId);
            });

            mp.keys.bind(38, false, () => { //up
                this.animId -= 100;
                if (this.animId < 0) this.animId = 0;
                mp.events.callRemote("animations.playById", this.animId);
            });

            mp.keys.bind(40, false, () => { //down
                this.animId += 100;
                mp.events.callRemote("animations.playById", this.animId);
            });

            mp.events.callRemote("animations.playById", this.animId);
        } else {
            mp.keys.unbind(37, false);
            mp.keys.unbind(39, false);
            mp.keys.unbind(38, false);
            mp.keys.unbind(40, false);

            mp.events.callRemote("animations.stop");
        }
    },
    render() {
        if (!this.animatorActive) return;

        mp.game.graphics.drawText(`~y~left, right ~w~- листать анимации`, [0.8, 0.36], {
            font: 4,
            color: [12, 144, 12, 230],
            scale: [0.6, 0.6],
            outline: true
        });
        mp.game.graphics.drawText(`~y~ up, down ~w~- листать на 100 анимаций`, [0.8, 0.4], {
            font: 4,
            color: [12, 144, 12, 230],
            scale: [0.6, 0.6],
            outline: true
        });
        mp.game.graphics.drawText(`ID: ~b~ ${this.animId}`, [0.8, 0.44], {
            font: 4,
            color: [12, 144, 12, 230],
            scale: [0.6, 0.6],
            outline: true
        });
        mp.game.graphics.drawText(`~y~ /animator ~w~- выход`, [0.8, 0.48], {
            font: 4,
            color: [12, 144, 12, 230],
            scale: [0.6, 0.6],
            outline: true
        });
    },
    stopAnimHandler() {
        if (this.isOwnPlayingAnimId == null) return;
        var a = this.animationData[this.isOwnPlayingAnimId];
        this.isOwnPlayingAnimId = null;
        if (!mp.players.local.isPlayingAnim(a.split(' ')[0], a.split(' ')[1], 3)) return;
        mp.events.callRemote(`animations.stop`);
        mp.prompt.hide();
    },
};

mp.events.add({
    "characterInit.done": () => {
        mp.keys.bind(32, true, () => { // SPACE
            if (mp.game.ui.isPauseMenuActive()) return;
            if (mp.busy.includes()) return;
            mp.animations.stopAnimHandler();
        });
    },
    "animations.animator": () => {
        mp.animations.animator();
    },
    "animations.play": (playerId, a, time = null) => {
        var player = mp.players.atRemoteId(playerId);
        if (!player) return;
        mp.animations.playAnimation(player, a, time);
    },
    "animations.setOwnPlayingAnimId": (animId) => {
        mp.animations.isOwnPlayingAnimId = animId;
    },
    "render": () => {
        mp.animations.render();
    },
    "entityStreamIn": (player) => {
        if (player.type != "player") return;
        var a = player.getVariable("anim");
        if (!a) return;

        mp.animations.playAnimation(player, a);
    },
    "police.cuffs.set": (enable) => {
        if (!enable || !mp.players.local.getVariable("anim")) return;
        mp.animations.playAnimation(mp.players.local, null);
    },
    "playerEnterVehicle": () => {
        // чтобы игрока не скручивало по-всякому когда садится на мотик во время проигрывания анимации
        var player = mp.players.local;
        if (player.anim) {
            mp.animations.playAnimation(player, null);
            mp.events.callRemote("animations.stop");
        }
    },
    // "time.main.tick": () => {
    //     mp.players.forEachInStreamRange(rec => {
    //         if (!mp.players.exists(rec)) return;
    //         var a = rec.getVariable("anim");
    //         if (!a) return;
    //
    //         if (rec.isPlayingAnim(a.dict, a.name, 3)) return;
    //         mp.utils.requestAnimDict(a.dict, () => {
    //             rec.taskPlayAnim(a.dict, a.name, a.speed, 0, -1, a.flag, 0, false, false, false);
    //         });
    //     });
    // },
});

mp.events.addDataHandler("anim", (player, a) => {
    if (player.type != "player") return;

    mp.animations.playAnimation(player, a);
});
