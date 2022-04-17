"use strict";
let documents = require("./index.js");
let factions = call("factions");

module.exports = {
    "init": () => {
        documents.init();
        inited(__dirname);
    },
    "documents.offer": (player, type, targetId, data) => {
        if (type == 'governmentBadge') {
            let allowedFactionIds = [1, 2, 3, 4, 6];
            if (!allowedFactionIds.includes(player.character.factionId)) {
                return player.call('notifications.push.error', ['Вы не сотрудник PD/FIB/GOV/ARMY', 'Документы']);
            }
        }

        if (player.id == targetId) return mp.events.call("documents.show", player.id, type, targetId, data); /// Если показывает себе, то не кидаем оффер

        player.call('notifications.push.info', ['Вы предложили игроку посмотреть документы', 'Документы']);

        let target = mp.players.at(targetId);
        if (!target) return;
        target.documentsOffer = {
            playerId: player.id,
            docType: type,
            docData: data
        };

        player.senderDocumentsOffer = {
            targetPlayer: target
        };

        let docName;
        switch (type) {
            case 'governmentBadge':
                docName = 'удостоверение';
                break;
            case 'mainDocuments':
                docName = 'документы';
                break;
        }
        target.call('offerDialog.show', ["documents", {
            name: player.character.name,
            doc: docName
        }]);
    },
    "documents.offer.accept": (player, accept) => {
        let targetId = player.id;
        let offer = player.documentsOffer;
        let sender = mp.players.at(offer.playerId);
        if (!sender) return;
        if (sender.senderDocumentsOffer.targetPlayer != player) return;

        if (accept) {
            mp.events.call('documents.show', offer.playerId, offer.docType, targetId, offer.docData);
            delete player.documentsOffer;
            delete sender.senderDocumentsOffer;
        } else {
            delete player.documentsOffer;
            delete sender.senderDocumentsOffer;
        }
    },
    "documents.show": (playerId, type, targetId, data) => {
        let target = mp.players.at(targetId);
        let player = mp.players.at(playerId);
        if (data) {
            data = JSON.parse(data);
        }
        if (!target) return;
        switch (type) {
            case 'governmentBadge':
                mp.events.call('documents.governmentBadge.show', player, targetId);
                break;
            case 'mainDocuments':
                mp.events.call('documents.mainDocuments.show', player, targetId);
                break;
        }
    },
    "documents.characterPass.show": (player, targetId) => {
        let target = mp.players.at(targetId);
        if (!target) return;
        let data = {
            name: player.character.name,
            sex: player.character.gender,
            number: documents.getPassIdentificator() + player.character.id,
            regDate: player.character.creationDate,
            spouse: player.spouse ? player.spouse.character.name : null
        }
        if (!data) return;
        if (player.id == target.id) {
            mp.events.call('/me', player, `смотрит свой паспорт`);
        } else {
            mp.events.call('/me', player, `показал${player.character.gender ? 'а' : ''} свой паспорт`);
        }
        target.call('documents.show', ['characterPass', data]);
    },
    "documents.mainDocuments.show": (player, targetId) => {
        let target = mp.players.at(targetId);
        if (!target) return;
        let name = player.character.name.split(' ');
        let sex = player.character.gender ? 'F' : 'M';
        let data = {
            name: player.character.name,
            idCard: {
                name: name[0],
                surname: name[1],
                issued: player.character.creationDate,
                sex: sex,
                cardNum: documents.getPassIdentificator() + player.character.id
            },
        }

        if (player.character.medCardDate) {
            data.medCard = {
                memberName: player.character.name,
                memberId: documents.getMedCardIdentificator() + player.character.id,
                expires: player.character.medCardDate
            }
        }

        if (player.character.gunLicenseDate || player.character.carLicense || player.character.passengerLicense
            || player.character.bikeLicense || player.character.truckLicense || player.character.airLicense
            || player.character.boatLicense) {
            data.licensesCard = {
                id: documents.getLicIdentificator() + player.character.id,
                sex: sex,
                gunLic: !!player.character.gunLicenseDate,
                carLicense: player.character.carLicense,
                passengerLicense: player.character.passengerLicense,
                bikeLicense: player.character.bikeLicense,
                truckLicense: player.character.truckLicense,
                airLicense: player.character.airLicense,
                boatLicense: player.character.boatLicense
            }
        }
        if (player.id == target.id) {
            mp.events.call('/me', player, `смотрит свои документы`);
        } else {
            mp.events.call('/me', player, `показал${player.character.gender ? 'а' : ''} свои документы`);
        }
        target.call('documents.show', ['mainDocuments', data]);
    },
    "documents.governmentBadge.show": (player, targetId) => {
        let target = mp.players.at(targetId);
        if (!target) return;

        let faction;
        switch (player.character.factionId) {
            case 1:
                faction = 'gover';
                break;
            case 2:
                faction = 'lspd';
                break;
            case 3:
                faction = 'sheriff';
                break;
            case 4:
                faction = 'fib';
                break;
            case 6:
                faction = 'army';
                break;
            default:
                faction = 'army';
                break;
        }
        let data = {
            faction: faction,
            name: player.character.name,
            sex: player.character.gender ? 'F' : 'M',
            director: documents.fibLeaderSign,
            rank: factions.getRankName(player) || 'Нет'
        }
        if (!data) return;
        if (player.id == target.id) {
            mp.events.call('/me', player, `смотрит свое удостоверение`);
        } else {
            mp.events.call('/me', player, `показал${player.character.gender ? 'а' : ''} свое удостоверение`);
        }
        target.call('documents.show', ['governmentBadge', data]);
    },
}