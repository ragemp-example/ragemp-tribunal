var gasStation = new Vue({
    el: "#gasStation",
    data: {
        show: false,
        title: "АЗС",
        value: "",
        price: 0,
        pricePerLiter: 12,
    },
    methods: {
        check() {
            if (this.value <= 0) {
                this.value = " ";
                return;
            }

            this.price = this.value * this.pricePerLiter;
        },
        buy() {
            mp.trigger('callRemote', 'fuelstations.fill.litres', this.value);
        },
        fill() {
            mp.trigger('callRemote', 'fuelstations.fill.fulltank');
        },
        close() {
            mp.trigger('fuelstations.close');
            this.show = false;
            this.value = '';
        }
    }
});


// for tests

// gasStation.show = true;
// gasStation.title = "АЗС “12”";
