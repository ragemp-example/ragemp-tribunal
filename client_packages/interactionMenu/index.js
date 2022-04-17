"use strict";


// ************** События взаимодействия с меню **************

// Вызов события необходимо прописать в [CEF] interactionMenu.menu.handler(), если в этом есть необходимость.
mp.events.add("interactionMenu.onClick", (menuName, itemName) => {
    var entity = mp.getCurrentInteractionEntity();
    if (menuName == 'player_interaction') {
        if (!entity) return;
        if (entity.type != 'player') return;
        if (itemName == 'Познакомиться') {
            if (mp.familiar.list.includes(entity.name)) return mp.notify.error(`Вы уже знаете ${entity.name}`, `Знакомство`);
            mp.events.callRemote(`familiar.add`, entity.remoteId);
        }
    } else if (menuName == 'faction') {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Пригласить') {
            mp.events.callRemote(`factions.invite.show`, entity.remoteId);
        } else if (itemName == 'Уволить') {
            mp.events.callRemote(`factions.uval`, entity.remoteId);
        } else if (itemName == 'Ранг') {
            mp.events.callRemote(`factions.giverank.show`, entity.remoteId);
        }
    } else if (menuName == "government") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Наручники') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`police.cuffs`, JSON.stringify(data));
        } else if (itemName == 'Обыск') {
            //mp.events.callRemote(`police.inventory.search.start`, entity.remoteId);
        } else if (itemName == 'Освобождение') {
            mp.events.callRemote(`government.unarrest.offer`, entity.remoteId);
        } else if (itemName == 'Следование') {
            mp.events.callRemote(`police.follow`, entity.remoteId);
        } else if (itemName == 'В авто') {
            mp.events.callRemote(`police.vehicle.put`, entity.remoteId);
        } else if (itemName == 'Лиц. на оружие') {
            mp.events.callRemote(`government.licenses.gun.give`, entity.remoteId);
        } else if (itemName == 'Лиц. на транспорт') {
            mp.events.callRemote(`government.licenses.veh.give`, entity.remoteId);
        }
    } else if (menuName == "police") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Наручники') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`police.cuffs`, JSON.stringify(data));
        } else if (itemName == 'Розыск') {
            mp.events.callRemote(`police.wanted`, entity.remoteId);
        } else if (itemName == 'Обыск') {
            mp.events.callRemote(`police.inventory.search.start`, entity.remoteId);
        } else if (itemName == 'Арест') {
            mp.events.callRemote(`police.cells.arrest`, entity.remoteId);
        } else if (itemName == 'Следование') {
            mp.events.callRemote(`police.follow`, entity.remoteId);
        } else if (itemName == 'В авто') {
            mp.events.callRemote(`police.vehicle.put`, entity.remoteId);
        } else if (itemName == 'Снять мешок') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`mafia.bag`, JSON.stringify(data));
        }
    } else if (menuName == "police_gunlicense") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Выдать') {
            mp.events.callRemote(`police.licenses.gun.give`, entity.remoteId);
        } else if (itemName == 'Изъять') {
            mp.events.callRemote(`police.licenses.gun.take`, entity.remoteId);
        }
    } else if (menuName == "fib") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Наручники') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`police.cuffs`, JSON.stringify(data));
        } else if (itemName == 'Розыск') {
            mp.events.callRemote(`police.wanted`, entity.remoteId);
        } else if (itemName == 'Обыск') {
            mp.events.callRemote(`police.inventory.search.start`, entity.remoteId);
        } else if (itemName == 'Арест') {
            mp.events.callRemote(`police.cells.arrest`, entity.remoteId);
        } else if (itemName == 'Следование') {
            mp.events.callRemote(`police.follow`, entity.remoteId);
        } else if (itemName == 'Прослушка') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`fib.spy`, JSON.stringify(data));
        } else if (itemName == 'В авто') {
            mp.events.callRemote(`police.vehicle.put`, entity.remoteId);
        } else if (itemName == 'Снять мешок') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`mafia.bag`, JSON.stringify(data));
        }
    } else if (menuName == "fib_vehicle") {
        if (!entity) return;
        if (entity.type != 'vehicle') return;

        if (itemName == 'Номер') {
            mp.callCEFV(`inputWindow.vehId = ${entity.remoteId}`);
            mp.callCEFV(`inputWindow.showByName('fib_veh_plate')`);
        }
    } else if (menuName == "hospital") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Лечить') {
            mp.events.callRemote(`hospital.healing.show`, entity.remoteId);
        } else if (itemName == 'Реанимировать') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`inventory.item.adrenalin.use`, JSON.stringify(data));
        } else if (itemName == 'Медкарта') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`hospital.medCard.give`, JSON.stringify(data));
        }
    } else if (menuName == "army") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Наручники') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`police.cuffs`, JSON.stringify(data));
        } else if (itemName == 'Следование') {
            mp.events.callRemote(`police.follow`, entity.remoteId);
        } else if (itemName == 'Обыск') {
            mp.events.callRemote(`police.inventory.search.start`, entity.remoteId);
        } else if (itemName == 'В авто') {
            mp.events.callRemote(`police.vehicle.put`, entity.remoteId);
        }
    } else if (menuName == "news") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Эфир') {
            mp.events.callRemote(`news.stream.member`, entity.remoteId);
        }
    } else if (menuName == "band") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Ограбить') {
            if (mp.peaceZones.id != null) return mp.notify.error(`Недоступно в мирной зоне`);
            mp.events.callRemote(`bands.rob`, entity.remoteId);
        } else if (itemName == 'Связать') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`mafia.cuffs`, JSON.stringify(data));
        } else if (itemName == 'Вести') {
            mp.events.callRemote(`mafia.follow`, entity.remoteId);
        } else if (itemName == 'Мешок на голову') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`mafia.bag`, JSON.stringify(data));
        } else if (itemName == 'В авто') {
            mp.events.callRemote(`police.vehicle.put`, entity.remoteId);
        }
    } else if (menuName == "mafia") {
        if (!entity) return;
        if (entity.type != 'player') return;

        if (itemName == 'Продать крышу') {
            mp.callCEFV(`inputWindow.playerId = ${entity.remoteId}`);
            mp.callCEFV(`inputWindow.showByName('mafia_power_sell')`);
        } else if (itemName == 'Ограбить') {
            if (mp.peaceZones.id != null) return mp.notify.error(`Недоступно в мирной зоне`);
            mp.events.callRemote(`bands.rob`, entity.remoteId);
        } else if (itemName == 'Связать') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`mafia.cuffs`, JSON.stringify(data));
        } else if (itemName == 'Вести') {
            mp.events.callRemote(`mafia.follow`, entity.remoteId);
        } else if (itemName == 'Мешок на голову') {
            var data = {
                recId: entity.remoteId
            };
            mp.events.callRemote(`mafia.bag`, JSON.stringify(data));
        } else if (itemName == 'В авто') {
            mp.events.callRemote(`police.vehicle.put`, entity.remoteId);
        }
    } else if (menuName == "vehicle") {
        if (!entity) return;
        if (entity.type != 'vehicle') return;

        if (itemName == 'Взломать') {
            mp.events.callRemote(`animations.playById`, 7412);
            mp.timer.add(() => {
                mp.events.callRemote(`animations.stop`);
                let entity = mp.getCurrentInteractionEntity();
                if (!entity) return;
                if (entity.type !== 'vehicle') return;
                mp.events.callRemote(`bands.vehicle.hack`, entity.remoteId);
            }, 2000);
        }

        if (itemName == 'Ремонт') {
            mp.events.callRemote(`animations.playById`, 7412);
            mp.timer.add(() => {
                mp.events.callRemote(`animations.stop`);
                let entity = mp.getCurrentInteractionEntity();
                if (!entity) return;
                if (entity.type !== 'vehicle') return;
                mp.events.callRemote(`vehicles.kit.repair`, entity.remoteId);
            }, 2000);
        }
    }
});
