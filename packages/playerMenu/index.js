"use strict";

let bizes = call('bizes');
let donate = call('donate');
let factions = call('factions');
let jobs = call('jobs');
let houses = call('houses');

module.exports = {
    init(player) {
        var biz = bizes.getBizByCharId(player.character.id);
        var house = houses.getHouseByCharId(player.character.id);
        var factionName = factions.getFactionName(player);
        var rankName = factions.getRankName(player);
        var jobName = jobs.getJobName(player);

        var data = {
            playerName: player.name,
            admin: player.character.admin,
            factionId: player.character.factionId,
            factionName: factionName,
            factionRank: rankName,
            jobName: jobName,
            minutes: player.character.minutes,
            gender: player.character.gender,
            cash: player.character.cash,
            wanted: player.character.wanted,
            //fines: player.character.Fines.length,
            fines: 0,
            law: player.character.law,
            crimes: player.character.crimes,
            narcotism: player.character.narcotism,
            nicotine: player.character.nicotine,
            donate: player.account.donate,
            convertCash: donate.convertCash,
            nicknamePrice: donate.nicknamePrice,
            clearWarnPrice: donate.clearWarnPrice,
            slotPrice: donate.slotPrice,
            warns: player.character.warnNumber,
            slots: player.account.slots,
            slotsMax: donate.slotsMax,
            promocode: player.character.Promocode.promocode,
            invited: player.character.Promocode.invited,
            completed: player.character.Promocode.completed,
            media: player.character.Promocode.media,
            settings: player.character.settings.dataValues,
            email: player.account.email,
            confirmEmail: player.account.confirmEmail,
            passwordDate: player.account.passwordDate.getTime(),
            chips: player.character.casinoChips
        };
        if (biz) {
            data.biz = {
                id: biz.info.id,
                pos: bizes.getBizPosition(biz.info.id),
                type: bizes.getTypeName(biz.info.type),
                name: biz.info.name,
                price: biz.info.price,
            };
        }
        if (house) {
            var garage = house.info.Interior.Garage;
            data.house = {
                id: house.info.id,
                pos: house.enter.marker.position,
                class: house.info.Interior.class,
                //rooms: house.info.Interior.numRooms,
                //carPlaces: (garage) ? garage.carPlaces : 0,
                //price: house.info.price,
            };
        }
        player.call(`playerMenu.init`, [data]);
    },
    setFaction(player) {
        var data = {
            factionId: player.character.factionId,
            factionName: factions.getFactionName(player),
            factionRank: factions.getRankName(player),
        };
        player.call(`playerMenu.setFaction`, [data]);
    },
    setFactionRank(player) {
        var data = {
            factionRank: factions.getRankName(player),
        };
        player.call(`playerMenu.setFactionRank`, [data]);
    },
    setJob(player) {
        var data = {
            jobName: jobs.getJobName(player),
        };
        player.call(`playerMenu.setJob`, [data]);
    },
    setBiz(player) {
        var biz = bizes.getBizByCharId(player.character.id);

        var data = {};
        if (biz) {
            data.biz = {
                id: biz.info.id,
                pos: bizes.getBizPosition(biz.info.id),
                type: bizes.getTypeName(biz.info.type),
                name: biz.info.name,
                price: biz.info.price,
            };
        }
        player.call(`playerMenu.setBiz`, [data]);
    },
    setHouse(player) {
        var house = houses.getHouseByCharId(player.character.id);

        var data = {};
        if (house) {
            var garage = house.info.Interior.Garage;
            data.house = {
                id: house.info.id,
                pos: house.enter.marker.position,
                class: house.info.Interior.class,
                rooms: house.info.Interior.numRooms,
                carPlaces: (garage) ? garage.carPlaces : 0,
                price: house.info.price,
            };
        }
        player.call(`playerMenu.setHouse`, [data]);
    },
    setSkills(player) {
        var data = {
            skills: player.character.jobSkills.map(x => {
                return {
                    jobId: x.jobId,
                    name: jobs.getJob(x.jobId).name,
                    exp: x.exp,
                };
            }),
        };
        player.call(`playerMenu.setSkills`, [data]);
    },
    setSkill(player, skill) {
        var data = {
            skill: {
                jobId: skill.jobId,
                exp: skill.exp,
            },
        };
        player.call(`playerMenu.setSkill`, [data]);
    },
    setDonate(player) {
        var data = {
            donate: player.account.donate,
        };
        player.call(`playerMenu.setDonate`, [data]);
    },
    setWarns(player) {
        var data = {
            warns: player.character.warnNumber,
        };
        player.call(`playerMenu.setWarns`, [data]);
    },
    setSlots(player) {
        var data = {
            slots: player.account.slots,
        };
        player.call(`playerMenu.setSlots`, [data]);
    },
    setInvited(player) {
        var data = {
            invited: player.character.Promocode.invited,
        };
        player.call(`playerMenu.setInvited`, [data]);
    },
    setCompleted(player) {
        var data = {
            completed: player.character.Promocode.completed,
        };
        player.call(`playerMenu.setCompleted`, [data]);
    },
    setMedia(player) {
        var data = {
            media: player.character.Promocode.media,
        };
        player.call(`playerMenu.setMedia`, [data]);
    },
    setPasswordDate(player) {
        var data = {
            passwordDate: player.account.passwordDate.getTime(),
        };
        player.call(`playerMenu.setPasswordDate`, [data]);
    },
    setPromocode(player) {
        var data = {
            promocode: player.character.Promocode.promocode,
        };
        player.call(`playerMenu.setPromocode`, [data]);
    },
    setEmail(player) {
        var data = {
            email: player.account.email,
            confirmEmail: player.account.confirmEmail,
        };
        player.call(`playerMenu.setEmail`, [data]);
    },
    setName(player) {
        var data = {
            name: player.name
        };
        player.call(`playerMenu.setName`, [data]);
    },
    setAdmin(player) {
        var data = {
            admin: player.character.admin
        };
        player.call(`playerMenu.setAdmin`, [data]);
    },
    setLaw(player) {
        var data = {
            law: player.character.law
        };
        player.call(`playerMenu.setLaw`, [data]);
    },
    setNarcotism(player) {
        var data = {
            narcotism: player.character.narcotism
        };
        player.call(`playerMenu.setNarcotism`, [data]);
    },
    setNicotine(player) {
        var data = {
            nicotine: player.character.nicotine
        };
        player.call(`playerMenu.setNicotine`, [data]);
    },
    setNumber(player) {
        var phone = player.phone;

        var data = {
            number: "-",
        };
        if (phone) data.number = phone.number

        player.call(`playerMenu.setNumber`, [data]);
    },
    setSpouse(player) {
        var spouse = player.spouse;

        var data = {
            spouse: null
        };
        if (spouse) {
            data.spouse = {
                name: spouse.character.name,
                gender: spouse.character.gender
            };
        }

        player.call(`playerMenu.setSpouse`, [data]);
    },
    setFines(player) {
        var data = {
            fines: player.character.Fines.length
        };

        player.call(`playerMenu.setFines`, [data]);
    }
};
