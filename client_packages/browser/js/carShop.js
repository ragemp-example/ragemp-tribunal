
var carShop = new Vue({
    el: "#carShop",
    data: {
        show: false,
        vehicles: [],
        focusVehicle: null,
        maxVelocityLimit: 250, // Максимльная скорость на шкале
        maxFuelVolume: 150, // Максимальный объем топлива
        maxTrunkCapacity: 360,
        colors: {
            main: {
                values: ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f", "#fff", "#000"], // Основные цвета
                offset: 0,
                focus: 0,
                color() {
                    let color = this.values[this.offset + this.focus];
                    mp.trigger('carshow.vehicle.color', this.offset + this.focus, -1);
                    return color;
                }
            },
            additional: {
                values: ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f", "#fff", "#000"], // Доп. цвета
                offset: 0,
                focus: 0,
                color() {
                    let color = this.values[this.offset + this.focus];
                    mp.trigger('carshow.vehicle.color', -1, this.offset + this.focus);

                    return color;
                }
            }
        }
    },
    computed: {
        velocityScale() {
            let k = this.focusVehicle.maxVelocity / this.maxVelocityLimit;

            return ((k > 1) ? 1 : k) * 100 + "%";
        },
        fuelScale() {
            let k = this.focusVehicle.fuelVolume / this.maxFuelVolume;

            return ((k > 1) ? 1 : k) * 100 + "%";
        },
        trunkCapacityScale() {
            let k = this.focusVehicle.trunkCapacity / this.maxTrunkCapacity;

            return ((k > 1) ? 1 : k) * 100 + "%";
        },
        mainColors() {
            let d = this.colors.main.values.length - this.colors.main.offset;
            let offset = (d < 6) ? this.colors.main.offset - 1 : this.colors.main.offset;

            let values = [];

            for (let i = 0; i < 6; i++) {
                values.push(this.colors.main.values[offset+i]);
            }

            return values;
        },
        additionalColors() {
            let d = this.colors.additional.values.length - this.colors.additional.offset;
            let offset = (d < 6) ? this.colors.additional.offset - 1 : this.colors.additional.offset;

            let values = [];

            for (let i = 0; i < 6; i++) {
                values.push(this.colors.additional.values[offset+i]);
            }

            return values;
        },
    },
    methods: {
        onClickVehicle(vehicle) {
            this.focusVehicle = vehicle;
            mp.trigger('carshow.vehicle.show', this.vehicles.findIndex(x => x.name == vehicle.name));
        },
        onClickBuy(vehicle) {
            this.show = false;
           mp.trigger('carshow.car.buy');
        },
        onClickTestDrive(vehicle) {
            this.show = false;
            mp.trigger('carshow.testdrive.start');
        },
        onClickRight(name) {
            if (this.colors[name].focus == 5) return;

            if (this.colors[name].focus == 4) {
                if (this.colors[name].focus + this.colors[name].offset != this.colors[name].values.length-2) {
                    this.colors[name].offset++;
                    this.colors[name].color();
                    return
                }
            }
            this.colors[name].focus++;
            this.colors[name].color();
        },
        onClickLeft(name) {
            if (this.colors[name].focus == 0) return;

            if (this.colors[name].focus == 1) {
                if (this.colors[name].offset != 0) {
                    this.colors[name].offset--;
                    this.colors[name].color();
                    return
                }
            }
            this.colors[name].focus--;
            this.colors[name].color();
        },

        setVehicles(vehicles) {
            this.vehicles = vehicles;
        },
    },
    watch: {
        show(val) {
            if (!val) return;

            if (this.vehicles[0])
                this.focusVehicle = this.vehicles[0];
        }
    }
});

// for tests

// carShop.show = true;
//
// carShop.setVehicles([
//     {
//         type: "ПРЕМИУМ - СЕДАН",
//         name: "ENUS Cognoscenti Cabrio",
//         maxVelocity: 250,
//         fuelVolume: 500,
//         price: "500000000",
//     },
//     {
//         type: "ПРЕМИУМ - СЕДАН",
//         name: "Dewbauchee Exemplar",
//         maxVelocity: 250,
//         fuelVolume: 50,
//         price: "500000000",
//     },
//     {
//         type: "ПРЕМИУМ - СЕДАН",
//         name: "Lampadati Felon",
//         maxVelocity: 250,
//         fuelVolume: 70,
//         price: "500000000",
//     },
//     {
//         type: "ПРЕМИУМ - СЕДАН",
//         name: "Lampadati Felon GT",
//         maxVelocity: 150,
//         fuelVolume: 50,
//         price: "500000000",
//     },
//     {
//         type: "ПРЕМИУМ - СЕДАН",
//         name: "Lampadati Felon GT",
//         maxVelocity: 150,
//         fuelVolume: 30,
//         price: "500000000",
//     },
//     {
//         type: "ПРЕМИУМ - СЕДАН",
//         name: "Lampadati Felon GT",
//         maxVelocity: 150,
//         fuelVolume: 20,
//         price: "500000000",
//     },
//     {
//         type: "ПРЕМИУМ - СЕДАН",
//         name: "Lampadati Felon GT",
//         maxVelocity: 350,
//         fuelVolume: 10,
//         price: "500000000",
//     },
//     {
//         type: "ПРЕМИУМ - СЕДАН",
//         name: "Lampadati Felon GT",
//         maxVelocity: 300,
//         fuelVolume: 50,
//         price: "500000000",
//     },
// ])
