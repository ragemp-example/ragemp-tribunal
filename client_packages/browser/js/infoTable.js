var infoTable = new Vue({
    el: "#infoTable",
    data: {
        show: false,
        // Доступные таблицы с информацией
        tables: {
            "character_skills": {
                header: "Навыки",
                params: [{
                        key: "Рыбак",
                        value: 0,
                        isProgress: true,
                    },
                    {
                        key: "Фермер",
                        value: 0,
                        isProgress: true,
                    },
                    {
                        key: "Водитель автобуса",
                        value: 0,
                        isProgress: true,
                    },
                    {
                        key: "Таксист",
                        value: 0,
                        isProgress: true,
                    },
                    {
                        key: "Дальнобойщик",
                        value: 0,
                        isProgress: true,
                    },
                ]
            }
        },
        // Текущая информация
        name: "character_skills"
    },
    methods: {
        prettyValue(param) {
            var value = param.value;
            if (param.isProgress) value += '%';
            return value;
        },
        setValues(name, values) {
            var table = this.tables[name];
            if (!table) return;
            if (typeof values == 'string') values = JSON.parse(values);
            for (var i = 0; i < values.length; i++) {
                table.params[i].value = values[i];
            }
        },
        showByName(name, values) {
            if (!this.tables[name]) return;
            this.setValues(name, values);
            this.name = name;
            this.show = true;
        },
    }
});
