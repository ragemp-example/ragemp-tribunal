"use strict";

let weather = {};
weather.isSet = false;

const request = require("request");
const WEATHER_LOADING = true; // Загрузка погоды с сайта
const REQUEST_TIME = 30 * 60 * 1000; // Время повторного запроса в случае ошибки (в мс)
const API_KEY = "dec51824772fb8b5c61f1964fc56370c"; // ключ с darksky.net
const TIME_ZONE = "America/Los_Angeles";
const DEFAULT_SUMMARY = "Ясно";
const DEFAULT_TEMPERATURE = 20;
const DEFAULT_ICON = "clear-day";

let weatherForecast = [];
let customTemperature;

let snowWeatherIsSet = false;

let timer = call('timer');
let utils = call('utils');

let gameWeatherUpdater;

let weatherConfig = {
    'clear-day': 'EXTRASUNNY',
    'clear-night': 'EXTRASUNNY',
    'rain': 'RAIN',
    'snow': 'SNOW',
    'sleet': 'SNOWLIGHT',
    'wind': 'OVERCAST',
    'fog': 'FOGGY',
    'cloudy': 'SMOG',
    'partly-cloudy-day': 'CLOUDS',
    'partly-cloudy-night': 'CLOUDS'
}

module.exports = {
    customWeather: false,
    customWeatherType: 'winter',
    currentWeatherName: 'CLEAR',
    getCurrentWeather() {
        let current = {};
        if (!weather.current) {
            current.summary = DEFAULT_SUMMARY;
            current.temperature = DEFAULT_TEMPERATURE;
            current.icon = DEFAULT_ICON;
        } else {
            Object.assign(current, weather.current);
        }
        if (customTemperature != null) {
            current.temperature = customTemperature;
        }
        return current;
    },

    init() {
        if (WEATHER_LOADING) {
            this.requestWeather();
        } else {
            this.setWeather();
        }

        gameWeatherUpdater = timer.addInterval(() => {
            if (!weather.current) return;
            let weatherName = this.getGameWeatherByIcon(weather.current.icon);
            mp.players.forEach((rec) => {
                rec.call('weather.set', [this.currentWeatherName]);
            });
        }, 60*1000);
    },
    requestWeather() {
        request(
            `https://api.darksky.net/forecast/${API_KEY}/34,-118?exclude=currently,minutely,daily,alerts,flags&lang=ru&units=si`,
            { json: true },
            (err, res, body) => {
                if (err) {
                    this.repeatWeatherRequest();
                    return console.log(err);
                }
                for (var key in body) {
                    if (key == "error") {
                        this.repeatWeatherRequest();
                        return console.log(body.error);
                    }
                }

                try {
                    for (let i = 0; i < 48; i++) {
                        var tzTime = new Date(body.hourly.data[i].time * 1000).toLocaleString("en-US", { timeZone: TIME_ZONE });
                        tzTime = new Date(tzTime);
                        weatherForecast.push({
                            time: tzTime.getHours(),
                            summary: body.hourly.data[i].summary,
                            temperature: body.hourly.data[i].temperature,
                            icon: body.hourly.data[i].icon
                        });
                    }
                } catch (err) {
                    console.log(err);
                    this.repeatWeatherRequest();
                    return;
                }

                console.log("[WEATHER] Данные о погоде загружены с api.darksky.net");
                if (!weather.isSet) {
                    this.setWeather();
                }
            }
        );
    },

    repeatWeatherRequest() {
        if (!weather.isSet) {
            this.setWeather();
        }
        console.log(`[WEATHER] Ошибка загрузки данных о погоде. Повторный запрос через ${REQUEST_TIME / (60 * 1000)} минут...`);
        timer.add(this.requestWeather, REQUEST_TIME);
    },

    getForecastDataByHour(hours) {
        if (this.customWeather) return this.generateCustomWeather(hours);
        let currentWeather = {};

        if (weatherForecast.length == 0) {
            console.log("[WEATHER] Данных о погоде нет, запрашиваем стандартные данные");
            currentWeather.summary = DEFAULT_SUMMARY;
            currentWeather.temperature = DEFAULT_TEMPERATURE;
            currentWeather.icon = DEFAULT_ICON;
            return currentWeather;
        }
        for (let i = 0; i < 48; i++) {
            if (weatherForecast[i].time == hours) {
                currentWeather.summary = weatherForecast[i].summary;
                currentWeather.temperature = weatherForecast[i].temperature;
                currentWeather.icon = weatherForecast[i].icon;
                return currentWeather;
            }
        }
    },
    setWeather() {
        weather.isSet = true;
        let now = new Date();
        weather.current = this.getForecastDataByHour(now.getHours());
        console.log(`[WEATHER] Погода на этот час: ${JSON.stringify(weather.current)}`);
        let weatherName;
        switch (weather.current.icon) {
            case 'clear-day':
            case 'clear-night':
                weatherName = "EXTRASUNNY";
                break;
            case 'rain':
                weatherName = "RAIN";
                break;
            case 'snow':
                if (!snowWeatherIsSet) {
                    weatherName = "XMAS";
                    snowWeatherIsSet = true;
                }
                break;
            case 'sleet':
                weatherName = "XMAS";
                break;
            case 'wind':
                weatherName = "OVERCAST";
                break;
            case 'fog':
                weatherName = "FOGGY";
                break;
            case 'cloudy':
                weatherName = "SMOG";
                break;
            case 'partly-cloudy-day':
            case 'partly-cloudy-night':
                weatherName = "CLOUDS";
                break;
            default:
                weatherName = "SMOG";
                weather.current.icon = 'cloudy';
                break;
        }
        this.currentWeatherName = weatherName;
        mp.world.weather = weatherName;
        let forecast = {};
        Object.assign(forecast, weather.current);
        if (customTemperature != null) forecast.temperature = customTemperature;
        mp.players.forEach((currentPlayer) => {
            currentPlayer.call('weather.info.update', [forecast]);
        });

        timer.add(() => {
            try {
                this.setWeather();
            } catch (err) {
                console.log(err)
            }
        }, (60 - now.getMinutes()) * 60 * 1000);


        console.log(`[WEATHER] Следующее обновление погоды через ${60 - now.getMinutes()} минут`);
    },
    setCustomTemperature(temp) {
        customTemperature = temp;
        mp.players.forEach((currentPlayer) => {
            currentPlayer.call('weather.info.update', [this.getCurrentWeather()]);
        });
    },
    resetCustomTemperature() {
        customTemperature = null;
        mp.players.forEach((currentPlayer) => {
            currentPlayer.call('weather.info.update', [this.getCurrentWeather()]);
        });
    },
    getGameWeatherByIcon(icon) {
        let weather = weatherConfig[icon];
        if (!weather) return 'SMOG';
        return weather;
    },
    generateCustomWeather(hours) {
        let weather = {};
        switch (this.customWeatherType) {
            case 'winter':
            weather.summary = 'Снег';
            if (hours > 6 && hours < 23) {
                weather.temperature = utils.randomInteger(-10, -5);
            } else {
                weather.temperature = utils.randomInteger(-15, -10);
            }
            weather.icon = 'snow';
            return weather;
        }
    }
}
