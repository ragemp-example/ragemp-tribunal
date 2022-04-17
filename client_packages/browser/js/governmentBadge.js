
var governmentBadge = new Vue({
    el: "#governmentBadge",
    data: {
        show: false,
        document: {
            faction: '',
            name: '',
            rank: '',
            sex: '',
            director: '',
        }
    },
    computed: {
        nameHeader() {
            return {
                "fib": "agent",
                "lspd": "officer",
                "sheriff": "officer",
                "gover": "name",
                "army": "soldier",
            }[this.document.faction];
        },
        sign() {
            return this.getSign(this.document.name);
        },
        directorSign() {
            return this.getSign(this.document.director);
        }
    },
    methods: {
        getSign(name) {
            let fullname = name.split(' ');
            if (fullname.length != 2) return '';

            return `${fullname[0]} ${fullname[1][0]}.`;
        },
        setData(data) {
            this.document = data;
        }
    }
});

// governmentBadge.setData({
//     // faction: "fib",
//     // faction: "lspd",
//     // faction: "sheriff",
//     // faction: "gover",
//     faction: "army",
//     name: "Cyrus Raider",
//     rank: "Major",
//     sex: "M",
//     director: "Anderson Belial", // only fib
// });

// governmentBadge.show = true;
