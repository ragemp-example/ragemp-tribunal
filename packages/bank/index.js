"use strict";

let bizService;
let houseService;

let banks = [];
module.exports = {
    async init() {
        bizService = call('bizes');
        houseService = call('houses');

        let infoBanks = await db.Models.Bank.findAll();
        for (let i = 0; i < infoBanks.length; i++) {
            this.addBank(infoBanks[i]);
        }
    },
    getBankById(id) {
        return banks.find(x => x.info.id === id);
    },
    getInfo(player) {
        if (player == null || player.character == null) return;
        let bankInfo = {
            name: player.character.name,
            cash: player.character.cash,
            money: player.character.bank,
            phoneMoney: player.phone ? player.phone.money : null,
            number: `${player.character.id}`,
            biz: [],
            houses: []
        };
        let biz = bizService.getBizByCharId(player.character.id);
        if (biz != null) {
            bankInfo.biz.push(bizService.getBizInfoForBank(biz));
        }
        let house = houseService.getHouseByCharId(player.character.id);
        if (house != null) {
            bankInfo.houses.push(houseService.getHouseInfoForBank(house));
        }
        return bankInfo;
    },
    async createBank(player) {
        let position = player.position;
        let bankInfo = await db.Models.Bank.create({
            x: position.x,
            y: position.y,
            z: position.z - 1
        }, {});
        await this.addBank(bankInfo);
        console.log("[BANK] Добавлен новый банк");
    },
    async deleteBank(player) {
        let bankIndex = banks.findIndex(x => {
            return player.dist(new mp.Vector3(x.info.x, x.info.y, x.info.z)) <= 10;
        });
        if (bankIndex == -1) {
            return false;
        }
        else {
            banks[bankIndex].marker.destroy();
            banks[bankIndex].colshape.destroy();
            banks[bankIndex].blip.destroy();
            await banks[bankIndex].info.destroy();
            banks.splice(bankIndex, 1);
            return true;
        }
    },
    addBank(bankInfo) {
        let colshape = mp.colshapes.newSphere(bankInfo.x, bankInfo.y, bankInfo.z, 2.0);
        colshape.isBank = true;
        let marker = mp.markers.new(1, new mp.Vector3(bankInfo.x, bankInfo.y, bankInfo.z), 0.5, {
            rotation: new mp.Vector3(0, 0, 0),
            dimension: 0,
            color: [120, 205, 120, 128],
        });
        let blip = mp.blips.new(207, new mp.Vector3(bankInfo.x, bankInfo.y, bankInfo.z), {
            name: "Банк",
            shortRange: true,
            dimension: 0,
            color: 69
        });
        banks.push({
            marker: marker,
            blip: blip,
            colshape: colshape,
            info: bankInfo
        });
    },
    updateBank(player) {
        let info = this.getInfo(player);
        if (info == null) return;
        player.call('bank.update', [info]);
    }
};