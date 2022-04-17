

var speedometer = new Vue({
    el: "#speedometer",
    data: {
        show: false,
        isActive: true, //подсветка
        headlights: 0, //0-выкл,1-габариты,2-ближний,3-дальний (фары)
        lock: 0, //0-открыт,1-закрыт (двери)
        speed: 0,
        fuel: 100,
        maxFuel: 70,
        mileage: 0,
        danger: 0, //0-выкл,1-вкл (движок)
        maxSpeed: 480,
        arrow: 0, //0-выкл,1-левый,2-правый (поворотики)
        emergency: 0,
        isElectricCar: false, // Установить true для электрокаров.

        leftArrow: false,
        rightArrow: false,

        arrowInterval: null,
    },
    methods: {
        flickerLight: function () { // 0, 1, 2, 3
            if (this.arrowInterval)
                clearInterval(this.arrowInterval);

            if (!(this.arrow + this.emergency)) {
                this.leftArrow = false;
                this.rightArrow = false;
                return;
            }
            this.leftArrow = (this.emergency == 1 || this.arrow == 1) ? !this.leftArrow : false;
            this.rightArrow = (this.emergency == 1 || this.arrow == 2) ? !this.rightArrow : false;

            this.arrowInterval = setInterval(() => {
                this.leftArrow = (this.emergency == 1 || this.arrow == 1) ? !this.leftArrow : false;
                this.rightArrow = (this.emergency == 1 || this.arrow == 2) ? !this.rightArrow : false;
            }, 500);
        },
    },
    computed: {
        speedPart() {
            return this.speed / this.maxSpeed * 20
        },
        perFuel: function () {
            let fuel = this.fuel;

            return 100 - (fuel * 100 / this.maxFuel);
        },
        isShow() {
            return this.show && hud.show;
        },
    },
    watch: {
        arrow: function () {
            this.flickerLight();
        },
        emergency: function () {
            this.flickerLight();
        }
    },
    filters: {
        split: function (value) {
            value = value + '';
            return value.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
        }
    }


});

// for tests
// speedometer.show = true;
