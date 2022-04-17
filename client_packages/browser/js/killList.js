var killList = new Vue({
    el: "#killList",
    data: {
        colors: {
            1: "#e13b3b",
            2: "#00b500",
            8: "#00AA11",
            9: "#A500A8",
            10: "#fff629",
            11: "#4a97d1",
            12: "#ffdd1f",
            13: "#ff1f1f",
            14: "#b8b8b8",
            16: "#fc0303",
            17: "#f59e42"
        },
        maxCount: 5,
        types: ["car", "hand"],
        list: [],
    },
    computed: {
        isShow() {
            return this.list.length && !selectMenu.show;
        }
    },
    methods: {
        add(target, killer, reason) {
            if (typeof target == 'string') target = JSON.parse(target);
            if (typeof killer == 'string') killer = JSON.parse(killer);

            this.list.push({
                target: target,
                killer: killer,
                reason: reason
            });
            if (this.list.length > this.maxCount) this.list.shift();
        },
        playerColor(player) {
            return this.colors[player.factionId] || "#fff";
        },
        killImgSrc(reason) {
            var icon = "kill";
            if (this.types.includes(reason)) icon = reason;
            return `img/killList/${icon}.svg`;
        },
        isWeapon(reason) {
            return !this.types.includes(reason);
        }
    }
});

// for tests
// killList.add({
//         name: "Swifty Swift",
//         factionId: 8
//     }, {
//         name: "Carter Slade",
//         factionId: 9
//     },
//     "car");
// killList.add({
//     name: "Swifty Swift",
//     factionId: 11
// }, {
//     name: "Carter Slade",
//     factionId: 10
// }, "Pistol");
// killList.add({
//     name: "Swifty Swift",
//     factionId: 8
// }, {
//     name: "Carter Slade",
//     factionId: 1
// }, "hand");
//
// killList.add({
//     name: "Swifty Swift",
//     factionId: 9
// });
//
// killList.add({
//     name: "Cyrus Raider",
//     factionId: 11
// }, {
//     name: "Carter Slade",
//     factionId: 10
// }, "Pistol");
