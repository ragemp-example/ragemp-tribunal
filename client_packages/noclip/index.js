/// credits to Morbo
let getNormalizedVector = function(vector) {
    let mag = Math.sqrt(
        vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
    );
    vector.x = vector.x / mag;
    vector.y = vector.y / mag;
    vector.z = vector.z / mag;
    return vector;
};
let getCrossProduct = function(v1, v2) {
    let vector = new mp.Vector3(0, 0, 0);
    vector.x = v1.y * v2.z - v1.z * v2.y;
    vector.y = v1.z * v2.x - v1.x * v2.z;
    vector.z = v1.x * v2.y - v1.y * v2.x;
    return vector;
};
let bindVirtualKeys = {
    F2: 0x71
};
let bindASCIIKeys = {
    Q: 69,
    E: 81,
    LCtrl: 17,
    Shift: 16
};

let isNoClip = false;
let noClipCamera;
let shiftModifier = false;
let controlModifier = false;
let localPlayer = mp.players.local;

mp.events.add('characterInit.done', () => {
    mp.keys.bind(bindVirtualKeys.F2, true, function() {

        //mp.game.ui.displayRadar(!isNoClip);
        if (!isNoClip) {
            if (!mp.adminLevel) return;
            startNoClip();
            isNoClip = !isNoClip;
        } else {
            stopNoClip();
            isNoClip = !isNoClip;
        }
    });
});

function startNoClip() {
    //mp.game.graphics.notify('NoClip ~g~activated');
    mp.notify.success('Режим полета включен', 'Fly mode');
    let camPos = new mp.Vector3(
        localPlayer.position.x,
        localPlayer.position.y,
        localPlayer.position.z
    );
    let camRot = mp.game.cam.getGameplayCamRot(2);
    noClipCamera = mp.cameras.new('default', camPos, camRot, 45);
    noClipCamera.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
    localPlayer.freezePosition(true);
    localPlayer.setInvincible(true);
    localPlayer.setVisible(false, false);
    localPlayer.setCollision(false, false);
}

function stopNoClip() {
    //mp.game.graphics.notify('NoClip ~r~disabled');
    mp.notify.success('Режим полета отключен', 'Fly mode');
    if (noClipCamera) {
        localPlayer.position = noClipCamera.getCoord();
        localPlayer.setHeading(noClipCamera.getRot(2).z);
        noClipCamera.destroy(true);
        noClipCamera = null;
    }
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
    localPlayer.freezePosition(false);
    localPlayer.setInvincible(false);
    localPlayer.setVisible(true, false);
    localPlayer.setCollision(true, false);
}
mp.events.add('render', function() {
    var start = Date.now();
    if (!noClipCamera || mp.gui.cursor.visible) {
        return;
    }
    controlModifier = mp.keys.isDown(bindASCIIKeys.LCtrl);
    shiftModifier = mp.keys.isDown(bindASCIIKeys.Shift);
    let rot = noClipCamera.getRot(2);
    let fastMult = 1;
    let slowMult = 1;
    if (shiftModifier) {
        fastMult = 3;
    } else if (controlModifier) {
        slowMult = 0.5;
    }
    let rightAxisX = mp.game.controls.getDisabledControlNormal(0, 220);
    let rightAxisY = mp.game.controls.getDisabledControlNormal(0, 221);
    let leftAxisX = mp.game.controls.getDisabledControlNormal(0, 218);
    let leftAxisY = mp.game.controls.getDisabledControlNormal(0, 219);
    let pos = noClipCamera.getCoord();
    let rr = noClipCamera.getDirection();
    let vector = new mp.Vector3(0, 0, 0);
    vector.x = rr.x * leftAxisY * fastMult * slowMult;
    vector.y = rr.y * leftAxisY * fastMult * slowMult;
    vector.z = rr.z * leftAxisY * fastMult * slowMult;
    let upVector = new mp.Vector3(0, 0, 1);
    let rightVector = getCrossProduct(
        getNormalizedVector(rr),
        getNormalizedVector(upVector)
    );
    rightVector.x *= leftAxisX * 0.5;
    rightVector.y *= leftAxisX * 0.5;
    rightVector.z *= leftAxisX * 0.5;
    let upMovement = 0.0;
    if (mp.keys.isDown(bindASCIIKeys.Q)) {
        upMovement = 0.5;
    }
    let downMovement = 0.0;
    if (mp.keys.isDown(bindASCIIKeys.E)) {
        downMovement = 0.5;
    }
    mp.players.local.position = new mp.Vector3(
        pos.x + vector.x + 1,
        pos.y + vector.y + 1,
        pos.z + vector.z + 1
    );
    mp.players.local.heading = rr.z;
    noClipCamera.setCoord(
        pos.x - vector.x + rightVector.x,
        pos.y - vector.y + rightVector.y,
        pos.z - vector.z + rightVector.z + upMovement - downMovement
    );
    noClipCamera.setRot(
        rot.x + rightAxisY * -5.0,
        0.0,
        rot.z + rightAxisX * -5.0,
        2
    );
    if (mp.renderChecker) mp.utils.drawText2d(`noclip rend: ${Date.now() - start} ms`, [0.8, 0.63]);
});
