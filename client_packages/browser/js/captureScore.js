var captureScore = new Vue({
    el: "#captureScore",
    data: {
        show: false,
        colors: {
            1: "#e13b3b",
            2: "#00b500",
            8: "#00AA11",
            9: "#A500A8",
            10: "#fff629",
            11: "#4a97d1",
            12: "#ffdd1f",
            13: "#ff1f1f",
            14: "#b8b8b8",
            16: "#fc0303",
            17: "#f59e42"
        },
        names: {
            1: "Attack Army",
            2: "Defense Army",
            8: "The Families",
            9: "The Ballas",
            10: "Los Santos Vagos",
            11: "Marabunta Grande",
            12: "Italian Embassy",
            13: "Mexican Embassy",
            14: "Russian Embassy",
            16: "The Bloods",
            17: "Japanese Embassy"
        },
        leftBandId: 8,
        rightBandId: 9,
        leftScore: 0,
        rightScore: 100,
        time: 90,
        timer: null,
    },
    computed: {
        leftImgSrc() {
            if (this.leftBandId < 8 || this.leftBandId > 11) return null;
            return `img/captureScore/${this.leftBandId}.svg`;
        },
        rightImgSrc() {
            if (this.rightBandId < 8 || this.rightBandId > 11) return null;
            return `img/captureScore/${this.rightBandId}.svg`;
        },
        progressWidth() {
            var max = this.leftScore + this.rightScore;
            if (max == 0) return 50;
            return this.leftScore / max * 100;
        },
        prettyTime() {
            var minutes = parseInt(this.time / 60);
            var seconds = parseInt(this.time % 60);
            if (minutes < 10) minutes = "0" + minutes;
            if (seconds < 10) seconds = "0" + seconds;
            return `${minutes}:${seconds}`;
        },
        isShow() {
            return this.show && !offerDialog.dialog;
        },
    },
    watch: {
        show(val) {
            if (!val) {
                killList.list = [];
                clearInterval(this.timer);
            }
        }
    },
    methods: {
        start(bandA, bandB, time, leftScore = 0, rightScore = 0) {
            this.leftBandId = bandA;
            this.rightBandId = bandB;
            this.leftScore = leftScore;
            this.rightScore = rightScore;
            this.time = time;
            this.show = true;
            this.startTimer();
        },
        startTimer() {
            clearInterval(this.timer);
            this.timer = setInterval(() => {
                this.time--;
                if (this.time < 0) this.show = false;
            }, 1000);
        },
        setScore(bandId, score) {
            if (this.leftBandId == bandId) this.leftScore = score;
            else if (this.rightBandId == bandId) this.rightScore = score;
        }
    }
});

// for tests
// captureScore.show = true;
