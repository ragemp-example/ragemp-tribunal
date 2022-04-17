let intervalFishingB;

var fishing = new Vue({
    el: '#fishing',
    data: {
        show: false,
        position: 0,
        zone: null,
        isStarted: false,
        isFetch: false,
        direction: 'right',
        weight: null,
        fishName: null,
        isEnd: false,
        success: false,
    },
    watch: {
        position: function (newPosition, oldPosition) {
            if (oldPosition === 98) {
                this.direction = 'left';
            }

            if (oldPosition === 1) {
                if (this.direction === 'left') {
                    this.isEnd = true;
                    clearInterval(intervalFishingB);
                    mp.trigger('fishing.game.end', false);
                }

                this.direction = 'right';
            }
        },
    },
    methods: {
        moveCursor() {
            if (this.direction === 'right') {
                this.position++;
            }

            if (this.direction === 'left') {
                this.position--;
            }
        },
        fishFetch(speed, zone, weight, name) {
            this.isFetch = true;
            this.zone = zone;
            this.weight = weight;
            this.fishName = name;
            intervalFishingB = setInterval(this.moveCursor, speed);
        },
        endFishing() {
            clearInterval(intervalFishingB);
            this.isEnd = true;

            let result = ((Math.abs((this.position) - 50) - 0.5) <= parseInt(this.zone / 2));
            this.success = result;

            mp.trigger('fishing.game.end', result);
        },
        clearData() {
            this.position = 0;
            this.weight = null;
            this.fishName = null;
            this.zone = null;
            this.direction = 'right';
            this.isStarted = false;
            this.isFetch = false;
            this.isEnd = false;
            this.success = false;
        }
    },
});

// fishing.show = true;
// fishing.isStarted = true;
// setTimeout(() => fishing.fishFetch(20, 20, 3, 'Окунь'), 10);
// setTimeout(() => fishing.endFishing(), 4500);