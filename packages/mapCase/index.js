"use strict";
let chat = call('chat');
var factions = require('../factions');
var notifs = call('notifications');
var vehicles = call('vehicles');

var out = {
    error(player, text) {
        player.call(`mapCase.message.red.show`, [text]);
    },
    success(player, text) {
        player.call(`mapCase.message.green.show`, [text]);
    }
};

module.exports = {
    // Вызовы в планшете ПД
    policeCalls: [],
    // Вызовы в планшете ФИБ
    // fibCalls: [],
    // Вызовы в планшете ЕМС
    hospitalCalls: [],
    // Объявления (в очереди) в планшете Ньюс
    newsAds: [],
    // Объявления (готовые в эфир) в планшете Ньюс
    newsAdsEdited: [],
    // Свободный ID новой новости
    adId: 1,

    convertCharactersToResultData(characters) {
        var result = [];
        for (var i = 0; i < characters.length; i++) {
            var character = characters[i];
            var number = (character.Phone) ? character.Phone.number : "-";
            var housePos = null;
            if (character.House) {
                var h = character.House;
                housePos = new mp.Vector3(h.pickupX, h.pickupY, h.pickupZ);
            }
            result.push({
                id: character.id,
                name: character.name,
                phone: number,
                housePos: housePos
            });
        }
        return result;
    },
    convertCharactersToProfileData(character, vehs) {
        var number = (character.Phone) ? character.Phone.number : null;
        var housePos = null,
            houseId = 0;
        if (character.House) {
            var h = character.House;
            housePos = new mp.Vector3(h.pickupX, h.pickupY, h.pickupZ);
            houseId = h.id;
        }
        var vehNames = [];
        for (var i = 0; i < vehs.length; i++) {
            var vehName = vehicles.getVehiclePropertiesByModel(vehs[i].modelName).name;
            vehNames.push(`${vehName} (${vehs[i].plate})`);
        }
        var faction = "-";
        if (character.Faction) faction = character.Faction.name;
        var rank = "-";
        if (character.FactionRank) rank = character.FactionRank.name;
        return {
            id: character.id,
            name: character.name,
            phone: number,
            housePos: housePos,
            danger: character.wanted,
            cause: character.wantedCause || "-",
            gender: character.gender,
            houseId: houseId,
            // faction: faction,
            // rank: rank,
            veh: vehNames.join(", ").trim() || "-",
            law: character.law,
            crimes: character.crimes,
            fines: character.Fines.length,
        };
    },
    convertWanted(wanted) {
        var result = [];
        for (var i = 0; i < wanted.length; i++) {
            var rec = wanted[i];
            result.push({
                id: rec.character.id,
                name: rec.name,
                description: rec.character.wantedCause,
                danger: rec.character.wanted
            });
        }
        return result;
    },
    convertMembers(members) {
        var result = [];
        for (var i = 0; i < members.length; i++) {
            var rec = members[i];
            var rank = factions.getRankById(rec.character.factionId, rec.character.factionRank);
            // const lastOnline = await db.Models.Account.findOne({ where: { id: rec.character.accountId } }).lastDate;
            result.push({
                id: rec.character.id,
                num: rec.id,
                name: rec.name,
                rank: rank.rank,
                // lastOnline: lastOnline
            });
        }
        return result;
    },
    async convertDBMembers(members) {
        const convertedMembers = [];

        for (let i = 0; i < members.length; i++) {
            let m = members[i];
            const rank = factions.getRankById(m.factionId, m.factionRank);
            const lastOnline = await db.Models.Account.findOne({
                where: { id: m.accountId }
            });

            const player = mp.players.toArray().find(p => (p.character && p.character.id === m.id));

            convertedMembers.push({
                id: m.id,
                num: i + 1,
                name: m.name,
                rank: rank.rank,
                lastOnline: player ? null : lastOnline.lastDate
            });
        }

        return convertedMembers;
    },
    addPoliceCall(player, description) {
        this.removePoliceCall(player.character.id);
        var call = {
            id: player.character.id,
            num: player.id,
            name: player.name,
            description: description,
            pos: {
                x: player.position.x,
                y: player.position.y,
            }
        };
        this.policeCalls.push(call);
        notifs.success(player, `Вызов отправлен`, `Police`);
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            var type = null;
            if (factions.isPoliceFaction(rec.character.factionId)) type = "pd";
            if (factions.isFibFaction(rec.character.factionId)) type = "fib";
            if (!type) return;


            notifs.info(rec, `Поступил вызов от ${call.name}`, `Планшет ${type.toUpperCase()}`);
            rec.call(`mapCase.${type}.calls.add`, [call])
        });
    },
    removePoliceCall(id) {
        var deleted = false;
        for (var i = 0; i < this.policeCalls.length; i++) {
            if (this.policeCalls[i].id == id) {
                this.policeCalls.splice(i, 1);
                i--;
                deleted = true;
            }
        }
        if (!deleted) return false;
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            var type = null;
            if (factions.isPoliceFaction(rec.character.factionId)) type = "pd";
            if (factions.isFibFaction(rec.character.factionId)) type = "fib";
            if (!type) return;

            rec.call(`mapCase.${type}.calls.remove`, [id])
        });
        return true;
    },
    acceptPoliceCall(id) {
        return this.removePoliceCall(id);
    },
    addPoliceWanted(player) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isPoliceFaction(rec.character.factionId)) return;
            rec.call(`mapCase.pd.wanted.add`, [{
                id: player.character.id,
                num: player.id,
                name: player.name,
                description: player.character.wantedCause || "-",
                danger: player.character.wanted
            }]);
        });
    },
    removePoliceWanted(id) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isPoliceFaction(rec.character.factionId)) return;
            rec.call(`mapCase.pd.wanted.remove`, [id]);
        });
    },
    addGoverMember(player) {
        if (!factions.isGovernmentFaction(player.character.factionId)) return;
        mp.players.forEach(async (rec) => {
            if (!rec.character) return;
            if (!factions.isGovernmentFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            const convertedMember = await this.convertDBMembers([player.character]);
            rec.call(`mapCase.gover.members.add`, [convertedMember]);
        });
    },
    removeGoverMember(player) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isGovernmentFaction(rec.character.factionId)) return;

            rec.call(`mapCase.gover.members.remove`, [player.character.id]);
        });
    },
    addPoliceMember(player) {
        if (!factions.isPoliceFaction(player.character.factionId)) return;
        mp.players.forEach(async (rec) => {
            if (!rec.character) return;
            if (!factions.isPoliceFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            const convertedMember = await this.convertDBMembers([player.character]);
            rec.call(`mapCase.pd.members.add`, [convertedMember]);
        });
    },
    removePoliceMember(player) {
        if (!factions.isPoliceFaction(player.character.factionId)) return;
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isPoliceFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            rec.call(`mapCase.pd.members.remove`, [player.character.id]);
        });
    },
    addArmyMember(player) {
        if (!factions.isArmyFaction(player.character.factionId)) return;
        mp.players.forEach(async (rec) => {
            if (!rec.character) return;
            if (!factions.isArmyFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            const convertedMember = await this.convertDBMembers([player.character]);
            rec.call(`mapCase.army.members.add`, [convertedMember]);
        });
    },
    removeArmyMember(player) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isArmyFaction(rec.character.factionId)) return;

            rec.call(`mapCase.army.members.remove`, [player.character.id]);
        });
    },
    addCrmMember(player) {
        if (!factions.isCrimeFaction(player.character.factionId)) return;
        mp.players.forEach(async (rec) => {
            if (!rec.character) return;
            if (!factions.isCrimeFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            const convertedMember = await this.convertDBMembers([player.character]);
            rec.call(`mapCase.crm.members.add`, [convertedMember]);
        });
    },
    removeCrmMember(player) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isCrimeFaction(rec.character.factionId)) return;

            rec.call(`mapCase.crm.members.remove`, [player.character.id]);
        });
    },
    // addFibCall(player, description) {
    //     this.removeFibCall(player.character.id);
    //     var call = {
    //         id: player.character.id,
    //         name: player.name,
    //         description: description
    //     };
    //     this.fibCalls.push(call);
    //     notifs.success(player, `Вызов отправлен`, `FIB`);
    //     mp.players.forEach((rec) => {
    //         if (!rec.character) return;
    //         if (!factions.isFibFaction(rec.character.factionId)) return;
    //
    //         notifs.info(rec, `Поступил вызов от ${call.name}`, `Планшет FIB`);
    //         rec.call(`mapCase.fib.calls.add`, [call])
    //     });
    // },
    // removeFibCall(id) {
    //     var deleted = false;
    //     for (var i = 0; i < this.fibCalls.length; i++) {
    //         if (this.fibCalls[i].id == id) {
    //             this.fibCalls.splice(i, 1);
    //             i--;
    //             deleted = true;
    //         }
    //     }
    //     if (!deleted) return false;
    //     mp.players.forEach((rec) => {
    //         if (!rec.character) return;
    //         if (!factions.isFibFaction(rec.character.factionId)) return;
    //
    //         rec.call(`mapCase.fib.calls.remove`, [id])
    //     });
    //     return true;
    // },
    // acceptFibCall(id) {
    //     return this.removeFibCall(id);
    // },
    addFibWanted(player) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isFibFaction(rec.character.factionId)) return;
            rec.call(`mapCase.fib.wanted.add`, [{
                id: player.character.id,
                name: player.name,
                description: player.character.wantedCause || "-",
                danger: player.character.wanted
            }]);
        });
    },
    removeFibWanted(id) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isFibFaction(rec.character.factionId)) return;
            rec.call(`mapCase.fib.wanted.remove`, [id]);
        });
    },
    addFibMember(player) {
        if (!factions.isFibFaction(player.character.factionId)) return;
        mp.players.forEach(async (rec) => {
            if (!rec.character) return;
            if (!factions.isFibFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            const convertedMember = await this.convertDBMembers([player.character]);
            rec.call(`mapCase.fib.members.add`, [convertedMember]);
        });
    },
    removeFibMember(player) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isFibFaction(rec.character.factionId)) return;

            rec.call(`mapCase.fib.members.remove`, [player.character.id]);
        });
    },
    addHospitalCall(player, description) {
        this.removeHospitalCall(player.character.id);
        var call = {
            id: player.character.id,
            num: player.id,
            name: player.name,
            description: description,
            pos: {
                x: player.position.x,
                y: player.position.y,
            }
        };
        this.hospitalCalls.push(call);
        notifs.success(player, `Вызов отправлен`, `Hospital`);
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isHospitalFaction(rec.character.factionId)) return;

            notifs.info(rec, `Поступил вызов от ${call.name}`, `Планшет EMS`);
            rec.call(`mapCase.ems.calls.add`, [call])
        });
    },
    removeHospitalCall(id) {
        var deleted = false;
        for (var i = 0; i < this.hospitalCalls.length; i++) {
            if (this.hospitalCalls[i].id == id) {
                this.hospitalCalls.splice(i, 1);
                i--;
                deleted = true;
            }
        }
        if (!deleted) return false;
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isHospitalFaction(rec.character.factionId)) return;

            rec.call(`mapCase.ems.calls.remove`, [id])
        });
        return true;
    },
    acceptHospitalCall(id) {
        return this.removeHospitalCall(id);
    },
    addHospitalMember(player) {
        if (!factions.isHospitalFaction(player.character.factionId)) return;
        mp.players.forEach(async (rec) => {
            if (!rec.character) return;
            if (!factions.isHospitalFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            const convertedMember = await this.convertDBMembers([player.character]);
            rec.call(`mapCase.ems.members.add`, [convertedMember]);
        });
    },
    removeHospitalMember(player) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isHospitalFaction(rec.character.factionId)) return;

            rec.call(`mapCase.ems.members.remove`, [player.character.id]);
        });
    },
    addNewsAd(player, text, price) {
        // this.removeNewsAd(player.character.id);
        var ad = {
            id: this.adId,
            playerId: player.id,
            author: player.name,
            number: player.phone.number,
            text: text,
            price: price,
        };
        this.adId++;
        this.newsAds.push(ad);
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isNewsFaction(rec.character.factionId)) return;

            notifs.info(rec, `Поступило объявление от ${ad.author}`, `Планшет Weazel News`);
            rec.call(`mapCase.news.ads.count.set`, [this.newsAds.length]);
        });
    },
    removeNewsAd(id) {
        var deleted = false;
        for (var i = 0; i < this.newsAds.length; i++) {
            if (this.newsAds[i].playerId == id) {
                this.newsAds.splice(i, 1);
                i--;
                deleted = true;
            }
        }
        if (!deleted) return false;
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isNewsFaction(rec.character.factionId)) return;

            rec.call(`mapCase.news.ads.count.set`, [this.newsAds.length])
        });
        return true;
    },
    haveNewsAd(player) {
        return this.newsAds.findIndex(x => x.author == player.name) != -1 ||
            this.newsAdsEdited.findIndex(x => x.author == player.name) != -1;
    },
    getNewsAd(player) {
        if (!this.newsAds.length) {
            player.call(`mapCase.news.ads.count.set`, [0])
            return out.error(player, `Список объявлений пуст`);
        }

        var ad = this.newsAds.shift();
        player.call(`mapCase.news.ads.show`, [ad]);
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isNewsFaction(rec.character.factionId)) return;

            rec.call(`mapCase.news.ads.count.set`, [this.newsAds.length])
        });
    },
    acceptAd(player, ad) {
        ad.editorName = player.name;
        this.newsAdsEdited.push(ad);
        // debug(`Объявления в очереди: `)
        // debug(this.newsAds);
        // debug(`Готовые объявления: `)
        // debug(this.newsAdsEdited);
        var rec = mp.players.at(ad.playerId);
        var header = factions.getFaction(7).name;
        if (rec && rec.character) notifs.success(rec, `${player.name} принял ваше объявление`, header);
        mp.players.forEach(rec => {
            if (!rec.character) return;
            if (rec.character.factionId != player.character.factionId) return;

            notifs.info(rec, `${player.name} принял объявление от ${ad.author}`, header);
        });
    },
    cancelAd(player, ad) {
        var rec = mp.players.at(ad.playerId);
        var header = factions.getFaction(7).name;
        if (rec && rec.character) notifs.info(rec, `${player.name} отменил ваше объявление. Причина: ${ad.text}`, header);
    },
    publicAd() {
        if (!this.newsAdsEdited.length) return;
        var ad = this.newsAdsEdited.shift();
        mp.players.forEach(rec => {
            if (!rec.character) return;
            rec.call('chat.message.push', [`!{#5ea9ff}${ad.text} (т. ${ad.number})`]);
            rec.call('chat.message.push', [`!{#4597f5}Отправитель: ${ad.author} | Редактор: ${ad.editorName}`]);
        });
    },
    addNewsMember(player) {
        if (!factions.isNewsFaction(player.character.factionId)) return;
        mp.players.forEach(async (rec) => {
            if (!rec.character) return;
            if (!factions.isNewsFaction(rec.character.factionId)) return;
            if (rec.character.factionId != player.character.factionId) return;

            const convertedMember = await this.convertDBMembers([player.character]);
            rec.call(`mapCase.news.members.add`, [convertedMember]);
        });
    },
    removeNewsMember(player) {
        mp.players.forEach((rec) => {
            if (!rec.character) return;
            if (!factions.isNewsFaction(rec.character.factionId)) return;

            rec.call(`mapCase.news.members.remove`, [player.character.id]);
        });
    },
};
