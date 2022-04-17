"use strict";
let fs = require('fs');
let path = require('path');
/// Модуль для взаимодействия со всеми экономическими показателями на сервере

let economicIndicators = [];
module.exports = {
    async init() {
        console.log("[ECONOMY] load economic indicators...");

        economicIndicators = await db.Models.EconomicIndicator.findAll();
        
        for (let file of fs.readdirSync(path.dirname(__dirname))) {
            if (file != 'base' && !ignoreModules.includes(file) && fs.existsSync(path.dirname(__dirname) + "/" + file + '/index.js'))
            {
                let objects = require('../' + file + '/index');
                for (const key in objects) {
                    if (typeof objects[key] == "number" ||
                        typeof objects[key] == "string" ||
                        typeof objects[key] == "boolean") {
                            let economicIndicator = economicIndicators.find(elem => elem.type == `${file}.${key}`);
                            if (economicIndicator == null) {
                                let economicIndicator = await db.Models.EconomicIndicator.create({
                                    type: `${file}.${key}`,
                                    name: `${file}.${key}`,
                                    description: "",
                                    value: objects[key] + ""
                                });
                                economicIndicators.push(economicIndicator);
                            }
                            else {
                                if (typeof objects[key] == "number") objects[key] = parseFloat(economicIndicator.value);
                                if (typeof objects[key] == "string") objects[key] = economicIndicator.value;
                                if (typeof objects[key] == "boolean") objects[key] = economicIndicator.value == "true";
                            }
                    }
                }
            }
        }

        mp.events.call("economy.done");

        console.log("[ECONOMY] economic indicators loaded.");
    },
    getByModuleName(moduleName) {
        return economicIndicators.filter(elem => elem.type.split(".")[0] == moduleName);
    },
    getAll() {
        return economicIndicators;
    },
    /// Функция смены значения по типу
    setByType(array, withoutEvent = false) {
        array.forEach(element => {
            let economicIndicator = economicIndicators.find( x => x.type == element.type);
            economicIndicator.value = element.value;
            let type = economicIndicator.type.split(".");
            let moduleEconomicIndicators = require('../' + type[0] + '/index');

            if (typeof moduleEconomicIndicators[type[1]] == "number") moduleEconomicIndicators[type[1]] = parseFloat(economicIndicator.value);
            if (typeof moduleEconomicIndicators[type[1]] == "string") moduleEconomicIndicators[type[1]] = economicIndicator.value;
            if (typeof moduleEconomicIndicators[type[1]] == "boolean") moduleEconomicIndicators[type[1]] = economicIndicator.value == "true";
            
            economicIndicator.save();
        });
        if (!withoutEvent) {
            mp.events.call("economy.updated");
        }
    }
}