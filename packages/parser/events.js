"use strict";
/// Модуль системы парсинга JSON в БД
let parser = require("./index.js");

module.exports = {
    /// Событие инициализации сервера
    "init": async () => {
        await parser.init();
        inited(__dirname);
    },
};

