/// Пример создания NPC

mp.events.add("NPC.create", (data) => {
    let ped = mp.peds.new(mp.game.joaat(data.model), new mp.Vector3(data.position.x, data.position.y, data.position.z), data.heading, data.position.d ? data.position.d : 0);

    if (data.defaultScenario) {
        ped.defaultScenario = data.defaultScenario;
        ped.taskStartScenarioInPlace(data.defaultScenario, 0, false);
    }

    if (data.marker) {
        mp.markers.new(1, new mp.Vector3(data.marker.x, data.marker.y, data.marker.z), 0.4, {
            direction: new mp.Vector3(data.marker.x, data.marker.y, data.marker.z),
            rotation: 0,
            color: data.marker.color,
            visible: true,
            dimension: 0
        });
        let shape = mp.colshapes.newSphere(data.marker.x, data.marker.y, data.marker.z + 1, 0.7);
        shape.pos = new mp.Vector3(data.marker.x, data.marker.y, data.marker.z);
        shape.isNPC = true;
        shape.NPCid = ped.id;
        if (data.marker.enterEvent) {
            shape.NPCenterEvent = data.marker.enterEvent;
        }
        if (data.marker.leaveEvent) {
            shape.NPCleaveEvent = data.marker.leaveEvent;
        }
    }
    if (data.blip) {
        mp.blips.new(data.blip.sprite, data.blip.position, {
            name: data.blip.name,
            color: data.blip.color,
            shortRange: 10,
        });
    }
});

mp.events.add("playerEnterColshape", (shape) => {
    if (shape.isNPC && shape.NPCenterEvent) {
        mp.events.call(shape.NPCenterEvent);
    }
});

mp.events.add("playerExitColshape", (shape) => {
    if (shape.isNPC && shape.NPCleaveEvent) {
        mp.events.call(shape.NPCleaveEvent);
    }
});


mp.events.add("entityStreamIn", (entity) => {
    if (entity.type == 'ped') {
        if (entity.defaultScenario) {
            entity.taskStartScenarioInPlace(entity.defaultScenario, 0, false);
        }
    }
});
