
var documents = new Vue({
    el: "#documents",
    data: {
        show: false,
        active: "idCard",
        docs: {
            idCard: {
                keyHead: "ID карта",
                show: true,
                values: {
                    name: {
                        head: "Name",
                        value: "",
                    },
                    surname: {
                        head: "Surname",
                        value: "",
                    },
                    sex: {
                        head: "Sex",
                        value: "",
                    },
                    issued: {
                        head: "Issued On",
                        value: "",
                    },
                    cardNum: {
                        head: "Passport card No.",
                        value: "",
                    },
                    expires: {
                        head: "Expires On",
                        value: "",
                    }
                },
            },
            medCard: {
                keyHead: "Мед. карта",
                show: false,
                values: {
                    memberName: {
                        head: "Member Name:",
                        value: "",
                    },
                    memberId: {
                        head: "Member ID:",
                        value: "",
                    },
                    expires: {
                        head: "Effective Date:",
                        value: "",
                    },
                    sign: {
                        head: "Signature:",
                        value: "",
                    }
                }
            },
            licenses: {
                keyHead: "Лицензии",
                show: false,
                carClasses: ['A', 'B', 'C', 'D', 'WATER', 'SKY'],
                classes: [],
                values: {
                    id: {
                        head: "ID:",
                        value: "",
                    },
                    sex: {
                        head: "Sex:",
                        value: "",
                    },
                    gunLic: {
                        head: "Gun License:",
                        value: "",
                    },
                    sign: {
                        head: "",
                        value: "",
                    }
                }
            }
        }
    },
    computed: {
        background() {
            return `img/documents/${this.active}.png`;
        },
    },
    methods: {
        setIDCard(data) {
            for (var key in data) {
                this.docs.idCard.values[key].value = data[key];
            }

        },
        setMedCard(data) {
            for (var key in data) {
                switch (key) {
                    case "show":
                        this.docs.medCard.show = data[key];
                        this.active = (data[key]) ? this.active : 'idCard';
                        break;
                    default:
                    this.docs.medCard.values[key].value = data[key];
                }
            }
        },
        setLicensesCard(data) {
            for (var key in data) {
                switch (key) {
                    case "gunLic":
                        this.docs.licenses.values[key].value = (data[key]) ? 'YES' : 'NO';
                        break;
                    case "carClasses":
                        this.docs.licenses.classes = data[key];
                        break;
                    case "show":
                        this.docs.licenses.show = data[key];
                        this.active = (data[key]) ? this.active : 'idCard';
                        break;
                    default:
                        if (this.docs.licenses.values[key]) {
                            this.docs.licenses.values[key].value = data[key];
                        }
                }
            }
        },
    },
})

// for tests

// documents.setIDCard({
//     name: "Имя",
//     surname: "Фамилия",
//     sex: "M",
//     issued: "09.09.2020",
//     expires: "09.09.2024",
//     cardNum: "123123123",
// });
//
// documents.setMedCard({
//     memberName: "Jason Jeniferston",
//     memberId: "123123123",
//     expires: "09.09.2024",
//     sign: "Jason J.",
//     show: true,
// });
//
// documents.setLicensesCard({
//     id: "123123123",
//     sex: "M",
//     gunLic: true,
//     carClasses: ['A', /*'B', 'C', 'D', 'WATER',*/ 'SKY'],
//     sign: "Jason J.",
//     show: false,
// });
//
// documents.setLicensesCard({ show: true, gunLic: false });
//
// documents.show = true;
