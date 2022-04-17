"use strict";

let phoneNumbers = [];
let utils;
let houseServise;
let bizService;

module.exports = {
    async init() {
        utils = call('utils');
        houseServise = call('houses');
        bizService = call("bizes");

        console.log("[PHONE] load numbers from DB...");
        let phoneNumbersTemp = await db.Models.Phone.findAll({
            attributes: ['number'],
            raw: true
        });
        for (let i = 0; i < phoneNumbersTemp.length; i++) {
            phoneNumbers.push(phoneNumbersTemp[i].number);
        }
        console.log("[PHONE] loaded.");
    },
    generateNumber() {
        if (!utils) return null;
        let newNumber = utils.randomInteger(1000000, 9999999);
        while (phoneNumbers.includes(newNumber + "")) {
            newNumber++;
            if (newNumber > 9999999) newNumber = 1000000;
        }
        phoneNumbers.push(newNumber + "");
        return newNumber + "";
    },
    loadPhoneOnClient(player) {
        let jsonPhone;
        if (player.phone != null) jsonPhone = player.phone.toJSON();

        let houses = [];
        if (!houseServise.isEmpty) {
            let house = houseServise.getHouseByCharId(player.character.id);
            houses = house != null ? [houseServise.getHouseInfoForApp(house)] : [];
        }

        let bizes = [];
        if (!bizService.isEmpty) {
            let biz = bizService.getBizByCharId(player.character.id);
            if (biz != null) {
                let bizInfo = bizService.getBizInfoForApp(biz);
                bizes = bizInfo != null ? [bizInfo] : [];
            }
        }

        let apps = [];
        if (player.character.job === 2) {
            apps.push("taxi");
        }

        player.call('phone.load', [{
                name: player.character.name,
                isHave: player.phone != null,
                number: player.phone != null && player.phone.number,
                money: player.phone != null && player.phone.money,
                houses: houses,
                biz: bizes,
                contacts: player.phone != null ? (player.phone.PhoneContacts != null ? jsonPhone['PhoneContacts'] : []) : [],
                callStory: player.phone != null ? (player.phone.PhoneCallStories != null ? jsonPhone['PhoneCallStories'] : []) : [],
            },
            player.phone != null ? (player.phone.PhoneDialogs != null ? jsonPhone['PhoneDialogs'] : []) : [],
            apps
        ]);
    },
    isExists(number) {
        return phoneNumbers.includes(number);
    },
    findPlayerByPhoneNumber(number) {
        let target = null;
        mp.players.forEach(player => {
            if (player.phone == null) return;
            if (player.phone.number !== number) return;
            target = player;
        });
        return target;
    },
    async changeNumber(player, newNumber) {
        if (player.phone == null) return false;
        if (newNumber.length == 0) return false;
        if (player.phone.number == newNumber) return false;
        if (phoneNumbers.includes(newNumber)) return false;

        let numberIndex = phoneNumbers.findIndex( x => x == player.phone.number);
        if (numberIndex != -1) {
            phoneNumbers[numberIndex] = newNumber;
        }
        else {
            phoneNumbers.push(newNumber);
        }
        for (let myContactCopyIndex = player.phone.PhoneContacts.findIndex(x => x.number == newNumber);
            myContactCopyIndex != -1;
            myContactCopyIndex = player.phone.PhoneContacts.findIndex(x => x.number == newNumber)) {
                await player.phone.PhoneContacts[myContactCopyIndex].destroy();
                player.phone.PhoneContacts.splice(myContactCopyIndex, 1);
        }
        let oldNumber = player.phone.number;
        player.phone.number = newNumber;
        await player.phone.save();
        player.call("phone.contact.mine.update", [oldNumber, newNumber]);
        mp.events.call("player.phone.number.changed", player);
        return true;
    },
    addApp(player, appName, info) {
        player.call('phone.app.add', [appName, info]);
    },
    // type 0 - пропущенный, 1 - исходящий, 2 - входящий
    async addCall(player, number, type) {
        if (player.phone == null) return;

        let call = await db.Models.PhoneCallStory.create({
            phoneId: player.phone.id,
            number: number,
            type: type,
            date: new Date(),
        });

        if (player.phone.PhoneCallStories == null) {
            player.phone.PhoneCallStories = [];
        }
        player.phone.PhoneCallStories.push(call);

        player.call('phone.call.story.add', [call.number, call.type, call.date]);
    }
};
