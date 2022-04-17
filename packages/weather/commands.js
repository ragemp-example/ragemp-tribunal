let weather = require('./index.js');

module.exports = {
    '/gettemp': {
        args: '',
        description: 'Узнать текущую температуру',
        access: 6,
        handler: (player, args, out) => {
            let temp = weather.getCurrentWeather().temperature;
            out.info(`Температура: ${temp}`, player);
        }
    },
    '/settemp': {
        args: '[градусы]',
        description: 'Установить кастомную температуру',
        access: 6,
        handler: (player, args, out) => {
            weather.setCustomTemperature(parseInt(args[0]));
            out.info(`${player.name} установил температуру ${args[0]} градусов`);
        }
    },
    '/resettemp': {
        args: '',
        description: 'Возобновить обновление температуры',
        access: 6,
        handler: (player, args, out) => {
            weather.resetCustomTemperature();
            out.info(`${player.name} возобновил обновление температуры`);
        }
    }
}