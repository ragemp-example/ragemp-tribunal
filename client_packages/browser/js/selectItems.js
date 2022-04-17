var selectItems = new Vue({
    el: "#selectItems",
    data: {
        show: false,
        // Время последнего открытия/закрытия (ms)
        lastShowTime: 0,
        items: inventory.hotkeys,
        // focus: 3,
        tempFocus: -1,
        select: 0,

        centerX: 0,
        centerY: 0,
        sounds: {
            "open": {
                name: "Whoosh_1s_L_to_R",
                setName: "MP_LOBBY_SOUNDS"
            },
            "close": {
                name: "Whoosh_1s_R_to_L",
                setName: "MP_LOBBY_SOUNDS"
            },
            "focus": {
                name: "NAV",
                setName: "HUD_AMMO_SHOP_SOUNDSET"
            },
            "select": {
                name: "WEAPON_SELECT_ARMOR",
                setName: "HUD_AMMO_SHOP_SOUNDSET"
            },
        },
    },
    computed: {
        descItemName() {
            var item = (this.tempFocus != -1) ? this.items[this.tempFocus] : inventory.equipment[13];
            if (!item || !inventory.getItem(item.sqlId)) return null;
            return inventory.getItemName(item);
        },
        descItemCount() {
            var item = (this.tempFocus != -1) ? this.items[this.tempFocus] : inventory.equipment[13];
            if (!item || !inventory.getItem(item.sqlId)) return null;

            var count;
            if (item.params.weaponHash) count = (item.params.ammo != null) ? item.params.ammo + " патронов" : null;
            else count = (item.params.count) ? item.params.count + " ед." : null;

            return count;
        },
    },
    methods: {
        mousemove(e) {
            if (!this.show) return;
            let vectX = e.pageX - this.centerX;
            let vectY = e.pageY - this.centerY;

            let len = Math.sqrt(vectX*vectX + vectY*vectY);
            // console.log(len);

            if (len < 0.12 * this.centerY) {
                this.select = -1;
                return;
            }

            let delta = 0;
            if (vectY < 0 && vectX < 0) delta = 180;
            else if (vectY > 0 && vectX < 0) delta = 180;
            else if (vectY < 0 && vectX > 0) delta = 360;
            else if (vectY > 0 && vectX > 0) delta = 360;

            let angle = Math.atan(vectY / vectX) * 180 / Math.PI + delta;
            // console.log(angle);
            let id = parseInt(angle / 40);
            if (id == 0 || id == -2) {
                return;
            }
            this.select = (id % 9 == 0) ? 9 : (id % 9);
        },
        playSound(name) {
            if (!this.sounds[name]) return;
            mp.trigger(`sound`, JSON.stringify(this.sounds[name]));
        },
        selectHandler() {
            if (this.select == -1) return;
            this.playSound("select")

            if (this.select == 0) {
                if (!inventory.equipment[13]) return;
                inventory.clearHands();
            } else {
                console.log(this.items);
                var item = this.items[this.select];
                if (!item || !inventory.getItem(item.sqlId)) return;
                if (inventory.equipment[13] == item) return;
                inventory.moveItemToBody(item, 13);
            }
        },
    },
    watch: {
        // focus(val) {
        //     this.tempFocus = val;
        // },
        show(val) {
            this.select = -1;
            // this.tempFocus = this.focus;
            if (val) {
                busy.add("selectItems", true, true);
                this.playSound("open");
            } else {
                busy.remove("selectItems", true);
                this.playSound("close");
            }
            this.lastShowTime = Date.now();
        },
        select(val) {
            this.tempFocus = val;
            if (val != -1) this.playSound("focus");
        }
    },
    mounted() {
        var self = this;
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;

        window.addEventListener('keydown', function(e) {
            if (e.keyCode != 9 || self.show) return;
            if (busy.includes() || !inventory.enable || inventory.handsBlock) return;
            if (Date.now() - self.lastShowTime < 2000) return;

            self.show = true;
        });

        window.addEventListener('keyup', function(e) {
            if (e.keyCode != 9 || !self.show) return;
            // TODO: Обработка выбора self.select id ячейки (жёлтой)
            // debug("selectItems.select: " + self.select);
            self.selectHandler();
            self.show = false;
        });
        window.addEventListener('mousemove', self.mousemove);
    }
});

//for tests

// selectItems.show = true;
