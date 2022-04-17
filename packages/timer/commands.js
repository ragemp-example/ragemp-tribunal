let timer = require('./index');

module.exports = {
    /// Тестовая команда
    "/throwtimererror": {
        access: 6,  /// Уровень админки
        description: "Сломать серверный таймер",  /// Описание команды
        args: "",  /// Аргументы
        /// Функция, которая привязана к команде
        handler: (player, args) => {
            timer.throwError();
        }
    },
}