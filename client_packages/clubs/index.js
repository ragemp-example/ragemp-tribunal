"use strict";

mp.clubs = {
    // Барные стойки в клубах (полигоны)
    bars: {
        // Багама (La Cosa Nostra)
        1: [
            // первая стойка
            [{
                x: -1390.869873046875,
                y: -597.3942260742188
            },
                {
                    x: -1394.5435791015625,
                    y: -599.474609375
                },
                {
                    x: -1394.9027099609375,
                    y: -603.2318115234375
                },
                {
                    x: -1393.0018310546875,
                    y: -607.9688110351562
                },
                {
                    x: -1390.001953125,
                    y: -610.6476440429688
                }
            ],
            // вторая стойка
            [{
                x: -1373.954345703125,
                y: -624.114501953125
            },
                {
                    x: -1383.229248046875,
                    y: -630.1057739257812
                },
                {
                    x: -1381.6634521484375,
                    y: -632.8622436523438
                },
                {
                    x: -1372.8597412109375,
                    y: -626.2239379882812
                }
            ],
        ],
        // Текила (La Eme)
        2: [
            [{
                x: -560.07470703125,
                y: 284.3400573730469
            },
                {
                    x: -559.5648803710938,
                    y: 289.45013427734375
                },
                {
                    x: -561.674560546875,
                    y: 289.3218994140625
                },
                {
                    x: -561.9251098632812,
                    y: 284.5945739746094
                }
            ]
        ],
        // Ванила (Russian Mafia)
        3: [
            [{
                x: 126.0940933227539,
                y: -1282.380126953125
            },
                {
                    x: 129.4110107421875,
                    y: -1287.9600830078125
                },
                {
                    x: 131.23081970214844,
                    y: -1287.2015380859375
                },
                {
                    x: 127.67247009277344,
                    y: -1281.123779296875
                }
            ]
        ],
    },
    // Игрок находится возле барной стойки
    isNearBar: false,
    // Клуб, в котором находится игрок (ид организации клуба)
    currentClub: null,
    // Последнее время синхронизации значения опьянения с сервером
    drunkennessLastSync: 0,
    // Опьянение (0-100)
    drunkenness: 0,
    // Мин. значение опьянения, при котором меняется походка
    walkingDrunkenness: 5,
    // Мин. значение опьянения, при котором будет визуальный эффект
    vfxDrunkenness: 5,
    // Визуальный эффект от опьянения
    vfxName: "DrugsDrivingOut",
    // Ожидание снятия опьянения
    drunkennessWaitClear: 2 * 60 * 1000,

    initDrunkennessData(data) {
        this.walkingDrunkenness = data.walkingDrunkenness;
        this.vfxDrunkenness = data.vfxDrunkenness;
        this.vfxName = data.vfxName;
        this.drunkennessWaitClear = data.drunkennessWaitClear;
    },
    setCurrentClub(data) {
        this.currentClub = data;
        if (data) {
            mp.callCEFV(`selectMenu.menus['club'].init(${JSON.stringify(data)})`);
        }
    },
    setNearBar(enable) {
        if (enable == this.isNearBar) return;
        this.isNearBar = enable;
        if (this.isNearBar) mp.prompt.showByName("clubs_buy");
        else {
            mp.prompt.hide();
            mp.callCEFV(`selectMenu.show = false`);
        }
    },
    barHandler() {
        if (mp.game.ui.isPauseMenuActive()) return;
        if (mp.busy.includes()) return;
        if (!this.currentClub || !this.isNearBar) return;

        mp.callCEFV(`selectMenu.showByName('club')`);
    },
    setDrunkenness(value) {
        value = Math.clamp(value, 0, 100);
        var oldIntensity = this.getShakeIntensity(this.drunkenness);
        var newIntensity = this.getShakeIntensity(value);

        if (this.drunkenness < this.vfxDrunkenness && value >= this.vfxDrunkenness) this.setVFXDrunkenness(true);
        else if (this.drunkenness >= this.vfxDrunkenness && value < this.vfxDrunkenness) this.setVFXDrunkenness(false);

        this.drunkenness = value;
        if (oldIntensity != newIntensity) mp.game.cam.shakeGameplayCam("DRUNK_SHAKE", newIntensity);
        this.drunkennessLastSync = Date.now();
    },
    getShakeIntensity(drunkenness) {
        return parseInt(drunkenness / 20);
    },
    setVFXDrunkenness(enable) {
        var duration = (enable) ? 60 * 60 * 1000 : 0;
        mp.events.call('effect', this.vfxName, duration);
    },
    drunkennessSync() {
        if (!this.drunkenness) return;
        mp.events.callRemote(`clubs.drunkenness.sync`);
    },
};

mp.events.add({
    "characterInit.done": () => {
        mp.keys.bind(69, true, () => {
            mp.clubs.barHandler();
        }); // E
    },
    "clubs.drunkennessData.init": (data) => {
        mp.clubs.initDrunkennessData(data);
    },
    "clubs.setCurrentClub": (data) => {
        mp.clubs.setCurrentClub(data)
    },
    "clubs.drunkenness.set": (value) => {
        mp.clubs.setDrunkenness(value);
    },
    "time.main.tick": () => {
        if (mp.clubs.currentClub) {
            var pos = mp.players.local.position;
            var isNearBar = false;
            mp.clubs.bars[mp.clubs.currentClub.id].forEach(polygon => {
                if (mp.utils.inPolygon(pos, polygon)) isNearBar = true;
            });
            mp.clubs.setNearBar(isNearBar);
        }

        if (mp.clubs.drunkenness) {
            if (Date.now() - mp.clubs.drunkennessLastSync > mp.clubs.drunkennessWaitClear) {
                mp.clubs.drunkennessSync();
            }
        }
    },
    // "render": () => {
    //     mp.utils.drawText2d(`Опьянение: ${mp.clubs.drunkenness}%`, [0.8, 0.6]);
    // },
});
