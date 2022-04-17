"use strict";

mp.playerMenu = {
    init(data) {
        if (data.house) data.house.street = mp.utils.getStreetName(data.house.pos);
        if (data.biz) data.biz.street = mp.utils.getStreetName(data.biz.pos);
        mp.callCEFV(`playerMenu.init(${JSON.stringify(data)})`);
    },
    setFaction(data) {
        mp.callCEFV(`playerMenu.setFaction(${JSON.stringify(data)})`);
    },
    setFactionRank(data) {
        mp.callCEFV(`playerMenu.setFactionRank(${JSON.stringify(data)})`);
    },
    setJob(data) {
        mp.callCEFV(`playerMenu.setJob(${JSON.stringify(data)})`);
    },
    setWanted(wanted) {
        mp.callCEFV(`playerMenu.setWanted(${wanted})`);
    },
    setFines(fines) {
        mp.callCEFV(`playerMenu.setFines(${fines})`);
    },
    setBiz(biz = null) {
        if (biz) biz.street = mp.utils.getStreetName(biz.pos);
        mp.callCEFV(`playerMenu.setBiz(${JSON.stringify(biz)})`);
    },
    setHouse(house = null) {
        if (house) house.street = mp.utils.getStreetName(house.pos);
        mp.callCEFV(`playerMenu.setHouse(${JSON.stringify(house)})`);
    },
    setSkills(skills) {
        mp.callCEFV(`playerMenu.setSkills(${JSON.stringify(skills)})`);
    },
    setSkill(skill) {
        mp.callCEFV(`playerMenu.setSkill(${JSON.stringify(skill)})`);
    },
    setCash(cash) {
        mp.callCEFV(`playerMenu.setCash(${cash})`);
    },
    setDonate(donate) {
        mp.callCEFV(`playerMenu.setDonate(${donate})`);
    },
    setWarns(warns) {
        mp.callCEFV(`playerMenu.setWarns(${warns})`);
    },
    setSlots(slots) {
        mp.callCEFV(`playerMenu.setSlots(${slots})`);
    },
    setPromocode(code) {
        mp.callCEFV(`playerMenu.setPromocode(\`${code}\`)`);
    },
    setInvited(invited) {
        mp.callCEFV(`playerMenu.setInvited(${invited})`);
    },
    setCompleted(completed) {
        mp.callCEFV(`playerMenu.setCompleted(${completed})`);
    },
    setMedia(media) {
        mp.callCEFV(`playerMenu.setMedia(${media})`);
    },
    setPasswordDate(time) {
        mp.callCEFV(`playerMenu.setPasswordDate(${time})`);
    },
    setEmail(email, confirm = 0) {
        mp.callCEFV(`playerMenu.setEmail(\`${email}\`, ${confirm})`);
    },
    setName(name) {
        mp.callCEFV(`playerMenu.setName(\`${name}\`)`);
    },
    setAdmin(admin) {
        mp.callCEFV(`playerMenu.setAdmin(${admin})`);
    },
    setLaw(law) {
        mp.callCEFV(`playerMenu.setLaw(${law})`);
    },
    setNarcotism(narcotism) {
        mp.callCEFV(`playerMenu.setNarcotism(${narcotism})`);
    },
    setNicotine(nicotine) {
        mp.callCEFV(`playerMenu.setNicotine(${nicotine})`);
    },
    setNumber(number) {
        mp.callCEFV(`playerMenu.setNumber(${number})`);
    },
    setSpouse(spouse) {
        mp.callCEFV(`playerMenu.setSpouse(${JSON.stringify(spouse)})`);
    },
    setFamiliar(count) {
        mp.callCEFV(`playerMenu.setFamiliar(${count})`);
    },
    setChips(count) {
        mp.callCEFV(`playerMenu.setChips(${count})`);
    },
};

mp.events.add({
    "playerMenu.init": (data) => {
        mp.playerMenu.init(data);
    },
    "playerMenu.setFaction": (data) => {
        mp.playerMenu.setFaction(data);
    },
    "playerMenu.setFactionRank": (data) => {
        mp.playerMenu.setFactionRank(data);
    },
    "playerMenu.setJob": (data) => {
        mp.playerMenu.setJob(data);
    },
    "playerMenu.setBiz": (data) => {
        mp.playerMenu.setBiz(data.biz);
    },
    "playerMenu.setHouse": (data) => {
        mp.playerMenu.setHouse(data.house);
    },
    "playerMenu.setSkills": (data) => {
        mp.playerMenu.setSkills(data.skills);
    },
    "playerMenu.setSkill": (data) => {
        mp.playerMenu.setSkill(data.skill);
    },
    "playerMenu.setDonate": (data) => {
        mp.playerMenu.setDonate(data.donate);
    },
    "playerMenu.setWarns": (data) => {
        mp.playerMenu.setWarns(data.warns);
    },
    "playerMenu.setSlots": (data) => {
        mp.playerMenu.setSlots(data.slots);
    },
    "playerMenu.setPromocode": (data) => {
        mp.playerMenu.setPromocode(data.promocode);
    },
    "playerMenu.setInvited": (data) => {
        mp.playerMenu.setInvited(data.invited);
    },
    "playerMenu.setCompleted": (data) => {
        mp.playerMenu.setCompleted(data.completed);
    },
    "playerMenu.setMedia": (data) => {
        mp.playerMenu.setMedia(data.media);
    },
    "playerMenu.setPasswordDate": (data) => {
        mp.playerMenu.setPasswordDate(data.passwordDate);
    },
    "playerMenu.setEmail": (data) => {
        mp.playerMenu.setEmail(data.email, data.confirmEmail);
    },
    "playerMenu.setName": (data) => {
        mp.playerMenu.setName(data.name);
    },
    "playerMenu.setAdmin": (data) => {
        mp.playerMenu.setAdmin(data.admin);
    },
    "playerMenu.setFines": (data) => {
        mp.playerMenu.setFines(data.fines);
    },
    "playerMenu.setLaw": (data) => {
        mp.playerMenu.setLaw(data.law);
    },
    "playerMenu.setNarcotism": (data) => {
        mp.playerMenu.setNarcotism(data.narcotism);
    },
    "playerMenu.setNicotine": (data) => {
        mp.playerMenu.setNicotine(data.nicotine);
    },
    "playerMenu.setNumber": (data) => {
        mp.playerMenu.setNumber(data.number);
    },
    "playerMenu.setSpouse": (data) => {
        mp.playerMenu.setSpouse(data.spouse);
    },
    "money.change": (cash, bank) => {
        mp.playerMenu.setCash(cash);
    },
    "casino.chips.changed": (chips) => {
        mp.playerMenu.setChips(chips);
    },
});
