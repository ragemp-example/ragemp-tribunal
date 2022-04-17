var notifications = new Vue({
    el: "#notifications",
    data: {
        messages: [
            // { type: "warning", header: "header", text: "text message", hash: 12 },
            // { type: "info", header: "header", text: "text message", hash: 142 },
            // { type: "success", header: "header", text: "text message", hash: 123 },
            // { type: "error", header: "Бизнес", text: "Вы не оплатили налог 100$", hash: 122 },
        ],
        // Время показа уведомления
        showTime: 10000,
        // Макс. кол-во уведомлений на экране
        maxCount: 5, // set #notifications .notif-box:nth-last-child in notifications.css
        count: 0, //Для уникального ключа.
    },

    methods: {
        push(type, text, header) {
            if (header == 'undefined' || header == 'null') header = null;
            this.messages.push({
                type: type,
                img: (type.split(" ").length > 1) ? type.split(" ")[1] : type,
                header: header,
                text: text,
                hash: ++this.count,
                timer: null,
            });

            if (this.messages.length > this.maxCount) {
                let message = this.messages.shift();
                clearTimeout(message.timer);
            }
            var self = this;
            this.messages[this.messages.length-1].timer = setTimeout(() => {
                self.messages.shift();
                /*clearTimeout(message.timer);*/
            }, this.showTime);
        },
        info(text, header) {
            this.push(`info`, text, header);
        },
        warning(text, header) {
            this.push(`warning`, text, header);
        },
        success(text, header) {
            this.push(`success`, text, header);
        },
        error(text, header) {
            this.push(`error`, text, header);
        },
        addCash(text, header) {
            this.push(`success`, text, header);
        },
        removeCash(text, header) {
            this.push(`warning`, text, header);
        },
        addMoney(text, header) {
            this.push(`success`, text, header);
        },
        removeMoney(text, header) {
            this.push(`warning`, text, header);
        },
    }
});

// for tests
// function PushPullNotif () {
//     notifications.push("error", "зачисление + $500"+notifications.count, "Банк Maze");
//     notifications.push("success", "зачисление + $500"+notifications.count, "Банк Maze");
//     notifications.push("info", "зачисление + $500"+notifications.count, "Банк Maze");
//     notifications.push("warning", "зачисление + $500"+notifications.count, "Банк Maze");
// }
