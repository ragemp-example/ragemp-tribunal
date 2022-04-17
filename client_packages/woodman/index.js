"use strict";

mp.woodman = {
    treeHealthBar: {
        width: 0.1,
        height: 0.015,
        border: 0.0005,
        textColor: [255, 255, 255, 255],
        textScale: [0.2, 0.2],
        getProgressColor() {
            var player = mp.players.local;
            return (player.isInMeleeCombat()) ? [255, 0, 0, 100] : [0, 0, 0, 100];
        },
        getFillColor(health) {
            return [54, 184, 255, 70];
        },
    },
    logHealthBar: {
        width: 0.05,
        height: 0.012,
        border: 0.0004,
        textColor: [255, 255, 255, 200],
        textScale: [0.17, 0.17],
        getProgressColor() {
            return [0, 0, 0, 50];
        },
        getFillColor(health) {
            return [33, 177, 255, 50];
        },
    },
    treeHealth: 0,
    treePos: null,
    logSquats: [],
    logObj: null,
    logFocusSlotI: -1,
    lastStartMelee: 0,
    hitWaitTime: 500,
    // Высота и ширина бревна
    logSize: {
        height: 0.3,
        width: 4.4,
    },
    logTimer: null,


    drawTreeHealthBar(x, y) {
        var info = this.treeHealthBar;
        var color = info.getProgressColor();
        var border = info.border;
        var fillColor = info.getFillColor(this.treeHealth);
        var textColor = info.textColor;
        var textScale = info.textScale;
        mp.game.graphics.drawRect(x, y, info.width + border * 2, info.height + border * 5, color[0], color[1], color[2], color[3]);
        mp.game.graphics.drawRect(x - (100 - this.treeHealth) * 0.0005, y,
            info.width * this.treeHealth / 100, info.height,
            fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
        mp.game.graphics.drawText(`${this.treeHealth}%`, [x, y - 0.04 * textScale[0]], {
            font: 0,
            color: textColor,
            scale: textScale,
            outline: false
        });
    },
    drawLogHealthBar(x, y, index) {
        var info = this.logHealthBar;
        var health = this.logSquats[index];
        var color = info.getProgressColor();
        var border = info.border;
        var fillColor = info.getFillColor(health);
        var textColor = info.textColor;
        var textScale = info.textScale;
        if (this.logFocusSlotI == index) {
            color[3] = fillColor[3] = 200;
        }
        mp.game.graphics.drawRect(x, y, info.width + border * 2, info.height + border * 5, color[0], color[1], color[2], color[3]);
        mp.game.graphics.drawRect(x - (100 - health) * 0.00025, y,
            info.width * health / 100, info.height,
            fillColor[0], fillColor[1], fillColor[2], fillColor[3]);
        mp.game.graphics.drawText(`${health}%`, [x, y - 0.045 * textScale[0]], {
            font: 0,
            color: textColor,
            scale: textScale,
            outline: false
        });
    },
    isAxInHands(player) {
        if (!player) player = mp.players.local;
        return player.weapon == mp.game.joaat('weapon_hatchet') || player.weapon == mp.game.joaat('weapon_stone_hatchet');
    },
    isFocusTree() {
        if (!this.treePos) return false;
        var player = mp.players.local;
        var positions = [
            player.position,
            player.getOffsetFromInWorldCoords(-1, 0, 0),
            player.getOffsetFromInWorldCoords(1, 0, 0),
            player.getOffsetFromInWorldCoords(0, 0, 1),
            player.getOffsetFromInWorldCoords(0, 0, -1),
        ];
        var treeEntity = null;
        for (var i = 0; i < positions.length; i++) {
            var raycastToTree = mp.raycasting.testPointToPoint(positions[i], this.treePos);
            // mp.game.graphics.drawLine(positions[i].x, positions[i].y, positions[i].z, this.treePos.x, this.treePos.y, this.treePos.z, 255, 255, 255, 100);
            if (raycastToTree && raycastToTree.entity) {
                treeEntity = raycastToTree.entity;
                break;
            }
        }
        if (!treeEntity) return false;
        // var frontHash = mp.utils.getFrontObjectHash(player);
        // if (!frontHash || frontHash != raycastToTree.entity) return false;
        var frontPos = player.getOffsetFromInWorldCoords(0, 1, this.treePos.z - player.position.z);

        return mp.vdist(player.position, this.treePos) > mp.vdist(frontPos, this.treePos);
    },
    setInside(data) {
        if (!data) return mp.callCEFV(`selectMenu.show = false`);

        mp.callCEFV(`selectMenu.menus['woodmanItems'].init(${JSON.stringify(data)})`);
        mp.callCEFV(`selectMenu.showByName('woodmanItems')`);
    },
    setSellInside(data) {
        if (!data) return mp.callCEFV(`selectMenu.show = false`);

        mp.callCEFV(`selectMenu.menus['woodmanSell'].init(${JSON.stringify(data)})`);
        mp.callCEFV(`selectMenu.showByName('woodmanSell')`);
    },
    setTreeInside(pos, health) {
        if (pos) {
            if (this.isAxInHands()) mp.prompt.showByName('woodman_start_ax');
            else mp.prompt.showByName('woodman_take_ax');

            this.treePos = pos;
            this.treeHealth = health;
        } else {
            mp.prompt.hide();

            this.treePos = null;
            this.treeHealth = 0;
        }
    },
    getFreeTreeSlot() {
        var player = mp.players.local;
        var leftPos = player.getOffsetFromInWorldCoords(2, -this.logSize.width / 2, 3);
        var rightPos = player.getOffsetFromInWorldCoords(2, this.logSize.width / 2, 3);

        var leftGroundZ = mp.game.gameplay.getGroundZFor3dCoord(leftPos.x, leftPos.y, leftPos.z, false, false);
        var rightGroundZ = mp.game.gameplay.getGroundZFor3dCoord(rightPos.x, rightPos.y, rightPos.z, false, false);

        var leftDist = mp.vdist(leftPos, new mp.Vector3(leftPos.x, leftPos.y, leftGroundZ));
        var rightDist = mp.vdist(rightPos, new mp.Vector3(rightPos.x, rightPos.y, rightGroundZ));

        var alpha = -Math.sin((leftDist - rightDist) / this.logSize.width) * 180 / Math.PI;

        var objPos = player.getOffsetFromInWorldCoords(2, 0, 3);
        objPos.z = mp.game.gameplay.getGroundZFor3dCoord(objPos.x, objPos.y, objPos.z, false, false) + this.logSize.height / 2;

        return {
            pos: objPos,
            rot: new mp.Vector3(0, alpha, player.getHeading() + 90),
        };
    },
    setLogInside(squats, objId) {
        if (squats) {
            if (this.isAxInHands()) mp.prompt.showByName('woodman_log_start_ax');
            else mp.prompt.showByName('woodman_log_take_ax');

            this.logSquats = squats;
            this.logObj = mp.objects.atRemoteId(objId);
        } else {
            mp.prompt.hide();

            this.logSquats = [];
            this.logObj = null;
        }
    },
    getLogSlots(obj) {
        var slots = [
            obj.getOffsetFromInWorldCoords(-2, 0, 0),
            obj.getOffsetFromInWorldCoords(-1, 0, 0),
            obj.getOffsetFromInWorldCoords(0, 0, 0),
            obj.getOffsetFromInWorldCoords(1, 0, 0),
            obj.getOffsetFromInWorldCoords(2, 0, 0),
        ];
        return slots;
    },
    hitLogHandler() {
        if (this.logFocusSlotI == -1 || !this.logObj || !mp.objects.exists(this.logObj) || this.logTimer != null) return;
        if (!this.isAxInHands()) return;
        if (!this.logSquats[this.logFocusSlotI]) return mp.notify.error(`Перейдите к другой части бревна`, `Лесоруб`);

        // TODO: set correct heading
        mp.busy.add("jobProcess", false);
        mp.events.callRemote(`animations.playById`, 5523);
        this.logTimer = mp.timer.add(() => {
            this.stopLogTimer();
            if (!mp.objects.exists(this.logObj) || !this.logObj || this.logFocusSlotI == -1 || !this.logSquats[this.logFocusSlotI]) {
                return;
            }
            mp.events.callRemote(`woodman.logs.hit`, this.logFocusSlotI);
        }, 2000);
    },
    stopLogTimer() {
        mp.timer.remove(this.logTimer);
        this.logTimer = null;
        mp.busy.remove("jobProcess");
        mp.events.callRemote(`animations.stop`);
    },
    createJobPeds() {
        [{
            model: "s_m_m_gardener_01",
            position: {
                x: -567.0806274414062,
                y: 5274.73291015625,
                z: 70.23765563964844
            },
            heading: 166.43630981445312,
        },
        {
            model: "s_m_m_gentransport",
            position: {
                x: -19.935161590576172,
                y: -2640.25341796875,
                z: 6.032257080078125
            },
            heading: 277.59271240234375,
        },
        ].forEach(x => mp.events.call('NPC.create', x));
    },
};

mp.events.add({
    "render": () => {
        var start = Date.now();
        var player = mp.players.local;
        if (!mp.woodman.isAxInHands(player)) return;
        if (mp.woodman.treePos) {
            var startPos = player.getOffsetFromInWorldCoords(0, 0, 0);
            var endPos = player.getOffsetFromInWorldCoords(0, 1, 0);
            // mp.game.graphics.drawLine(startPos.x, startPos.y, startPos.z, endPos.x, endPos.y, endPos.z, 255, 255, 255, 100);

            startPos = player.getOffsetFromInWorldCoords(0, 0, 0);
            endPos = player.getOffsetFromInWorldCoords(-0.3, 1, 0);
            // mp.game.graphics.drawLine(startPos.x, startPos.y, startPos.z, endPos.x, endPos.y, endPos.z, 255, 255, 255, 100);

            startPos = player.getOffsetFromInWorldCoords(0, 0, 0);
            endPos = player.getOffsetFromInWorldCoords(0.3, 1, 0);
            // mp.game.graphics.drawLine(startPos.x, startPos.y, startPos.z, endPos.x, endPos.y, endPos.z, 255, 255, 255, 100);

            if (mp.woodman.isFocusTree()) {
                var pos2d = mp.game.graphics.world3dToScreen2d(mp.woodman.treePos);
                if (pos2d) mp.woodman.drawTreeHealthBar(pos2d.x, pos2d.y);
            }
        } else {
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
            mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2
        }
        if (mp.objects.exists(mp.woodman.logObj) && mp.woodman.logObj) {
            var slots = mp.woodman.getLogSlots(mp.woodman.logObj);
            if (mp.woodman.logTimer == null) {
                var playerPos = player.getOffsetFromInWorldCoords(0, 0, -1);
                var nearSlot = mp.utils.getNearPos(playerPos, slots, mp.x);
                mp.woodman.logFocusSlotI = slots.indexOf(nearSlot);
                var frontPos = player.getOffsetFromInWorldCoords(0, 0.5, -1);
                if (mp.vdist(playerPos, nearSlot) < mp.vdist(frontPos, nearSlot)) mp.woodman.logFocusSlotI = -1;
            }
            for (var i = 0; i < slots.length; i++) {
                var slot = slots[i];
                var pos2d = mp.game.graphics.world3dToScreen2d(slot);
                if (pos2d) mp.woodman.drawLogHealthBar(pos2d.x, pos2d.y, i);
            }

            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
            mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2

        }
        if (mp.woodman.lastStartMelee && Date.now() > mp.woodman.lastStartMelee + mp.woodman.hitWaitTime) {
            mp.woodman.lastStartMelee = 0;

            if (mp.woodman.isAxInHands() && mp.woodman.treePos && mp.woodman.isFocusTree()) {
                mp.events.callRemote(`woodman.trees.hit`);
            }
        }

        if (mp.renderChecker) mp.utils.drawText2d(`woodman rend: ${Date.now() - start} ms`, [0.8, 0.69]);
    },
    "woodman.storage.inside": (data) => {
        mp.woodman.setInside(data);
    },
    "woodman.sell.inside": (data) => {
        mp.woodman.setSellInside(data);
    },
    "woodman.tree.inside": (pos, health) => {
        mp.woodman.setTreeInside(pos, health);
    },
    "woodman.tree.health": (health) => {
        mp.woodman.treeHealth = health;
    },
    "woodman.log.request": () => {
        var slot = mp.woodman.getFreeTreeSlot();
        mp.events.callRemote(`woodman.logs.add`, JSON.stringify(slot));
    },
    "woodman.log.inside": (squats, objId) => {
        mp.woodman.setLogInside(squats, objId);
    },
    "woodman.log.health": (objId, slotI, health) => {
        if (mp.woodman.logFocusSlotI == slotI) mp.woodman.stopLogTimer();
        if (!mp.objects.exists(mp.woodman.logObj) || !mp.woodman.logObj || mp.woodman.logObj.remoteId != objId) return;
        mp.woodman.logSquats[slotI] = health;
    },
    "woodman.items.request": () => {
        if (!mp.woodman.logObj) return
        var slots = mp.woodman.getLogSlots(mp.woodman.logObj);
        slots.forEach(slot => {
            slot.z -= mp.woodman.logSize.height / 2;
            slot.rZ = mp.woodman.logObj.rotation.z + 20;
        });
        mp.events.callRemote(`woodman.items.add`, JSON.stringify(slots));
    },
    "playerWeaponChanged": (weapon) => {
        if (mp.woodman.treePos) {
            if (mp.woodman.isAxInHands()) mp.prompt.showByName('woodman_start_ax');
            else mp.prompt.showByName('woodman_take_ax');
        } else if (mp.woodman.logObj) {
            if (mp.woodman.isAxInHands()) mp.prompt.showByName('woodman_log_start_ax');
            else mp.prompt.showByName('woodman_log_take_ax');
        }
    },
    "playerStartMeleeCombat": () => {
        if (!mp.woodman.isAxInHands()) return;
        if (!mp.woodman.treePos) return;
        if (!mp.woodman.isFocusTree()) return;
        if (mp.woodman.treeHealth <= 0) return mp.notify.error(`Дерево исчерпало свой ресурс`);

        mp.woodman.lastStartMelee = Date.now();
    },
    "click": (x, y, upOrDown, leftOrRight, relativeX, relativeY, worldPosition, hitEntity) => {
        if (upOrDown != 'down' || leftOrRight != 'left') return;

        if (mp.game.ui.isPauseMenuActive()) return;
        if (mp.busy.includes()) return;
        mp.woodman.hitLogHandler();
    },
});

mp.woodman.createJobPeds();
