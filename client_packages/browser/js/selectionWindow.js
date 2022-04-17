var selectionWindow = new Vue({
    el: "#selection-window",
    data: {
        show: false,
        header: 'Способ оплаты',
        selected: null,
        records: [
            { text: "Наличными (5 000$)" },
            { text: "Картой (124 230$)" },
        ],
        description: 'Выберите способ оплаты товара',
    },
    methods: {
        select(record) {
            this.selected = record;
        },
        accept() {

        },
        decline() {
            this.show = false;
        },
    },
    watch: {
        show (val) {
            if (!val) return;
            this.selected = this.records[0];
        }
    }
});

//selectionWindow.show = true;
