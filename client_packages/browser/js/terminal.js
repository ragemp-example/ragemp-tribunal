var terminal = new Vue({
    el: "#terminal",
    data: {
        show: false,
        enable: false,
        // Сообщения в терминале
        messages: [],
        // Макс. кол-во сообщений в терминале
        maxCount: 50,
        // Логирование введенных команд
        savedCmds: [],
        // Макс. кол-во сохраненных команд
        maxCmdsCount: 50,
        // Индекс показываемой команды
        savedCmdI: -1,
        // Текст в поле ввода
        inputText: "",
        // Позиция окна на экране
        pos: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        },
        dragging: {
            // Перемещается ли сейчас окно за мышкой
            active: false,
            offset: {
                x: 0,
                y: 0
            }
        },
    },
    methods: {
        push(type, text) {
            if (typeof text == 'object') text = JSON.stringify(text);
            this.messages.push({
                type: type,
                text: text
            });
            if (this.messages.length > this.maxCount) this.messages.shift();
            this.scrollTop();
        },
        debug(text) {
            this.push(`debug`, text);
        },
        scrollTop() {
            setTimeout(() => {
                var el = this.$el;
                if (!el) return this.debug(`Элемент не найден при скролле консоли! (screen --> @carter)`);
                var content = this.$el.querySelector(".content");
                content.scrollTop = 999999;
            }, 10);
        },
        onHeaderMouseDown(e) {
            this.dragging.active = true;
            this.dragging.offset.x = e.pageX - this.pos.x;
            this.dragging.offset.y = e.pageY - this.pos.y;
        },
        onInputEnter() {
            if (!this.inputText) this.show = false;
            else {
                this.sendRemote(this.inputText.split(' '));
                this.saveCmd(this.inputText);
                this.inputText = "";
            }
            this.savedCmdI = -1;
        },
        onInputUp() {
            if (this.savedCmdI >= this.savedCmds.length - 1) return;
            this.savedCmdI++;
            this.inputText = this.savedCmds[this.savedCmdI];
        },
        onInputDown() {
            if (this.savedCmdI <= 0) {
                if (this.savedCmdI == 0) this.savedCmdI--;
                return this.inputText = "";
            }
            this.savedCmdI--;
            this.inputText = this.savedCmds[this.savedCmdI];
        },
        sendRemote(values) {
            // console.log(`sendRemote:`);
            // console.log(values)
            mp.trigger("callRemote", "terminal.command.handle", JSON.stringify(values));
        },
        saveCmd(text) {
            this.savedCmds.unshift(text);
            if (this.savedCmds.length > this.maxCmdsCount) this.savedCmds.pop();
            mp.trigger(`terminal.saveCmd`, JSON.stringify(text).slice(1, -1));
        },
        initSavedCmds(cmds) {
            if (typeof cmds == 'string') cmds = JSON.parse(cmds);

            this.savedCmds = cmds;
        }
    },
    watch: {
        enable(val) {
            if (!val) this.show = false;
        },
        show(val) {
            if (val) {
                busy.add("terminal", true, true);
                this.inputText = "";
                setTimeout(() => {
                    this.$refs["input"].focus();
                }, 100);
            } else busy.remove("terminal", true);
        },
    },
    mounted() {
        let self = this;
        window.addEventListener('keyup', function(e) {
            if (busy.includes(["chat"])) return;
            if ((e.keyCode == 192 || e.keyCode == 1040) && self.enable) self.show = !self.show;
        });
        window.addEventListener('mousemove', function(e) {
            if (self.dragging.active) {
                self.pos.x = e.pageX - self.dragging.offset.x;
                self.pos.y = e.pageY - self.dragging.offset.y;
            }
        });
        window.addEventListener('mouseup', function(e) {
            self.dragging.active = false;
            self.dragging.offset.x = 0;
            self.dragging.offset.y = 0;
        });
    }
});

// for tests
/*terminal.push("log", "Лог");
terminal.push("info", "Информация");
terminal.push("warning", "Внимание");
terminal.push("error", "Ошибка");
terminal.push("debug", "Дебаг");
terminal.enable = true;
terminal.show = true;*/
