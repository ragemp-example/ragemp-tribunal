"use strict";

mp.peaceZones = {
    id: null,
    //interiors: [60418], // интерьеры в ЗЗ
    //ignoreFactions: [2, 3, 4],
};

let addPeaceZoneInfo = {
    x1: null,
    y1: null,
    z1: null,
    x2: null,
    y2: null,
    z2: null
}
let firstMarker = null;
let firstHelpMarkers = [];
let secondMarker = null;
let secondHelpMarkers = [];

mp.events.add({
    "peaceZones.inside": (id) => {
        mp.peaceZones.id = id;
    },
    "peaceZones.removed": (id) => {
        if (mp.peaceZones.id === id) {
            mp.peaceZones.id = null;
        }
    },
    "render": () => {
        let canHitTree = mp.woodman.treePos && mp.woodman.isAxInHands();
        if (mp.peaceZones.id != null && !canHitTree && !mp.factions.isStateFaction(mp.players.local.getVariable('factionId'))) {
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
            mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2
        }
    },
    "peaceZones.add": () => {
        if (addPeaceZoneInfo.x1 == null) {
            addPeaceZoneInfo.x1 = mp.players.local.position.x;
            addPeaceZoneInfo.y1 = mp.players.local.position.y;
            addPeaceZoneInfo.z1 = mp.players.local.position.z;

            let firstMarkerPos = new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z);
            firstMarker = mp.markers.new(0, firstMarkerPos, 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: mp.players.local.dimension
                });

            let firstHelpMarkersPos = [
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z + 1),
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z - 1),
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y + 1, mp.players.local.position.z),
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y - 1, mp.players.local.position.z),
                new mp.Vector3(mp.players.local.position.x + 1, mp.players.local.position.y, mp.players.local.position.z),
                new mp.Vector3(mp.players.local.position.x - 1, mp.players.local.position.y, mp.players.local.position.z),
            ];

            for (let i = 0; i < firstHelpMarkersPos.length; i++) {
                firstHelpMarkers.push(mp.markers.new(0, firstHelpMarkersPos[i], 1,
                    {
                        direction: new mp.Vector3(0, 0, 0),
                        rotation: new mp.Vector3(0, 0, 0),
                        color: [0, 255, 255, 255],
                        visible: true,
                        dimension: mp.players.local.dimension
                    }));
            }

            mp.notify.info("Введите команду еще раз, что бы добавить точку, где зона будет кончаться", "Создание PeaceZone");
        }
        else if (addPeaceZoneInfo.x2 == null) {
            addPeaceZoneInfo.x2 = mp.players.local.position.x;
            addPeaceZoneInfo.y2 = mp.players.local.position.y;
            addPeaceZoneInfo.z2 = mp.players.local.position.z;

            let secondMarkerPos = new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z);
            secondMarker = mp.markers.new(0, secondMarkerPos, 1,
                {
                    direction: new mp.Vector3(0, 0, 0),
                    rotation: new mp.Vector3(0, 0, 0),
                    color: [0, 255, 0, 255],
                    visible: true,
                    dimension: mp.players.local.dimension
                });

            let secondHelpMarkersPos = [
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z + 1),
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z - 1),
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y + 1, mp.players.local.position.z),
                new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y - 1, mp.players.local.position.z),
                new mp.Vector3(mp.players.local.position.x + 1, mp.players.local.position.y, mp.players.local.position.z),
                new mp.Vector3(mp.players.local.position.x - 1, mp.players.local.position.y, mp.players.local.position.z),
            ];

            for (let i = 0; i < secondHelpMarkersPos.length; i++) {
                secondHelpMarkers.push(mp.markers.new(0, secondHelpMarkersPos[i], 1,
                    {
                        direction: new mp.Vector3(0, 0, 0),
                        rotation: new mp.Vector3(0, 0, 0),
                        color: [0, 255, 255, 255],
                        visible: true,
                        dimension: mp.players.local.dimension
                    }));
            }

            mp.notify.info("Введите команду еще раз, что бы закончить создание зеленой зоны", "Создание PeaceZone");
        }
        else {
            mp.events.callRemote("peaceZones.add", JSON.stringify({
                x: Math.min(addPeaceZoneInfo.x1, addPeaceZoneInfo.x2),
                y: Math.min(addPeaceZoneInfo.y1, addPeaceZoneInfo.y2),
                z: Math.min(addPeaceZoneInfo.z1, addPeaceZoneInfo.z2),
                dx: Math.max(addPeaceZoneInfo.x1, addPeaceZoneInfo.x2) - Math.min(addPeaceZoneInfo.x1, addPeaceZoneInfo.x2),
                dy: Math.max(addPeaceZoneInfo.y1, addPeaceZoneInfo.y2) - Math.min(addPeaceZoneInfo.y1, addPeaceZoneInfo.y2),
                dz: Math.max(addPeaceZoneInfo.z1, addPeaceZoneInfo.z2) - Math.min(addPeaceZoneInfo.z1, addPeaceZoneInfo.z2)
            }));
            mp.notify.info("Зеленая зона создана", "Создание PeaceZone");
            addPeaceZoneInfo = {
                x1: null,
                y1: null,
                z1: null,
                x2: null,
                y2: null,
                z2: null
            }
            if (firstMarker != null) firstMarker.destroy();
            for (let i = 0; i < firstHelpMarkers.length; i++) {
                firstHelpMarkers[i].destroy();
            }
            if (secondMarker != null) secondMarker.destroy();
            for (let i = 0; i < secondHelpMarkers.length; i++) {
                secondHelpMarkers[i].destroy();
            }
            firstMarker = null;
            firstHelpMarkers = [];
            secondMarker = null;
            secondHelpMarkers = [];
        }

    },
    "peaceZones.addClose": () => {
        addPeaceZoneInfo = {
            x1: null,
            y1: null,
            z1: null,
            x2: null,
            y2: null,
            z2: null
        }

        if (firstMarker != null) firstMarker.destroy();
        for (let i = 0; i < firstHelpMarkers.length; i++) {
            firstHelpMarkers[i].destroy();
        }
        if (secondMarker != null) secondMarker.destroy();
        for (let i = 0; i < secondHelpMarkers.length; i++) {
            secondHelpMarkers[i].destroy();
        }
        firstMarker = null;
        firstHelpMarkers = [];
        secondMarker = null;
        secondHelpMarkers = [];

        mp.notify.info("Создание зеленой зоны отменено", "Создание PeaceZone");
    },
    "peaceZones.remove": () => {
        mp.events.callRemote("peaceZones.remove", JSON.stringify(mp.peaceZones.id));
    },
});
