"use strict";

module.exports = {
    // Список одежды
    list: {
        // жен.
        "0": {
            "bracelets": [],
            "ears": [],
            "glasses": [],
            "hats": [],
            "pants": [],
            "shoes": [],
            "ties": [],
            "tops": [],
            "watches": [],
        },
        // муж.
        "1": {
            "bracelets": [],
            "ears": [],
            "glasses": [],
            "hats": [],
            "pants": [],
            "shoes": [],
            "ties": [],
            "tops": [],
            "watches": [],
        }
    },

    async init() {
        var bracelets = await db.Models.ClothesBracelet.findAll();
        bracelets.forEach(el => {
            this.list[el.sex]["bracelets"].push(el);
        });
        var ears = await db.Models.ClothesEar.findAll();
        ears.forEach(el => {
            this.list[el.sex]["ears"].push(el);
        });
        var glasses = await db.Models.ClothesGlasses.findAll();
        glasses.forEach(el => {
            this.list[el.sex]["glasses"].push(el);
        });
        var hats = await db.Models.ClothesHat.findAll();
        hats.forEach(el => {
            this.list[el.sex]["hats"].push(el);
        });
        var pants = await db.Models.ClothesPants.findAll();
        pants.forEach(el => {
            this.list[el.sex]["pants"].push(el);
        });
        var shoes = await db.Models.ClothesShoe.findAll();
        shoes.forEach(el => {
            this.list[el.sex]["shoes"].push(el);
        });
        var ties = await db.Models.ClothesTie.findAll();
        ties.forEach(el => {
            this.list[el.sex]["ties"].push(el);
        });
        var tops = await db.Models.ClothesTop.findAll();
        tops.forEach(el => {
            this.list[el.sex]["tops"].push(el);
        });
        var watches = await db.Models.ClothesWatch.findAll();
        watches.forEach(el => {
            this.list[el.sex]["watches"].push(el);
        });

        var count = bracelets.length + ears.length + glasses.length + hats.length + pants.length + shoes.length + ties.length + tops.length + watches.length;
        console.log(`[CLOTHES] Одежда загружена (${count} шт.)`);
    },
    getTypes() {
        return Object.keys(this.list[0]);
    },
    getClothes(type, id) {
        var el = this.list[1][type].find(x => x.id == id);
        if (!el) el = this.list[0][type].find(x => x.id == id);
        return el;
    },
    getClientList() {
        var clientList = {};
        for (var sex in this.list) {
            clientList[sex] = {};
            for (var type in this.list[sex]) {
                clientList[sex][type] = [];
                var list = this.list[sex][type];
                if (!list.length) continue;
                var keys = Object.keys(list[0].dataValues);
                list.forEach(el => {
                    var obj = {};
                    keys.forEach(key => {
                        obj[key] = el[key];
                    });
                    clientList[sex][type].push(obj);
                });
            }
        }

        return clientList;
    },
    updateClientList() {
        mp.players.forEach((current) => {
            current.hasValidClothesData = false;
        });
    }
};
