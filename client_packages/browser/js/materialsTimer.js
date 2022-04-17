var materialsTimer = new Vue({
    el: '#materialsTimer',
    data: {
        show: false,
        minutes: 0,
        seconds: 0,
        materialsInterval: null
    },
    methods: {
        start() {
            this.materialsInterval = setInterval(this.down, 1000);
        },
        down() {
            if (this.minutes === 0 && this.seconds === 0) return this.end();

            if (this.seconds === 0) {
                this.minutes--;
                this.seconds = 59;
            } else {
                this.seconds--;
            }
        },
        end() {
            clearInterval(this.materialsInterval);
            this.materialsInterval = null;
        }
    },
})