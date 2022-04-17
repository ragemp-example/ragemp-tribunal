var hud = new Vue({
    el: "#hud",
    data: {
        players: 123,
        maxPlayers: 1500,
        build: 0,
        branch: "",
        wanted: 3,
        cash: 200000,
        bank: 200000,
        time: convertToMoscowDate(new Date()).toTimeString().replace(/(\d{2}:\d{2}).*/, '$1'),
        region: "Маленький Сеул",
        street: "Бульвар Веспуччи",
        temperature: 28,
        city: "San Andreas",
        weather: "clear-day",
        mute: false, // Блокировка голосового чата
        voice: false,
        show: false,
        showOnline: true,
        leftWeather: 320,
        keysShow: true,
        date: "",
        star: "M7.90313 0.66903C8.38475 -0.223008 9.61525 -0.223011 10.0969 0.669028L12.114 4.4051C12.2937 4.73789 12.6032 4.97261 12.9619 5.04817L16.9888 5.8964C17.9503 6.09892 18.3306 7.32062 17.6667 8.07446L14.8864 11.2317C14.6388 11.5129 14.5206 11.8927 14.5626 12.2722L15.0342 16.5325C15.1469 17.5497 14.1514 18.3048 13.2595 17.8786L9.52399 16.0939C9.19126 15.9349 8.80874 15.9349 8.47601 16.0939L4.74053 17.8786C3.84864 18.3048 2.85315 17.5497 2.96576 16.5325L3.43741 12.2722C3.47942 11.8927 3.36121 11.5129 3.11356 11.2317L0.333262 8.07446C-0.330572 7.32063 0.0496698 6.09892 1.01116 5.8964L5.03813 5.04817C5.39683 4.97261 5.7063 4.73789 5.88597 4.4051L7.90313 0.66903Z",
        satiety: 75,
        thirst: 30,
        playerId: 15,
        cold: false,
        heat: false,
        arrestTime: 0, // секунды
        arrestTimeMax: 0,
        arrestTimer: null,
        voice_key: 'N',
        menu_key: 'M',
        keys: [
            // {
            //     key: "2",
            //     name: "Завести двигатель",
            // },
            // {
            //     key: "M",
            //     name: "Личное меню",
            // },
            // {
            //     key: "I",
            //     name: "Инвентарь",
            // },
            {
                key: "T",
                name: "Чат",
            },
            // {
            //     key: "P",
            //     name: "Планшет",
            // },
            {
                key: "<i class='fas fa-arrow-up'></i>",
                name: "Телефон",
            },
            {
                key: "N",
                name: "Войс-чат",
            },
            {
                key: "L",
                name: "Действия",
            },
            {
                key: "J",
                name: "Двери т/с",
            },
            // {
            //     key: "M",
            //     name: "Меню",
            // },
            // {
            //     key: "F3",
            //     name: "Обновления",
            // },
        ],
        localPos: {
            x: 0,
            y: 0,
        },
        coldTimer: -1,
        heatTimer: -1,
    },
    computed: {
        arrestProgressStyle() {
            return {
                strokeDasharray: `${this.arrestProgress * 1.57}% 157%`, //78.5% 157%;
            }
        },
        arrestProgress() {
            return /*100 - */this.arrestTime / this.arrestTimeMax * 100 + "%";
        },
        arrestDescription() {
            let min = ((parseInt(this.arrestTime / 60) < 10) ? '0' : '') + parseInt(this.arrestTime / 60);
            let sec = ((parseInt(this.arrestTime % 60) < 10) ? '0' : '') + parseInt(this.arrestTime % 60);
            return `${min}:${sec}`;
        },
    },
    watch: {
        cold(val) {
            if (!val) return;
            clearTimeout(this.coldTimer);
            this.coldTimer = setTimeout(() => {
                this.cold = false;
            }, 10000);
        },
        heat(val) {
            if (!val) return;
            clearTimeout(this.heatTimer);
            this.heatTimer = setTimeout(() => {
                this.heat = false;
            }, 10000);
        },
        arrestTimeMax(val) {
            this.arrestTime = val;
            clearInterval(this.arrestTimer);
            this.arrestTimer = setInterval(() => {
                this.arrestTime--;
                if (this.arrestTime <= 0) {
                    clearInterval(this.arrestTimer);
                }
            }, 1000);
        },
    },
    methods: {
        updateTime() {
            this.time = convertToMoscowDate(new Date()).toTimeString().replace(/(\d{2}:\d{2}).*/, '$1');
            if (this.time == "00:00")
                this.setDate();
        },
        setDate() {
            let date = convertToMoscowDate(new Date());
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getUTCFullYear();

            if (day < 10) day = "0" + day;
            if (month < 10) month = "0" + month;
            this.date = `${day}.${month}.${year}`;
        },
        pretty(val) {
            return prettyMoney(val);
        },
        isKeyShow(name) {
            // if (name == 'Планшет') return playerMenu.factionId && playerMenu.factionId < 8;
            return true;
        },
    },
    mounted() {
        setInterval(this.updateTime, 1000);
        this.setDate();
    },
});

// for tets
// hud.show = true;
// hud.arrestTimeMax = 60;
