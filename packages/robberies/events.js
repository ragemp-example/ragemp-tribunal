const robberies = require('./index');
const houses = call('houses');
const factions = call('factions');
const notifs = call('notifications');
const inventory = call('inventory');
const vehicles = call('vehicles');
const bizes = call('bizes');
const money = call('money');
const prompt = call('prompt');
const police = call('police');
const utils = call('utils');
const timer = call('timer');

module.exports = {
    "init": () => {
        robberies.init();
        inited(__dirname);
    },
    "robberies.start": (player, isHouse, id) => {
        let header = 'Ограбление';
        if (!player.character) return;
        if (!factions.isBandFaction(player.character.factionId) && !factions.isMafiaFaction(player.character.factionId))
            return notifs.error(player, 'Ограбления доступны только криминальным структурам', header);

        let hours = utils.getMoscowHours();
        if (hours < 14 && hours >= 1) return notifs.error(player, 'Ограбления доступны только только с 14:00 по 00:59 МСК', header);

        let canRob = robberies.canPlaceBeRobbed(isHouse, id);
        if (!canRob.result) return notifs.error(player, canRob.info, header);
        let place;
        if (isHouse) {
            place = houses.getHouseById(id);
        } else {
            place = bizes.getBizById(id);
        }
        if (!place) return;

        let info = {
            pos: isHouse ? houses.getRobberyColshapeByInteriorId(place.info.interiorId) : new mp.Vector3(place.info.x, place.info.y, place.info.z),
            dimension: isHouse ? id : 0,
            isHouse: isHouse,
            placeId: id
        }
        robberies.createRobberyColshape(info);
        isHouse && mp.events.call('house.robbery.start', id);
        notifs.info(player, `У вас есть ${Math.round(robberies.robberyDestroyTime / (1000 * 60))} мин., чтобы вынести вещи из ${isHouse ? 'дома' : 'бизнеса'}`, header);

        timer.add(() => {
            let chance = isHouse ? robberies.houseAlarmChance : robberies.bizAlarmChance;
            let rand = Math.random();
            if (rand <= chance) {
                mp.players.exists(player) && notifs.warning(player, 'Сработала сигнализация!', header);
                police.notifyCopsAboutRobbery(isHouse, id, isHouse ?
                    new mp.Vector3(place.info.pickupX, place.info.pickupY, place.info.pickupZ) :
                    new mp.Vector3(place.info.x, place.info.y, place.info.z));
            }
        }, 1000 * robberies.alarmTime);
    },
    "playerEnterColshape": (player, shape) => {
        if (shape.hasOwnProperty('robberyInfo')) {
            player.call('robberies.shape.enter', [true]);
            player.currentRobberyInfo = shape.robberyInfo;
        }
        if (shape.isRobberyBuyer) {
            if (player.hasAttachment("robberyBox")) {
                let content = player.robberyBoxContent;
                if (!content) return;
                let {name, price} = content;
                player.robberyBoxContent = null;
                player.addAttachment('robberyBox', true);
                money.addCash(player, price, function (result) {
                    if (result) {
                        notifs.success(player, `Вы продали ${name}`);
                    }
                }, 'Продажа краденного');
            } else {
                prompt.show(player, 'Возьмите ящик и принесите скупщику');
            }
        }
    },
    "playerExitColshape": (player, shape) => {
        if (shape.hasOwnProperty('robberyInfo')) {
            player.call('robberies.shape.enter', [false]);
            player.currentRobberyInfo = null;
        }
    },
    "robberies.box.take": (player) => {
        let {placeId, isHouse} = player.currentRobberyInfo;
        if (!placeId) return;
        if (!factions.isBandFaction(player.character.factionId) && !factions.isMafiaFaction(player.character.factionId)) return notifs.error(player, 'Это доступно только бандитам');

        let robbery = robberies.activeRobberies.find(x => x.placeId === placeId && x.isHouse === isHouse);
        if (!robbery) return;

        if (player.hasAttachment('robberyBox')) return notifs.error(player, 'Вы уже взяли коробку');
        if (inventory.getHandsItem(player)) return notifs.error(player, `Освободите руки`);

        if (player.lastRobberyBoxPickTime) {
            let now = new Date();
            let diff = (now - player.lastRobberyBoxPickTime) / 1000;
            if (diff < robberies.boxPickTime) {
                return notifs.error(player, `Ожидайте ${Math.ceil(robberies.boxPickTime - diff)} сек`);
            }
        }

        let box = robbery.boxes.pop();
        if (!box) return notifs.error(player, 'Предметы закончились');
        player.lastRobberyBoxPickTime = new Date();

        player.addAttachment('robberyBox');
        player.robberyBoxContent = box;
        robberies.updateRobberyLabel(robbery);
        player.call('robberies.box.taken');
    },
    "robberies.box.update": (player) => {
        player.addAttachment('robberyBox', true);
        player.addAttachment('robberyBox');
    },
    "robberies.box.put": (player, vehicleId) => {
        if (!player.hasAttachment("robberyBox") || !player.robberyBoxContent) return notifs.error(player, 'У вас нет коробки');
        if (!factions.isBandFaction(player.character.factionId) && !factions.isMafiaFaction(player.character.factionId))
            return notifs.error(player, `Вы не в банде/мафии`);

        let vehicle = mp.vehicles.at(vehicleId);
        if (!vehicle) return notifs.error(player, 'Машина не найдена');
        if (vehicle.key !== 'faction' || vehicle.owner !== player.character.factionId) return notifs.error(player, `Это автомобиль не вашей организации`);
        if (!vehicle.robberyBoxes) vehicle.robberyBoxes = [];
        if (vehicle.robberyBoxes.length >= robberies.maxBoxesInVehicle) return notifs.error(player, `В автомобиль не поместится больше коробок`);

        vehicle.robberyBoxes.push(player.robberyBoxContent);
        player.robberyBoxContent = null;
        player.addAttachment('robberyBox', true);

        if (vehicle.robberyBoxes.length === 1) {
            let driver = vehicles.getDriver(vehicle);
            if (driver) driver.call('robberies.destination.create');
        }
        vehicle.setVariable('label', `Предметы: ~y~${vehicle.robberyBoxes.length} шт.`);

        if (vehicle.robberyBoxes.length >= robberies.maxBoxesInVehicle) notifs.success(player, 'Машина заполнена, отвезите ее на пункт продажи и разгрузите');
    },
    "robberies.box.takeFromVeh": (player, vehicleId) => {
        if (!player.character) return;
        if (!factions.isBandFaction(player.character.factionId) && !factions.isMafiaFaction(player.character.factionId)) return;

        if (player.hasAttachment("robberyBox")) return notifs.error(player, 'У вас есть коробка');

        let vehicle = mp.vehicles.at(vehicleId);
        if (!vehicle) return notifs.error(player, 'Машина не найдена');

        if (vehicle.key !== 'faction' || vehicle.owner !== player.character.factionId) return notifs.error(player, `Это автомобиль не вашей организации`);
        if (!vehicle.robberyBoxes || !vehicle.robberyBoxes.length) return notifs.error(player, `В автомобиле нет коробок`);

        player.robberyBoxContent = vehicle.robberyBoxes.pop();
        player.addAttachment('robberyBox');

        vehicle.setVariable('label', `Предметы: ~y~${vehicle.robberyBoxes.length} шт.`);

        if (!vehicle.robberyBoxes.length) {
            player.call('robberies.index.update', [null]);
        }
    },
    "playerEnterVehicle": (player, vehicle, seat) => {
        if (!vehicle.robberyBoxes || !vehicle.robberyBoxes.length) return;
        if (seat !== 0 || vehicle.owner !== player.character.factionId) return;
        player.call('robberies.destination.create');
    },
    "playerExitVehicle": (player, vehicle) => {
        if (!player.character) return;
        if (!vehicle.robberyBoxes || vehicle.owner !== player.character.factionId) return;
        player.call('robberies.destination.destroy');
    },
    "characterInit.done": (player) => {
        player.call('robberies.peds.init', [robberies.buyers]);
    }
}