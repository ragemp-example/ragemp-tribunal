"use strict";
var weatherInfoLoaded;
var currentWeather = {}; // поля: summary, temperature, icon

mp.events.add('weather.info.update', (weather) => {
    currentWeather = weather;
    weatherInfoLoaded = true;
    mp.events.call("hud.setData", {
        temperature: parseInt(weather.temperature),
        weather: weather.icon
    });
});

mp.events.add('weather.set', (weather) => {
    mp.game.gameplay.setWeatherTypeNowPersist(weather);
});