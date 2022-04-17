const materials = require('./index');
let factions;
let notify;
let vehicles;
let prompt;

module.exports = {
    'init': () => {
        materials.init();

        vehicles = call('vehicles');
        factions = call('factions');
        notify = call('notifications');
        prompt = call('prompt');
    },
    'playerEnterVehicle': (player, vehicle, seat) => {
        if (!vehicle.getVariable('mwVehicle')) return;
        if (!factions.isCrimeFaction(player.character.factionId)) {
            player.removeFromVehicle();
            return notify.error(player, 'Вы не состоите в банде/мафии');
        }

        if (vehicle.key === 'mwboat') {
            materials.onEnterBoat(player);
            if (vehicle.materialBoxes >= 1) {
                let driver = vehicles.getDriver(vehicle);
                if (driver) {
                    driver.call('materialWar.blip.trucks.add', [materials.trucksPoint]);
                }
            }
        } else if (vehicle.key === 'mwtruck') {
            // materials.onEnterTruck(player);
            if (vehicle.materialBoxes >= 1) {
                let driver = vehicles.getDriver(vehicle);
                if (driver) {
                    const faction = factions.getFaction(driver.character.factionId);
                    const factionPoint = {
                        x: faction.wX,
                        y: faction.wY,
                        z: faction.wZ
                    }
                    driver.call('materialWar.blip.faction.add', [factionPoint]);
                    notify.info(driver, 'Направляйтесь во фракицю');
                }
            }
        }
    },
    'playerExitVehicle': (player, vehicle) => {
        if (!vehicle.getVariable('mwVehicle')) return;
        if (vehicle.key === 'mwboat') {
            materials.onExitBoat(player);
            prompt.showByName(player, 'materials_box_take');
        } else if (vehicle.key === 'mwtruck') {
            // materials.onExitTruck(player);
            prompt.showByName(player, 'materials_box_take');
        }
    },
    "materialWar.box.put": (player, vehicleId) => {
        if (!player.hasAttachment("materialsBox")) return notify.error(player, 'У вас нет ящика');
        if (!factions.isCrimeFaction(player.character.factionId)) return notify.error(player, `Вы не в банде/мафии`);

        let vehicle = mp.vehicles.at(vehicleId);
        if (!vehicle) return notify.error(player, 'Транспорт не найден');
        if (!vehicle.materialBoxes) vehicle.materialBoxes = 0;

        if (vehicle.materialBoxes === materials.vehicleMaxBox)
            return notify.error(player, 'В транспорте закончилось место');

        vehicle.materialBoxes += 1;
        player.addAttachment('materialsBox', true);

        vehicle.setVariable('label', `Ящиков: ~y~${vehicle.materialBoxes} шт.`);
        prompt.hide(player);
    },
    "materialWar.box.takeFromVeh": (player, vehicleId) => {
        if (!player.character) return;
        if (!factions.isCrimeFaction(player.character.factionId)) return notify.error(player, `Вы не в банде/мафии`);

        if (player.hasAttachment("materialsBox")) return notify.error(player, 'У вас есть ящик');

        let vehicle = mp.vehicles.at(vehicleId);
        if (!vehicle) return notify.error(player, 'Транспорт не найден');

        if (!vehicle.materialBoxes) return notify.error(player, `В транспорте нет ящиков`);
        vehicle.materialBoxes -= 1;

        player.addAttachment('materialsBox');

        vehicle.setVariable('label', `Ящиков: ~y~${vehicle.materialBoxes} шт.`);
        prompt.hide(player);
    },
    "materialWar.box.putInFaction": (player) => {
        if (!player.character) return;
        const faction = factions.getFaction(player.character.factionId);
        if (!factions.isCrimeFaction(faction)) return;

        if (materials.results[faction.name]) materials.results[faction.name]++;
        else materials.results[faction.name] = 1;

        const sum = Object.values(materials.results).reduce((p, c) => p + c);

        if (sum === materials.maxBoxCount) materials.end();
    }
}