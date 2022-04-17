"use strict";

let parts = [
    {
        name: "Head",
        id: 31086,
        size: 0.4
    },
    {
        name: "Left_Clavicle",
        id: 64729,
        size: 0.25
    },
    {
        name: "Right_Clavicle",
        id: 10706,
        size: 0.25
    },
    {
        name: "Upper_Arm Right",
        id: 40269,
        size: 0.25
    },
    {
        name: "Upper_Arm Left",
        id: 45509,
        size: 0.25
    },
    {
        name: "Lower_Arm Right",
        id: 28252,
        size: 0.25
    },
    {
        name: "Lower_Arm Left",
        id: 61163,
        size: 0.25
    },
    {
        name: "Spine_1",
        id: 24816,
        size: 0.25
    },
    {
        name: "Spine_3",
        id: 24818,
        size: 0.25
    },
    {
        name: "Right_Tigh",
        id: 51826,
        size: 0.25
    },
    {
        name: "Left_Tigh",
        id: 58271,
        size: 0.25
    },
    {
        name: "Right_Calf",
        id: 36864,
        size: 0.25
    },
    {
        name: "Left_Calf",
        id: 63931,
        size: 0.25
    },
    {
        name: "Right_Foot",
        id: 52301,
        size: 0.25
    },
    {
        name: "Left_Foot",
        id: 14201,
        size: 0.25
    },
    ];


mp.events.add("characterInit.done", () => {
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
});

mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    if (targetEntity && targetEntity.type === 'player' && mp.players.exists(targetEntity)) {
        let boneName = getHitBone(targetPosition, targetEntity);
        if (boneName != null) {
            //mp.chat.debug(boneName);
            mp.events.callRemote("playerDamaged", targetEntity.remoteId, boneName);
        }
    }
});

let getHitBone = (position, target) => {
    let minDistance = 10;
    let targetBone = null;

    parts.forEach((part) => {
        let bonePos = target.getBoneCoords(part.id, 0.0, 0.0, 0.0);
        let newDistance =  mp.game.system.vdist(bonePos.x, bonePos.y, bonePos.z, position.x, position.y, position.z);
        //mp.chat.debug("newDistance" + newDistance);
        if (newDistance < minDistance) {
            minDistance = newDistance;
            targetBone = part;
        }
    });
    //mp.chat.debug(JSON.stringify(targetBone));
    if (targetBone != null) {
        if (!target.vehicle) {
            if (minDistance < targetBone.size) {
                return targetBone.name;

            } else {
                return "Spine_1";
            }

        } else {
            if (minDistance < targetBone.size + 0.4) {
                return targetBone.name;
            } else {
                return null;
            }
        }
    } else {
        if (!target.vehicle) {
            return "Spine_1";
        } else {
            return null;
        }
    }
}
