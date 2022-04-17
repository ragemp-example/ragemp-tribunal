
var radio = new Vue({
    el: "#radio",
    data: {
        show: false,
        wave: 0, // Текущая волна
        minWave: 0, // Минимальная волна
        maxWave: 99, // Максимальная волна
        active: null,
        isConnected: false,
        waiting: false,
        btns: {
            left: {
                key: "<",
                active: false,
                handler() {
                    radio.wave--;
                    radio.disconnect();
                }
            },
            right: {
                key: ">",
                active: false,
                handler() {
                    radio.disconnect();
                    radio.wave++;
                }
            },
            reduce: {
                key: "-",
                active: false,
                handler() {
                    mp.trigger('radioSet.volumeDown');
                }
            },
            add: {
                key: "+",
                active: false,
                handler() {
                    mp.trigger('radioSet.volumeUp');
                }
            }
        },
        interval: null,
    },
    computed: {
        connectionBtn() {
            if (this.isConnected) return 'Подключено'
            else if (this.waiting) return 'Подключение'
            return 'Подключиться'
        }
    },
    methods: {
        downHandler(btn) {
            btn.active = true;

            btn.handler();
            radio.interval = setInterval(() => {
                if (!btn.active) {
                    clearInterval(radio.interval);
                    radio.interval = null;
                    return;
                }

                btn.handler();
            }, 200);


        },
        upHandler(btn) {
            btn.active = false;
            clearInterval(radio.interval);
            radio.interval = null;
        },
        setConnection(val) {
            this.isConnected = val;
            this.waiting = false;
        },
        connect() {
            if (this.waiting) return;

            if (this.isConnected) {
                this.disconnect();
                return;
            }

            if (this.isConnected)
                this.disconnect();
            this.waiting = true;

            mp.trigger('radioSet.connect', this.wave);
            radio.setConnection(true);
        },
        disconnect() {
            radio.setConnection(false);
            mp.trigger('radioSet.disconnect');
        }
    },
    watch: {
        wave(val) {
            if (val < this.minWave)
                this.wave = this.maxWave;
            else if (val > this.maxWave)
                this.wave = this.minWave;
        }
    }
});

// for tests

// radio.show = true;
