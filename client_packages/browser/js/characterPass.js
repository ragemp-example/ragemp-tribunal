var characterPass = new Vue({
    el: "#characterPass",
    data: {
        show: false,
        header: "Паспорт гражданина",
        fName: "Alexander",
        sName: "Woodman",
        spouse: null,
        regDate: "03/08/2019",
        sex: 0,
        number: 3940123342,
    },
    methods: {
        close() {
            this.show = false;
            mp.trigger('documents.close');
        }
    },
    computed: {
        fullname() {
            return this.fName + " " + this.sName;
        },
        prettySex() {
            return (this.sex)? "Ж" : "М";
        },
        prettyNumber() {
            return getPaddingNumber(this.number, 10);
        },
        prettySpouse() {
            if (!this.spouse) return (this.sex)? "Не замужем" : "Не женат";
            var str = (this.sex)? "Замужем за " : "Женат на ";
            return str + this.spouse;
        },
    }
});

// for tests
// characterPass.show = true;
