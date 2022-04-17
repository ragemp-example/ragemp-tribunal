mp.game.graphics.transitionFromBlurred(500);

let controlsDisabled = false;
let isOpen = false;
let currentType;
let carPassList = [];

mp.events.add('documents.show', (type, data) => {
    if (isOpen) return;
    mp.timer.add(() => {
        isOpen = true;
    }, 500);
    controlsDisabled = true;
    mp.game.graphics.transitionToBlurred(500);
    mp.busy.add('docs', true);
    mp.events.call("prompt.showByName", 'documents_close');

    currentType = type;
    if (type == 'mainDocuments') {
        let issued = new Date(data.idCard.issued);
        let expires = new Date(issued.getTime());
        expires.setFullYear(expires.getFullYear() + 10);
        data.idCard.issued = new Intl.DateTimeFormat('ru-RU').format(issued);
        data.idCard.expires = new Intl.DateTimeFormat('ru-RU').format(expires);
        mp.callCEFV(`documents.setIDCard(${JSON.stringify(data.idCard)})`);
        if (data.medCard) {
            data.medCard.show = true;
            data.medCard.sign = generateSign(data.medCard.memberName)
            data.medCard.expires = new Intl.DateTimeFormat('ru-RU').format(new Date(data.medCard.expires));
            mp.callCEFV(`documents.setMedCard(${JSON.stringify(data.medCard)})`);
        }
        if (data.licensesCard) {
            data.licensesCard.show = true;
            let classes = [];
            if (data.licensesCard.carLicense) {
                classes.push('B');
            }
            if (data.licensesCard.bikeLicense) {
                classes.push('A');
            }
            if (data.licensesCard.truckLicense) {
                classes.push('C');
            }
            if (data.licensesCard.passengerLicense) {
                classes.push('D');
            }
            if (data.licensesCard.boatLicense) {
                classes.push('WATER');
            }
            if (data.licensesCard.airLicense) {
                classes.push('SKY');
            }
            data.licensesCard.carClasses = classes;
            mp.callCEFV(`documents.setLicensesCard(${JSON.stringify(data.licensesCard)})`);
        }
        mp.callCEFV(`documents.active = 'idCard'`);
        mp.callCEFV('documents.show = true');
    }

    if (type == 'governmentBadge') {
        mp.callCEFV(`governmentBadge.setData(${JSON.stringify(data)})`);
        mp.callCEFV('governmentBadge.show = true');
    }
});

mp.events.add('documents.close', (type, data) => {
    if (!isOpen) return;
    mp.timer.add(() => {
        isOpen = false;
    }, 500);

    switch (currentType) {
        case 'governmentBadge':
            mp.callCEFV('governmentBadge.show = false');
            break;
        case 'mainDocuments':
            mp.callCEFV('documents.show = false');
            break;
    }

    mp.game.graphics.transitionFromBlurred(500);
    mp.busy.remove('docs');
    mp.events.call("prompt.hide");
    controlsDisabled = false;
});

mp.keys.bind(0x1B, false, function () {
    if (mp.game.ui.isPauseMenuActive()) return;
    if (!isOpen) return;
    mp.events.call('documents.close');
});


mp.events.add('render', () => {
    if (controlsDisabled) {
        mp.game.controls.disableControlAction(1, 200, true);
    }
});

mp.events.add('documents.list', () => {
    mp.callCEFV('interactionMenu.menu = cloneObj(interactionMenu.menus["player_docs"])');

    let left = mp.getDefaultInteractionLeft();
    mp.callCEFV(`interactionMenu.left = ${left}`);
    mp.events.call('interaction.menu.show');


});

mp.events.add('documents.showTo', (type) => {
    let target;
    let personal = mp.getPersonalInteractionEntity();
    if (personal) {
        target = personal;
    } else {
        target = mp.getCurrentInteractionEntity();
    }

    if (!target) return;
    if (target.type != 'player') return;

    switch (type) {
        case "governmentBadge":
            mp.events.call('documents.offer', "governmentBadge", target.remoteId);
            break;
        case "mainDocuments":
            mp.events.call('documents.offer', "mainDocuments", target.remoteId);
            break;
    }
});

mp.events.add('documents.offer', (type, id, data) => {
    mp.events.callRemote('documents.offer', type, id, data);
});


mp.events.add('documents.carPass.list', () => {
    mp.events.callRemote('documents.carPass.list');
});

mp.events.add('documents.carPass.list.show', (list) => {
    carPassList = list;
    if (!carPassList) return;
    let left = mp.getDefaultInteractionLeft();
    mp.callCEFV(`interactionMenu.left = ${left}`);
    mp.callCEFV('interactionMenu.menu = cloneObj(interactionMenu.menus["carPass_list"])');
    carPassList.forEach((current) => {
        mp.callCEFV(`interactionMenu.menu.items.push({
            text: "Т/С: ${current.plate}",
            icon: "car.png"
        });`);
    });
    mp.events.call('interaction.menu.show');
});

mp.events.add('documents.carPass.list.choose', (plate) => {
    for (let i = 0; i < carPassList.length; i++) {
        if (carPassList[i].plate == plate) {
            let target;
            let personal = mp.getPersonalInteractionEntity();
            if (personal) {
                target = personal;
            } else {
                target = mp.getCurrentInteractionEntity();
            }
            if (target.type != 'player') return;
            mp.events.callRemote('documents.offer', "carPass", target.remoteId, JSON.stringify(carPassList[i]));
        }
    }
});

function dateFormatter(date, symbolType = 0) {
    let c = '/';
    if (symbolType) c = '.';
    if (!date) return `11${c}09${c}2001`;
    date = date.split('-');
    let newDate = `${date[2]}${c}${date[1]}${c}${date[0]}`;
    return newDate;
}

function generateSign(name) {
    let arr = name.split(' ');
    return `${arr[0].charAt(0)}.${arr[1]}`;
}