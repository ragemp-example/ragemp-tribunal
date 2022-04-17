"use strict";

module.exports = {
    success(player, text, header) {
        if (typeof player == 'number') return this.save(player, 'success', text, header);
        player.call("notifications.push.success", [text, header]);
    },
    warning(player, text, header) {
        if (typeof player == 'number') return this.save(player, 'warning', text, header);
        player.call("notifications.push.warning", [text, header]);
    },
    error(player, text, header) {
        if (typeof player == 'number') return this.save(player, 'error', text, header);
        player.call("notifications.push.error", [text, header]);
    },
    info(player, text, header) {
        if (typeof player == 'number') return this.save(player, 'info', text, header);
        player.call("notifications.push.info", [text, header]);
    },
    async save(characterId, type, text, header = null) {
        var oldNotification = await db.Models.Notification.findOne({
            attributes: ['id'],
            where: {
                characterId: characterId,
                text: text
            }
        });
        if (oldNotification) return;
        db.Models.Notification.create({
            characterId: characterId,
            type: type,
            text: text,
            header: header
        });
    },
    async popSavedNotifs(player) {
        var list = await db.Models.Notification.findAll({
            where: {
                characterId: player.character.id
            },
            limit: 7,
        });
        list.forEach(el => el.destroy());
        return list;
    },
};
