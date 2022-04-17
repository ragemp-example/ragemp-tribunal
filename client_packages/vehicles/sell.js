let isInPrivateVehicle = false;

let carSellData = {
    id: null,
    price: null
};

mp.vehicles.isInPrivateVehicle = () => {
    return isInPrivateVehicle;
}

mp.events.add('vehicles.enter.private', (isPrivate) => {
    isInPrivateVehicle = isPrivate;
});


mp.events.add('vehicles.sell.show', () => {
    mp.busy.add('vehicle_sell', true);
    mp.callCEFV(`inputWindow.name = 'carsell_id';
inputWindow.header = "Продажа транспорта";
inputWindow.hint = "Введите ID покупателя";
inputWindow.inputHint = "ID покупателя...";
inputWindow.value = "";
inputWindow.show = true;
`);
});


mp.events.add('vehicles.sell.close', () => {
    mp.busy.remove('vehicle_sell');
    mp.callCEFV(`inputWindow.show = false`);
});

mp.events.add('vehicles.sell.id', (id) => {
    if (!mp.players.local.vehicle) return;
    id = parseInt(id);

    if (isNaN(id) || id < 0) return mp.notify.error('Некорректный ID', 'Ошибка');
    if (id == mp.players.local.remoteId) return mp.notify.error('Нельзя продать транспорт себе', 'Ошибка');

    let isFound = false;

    mp.players.forEachInRange(mp.players.local.position, 10, (current) => {
        if (current.remoteId == id) {
            isFound = true;
        }
    });

    if (isFound) {
        carSellData.id = id;
        mp.events.call('vehicles.sell.price.show');
    } else {
        mp.notify.error('Игрока нет рядом', 'Ошибка');
    }
});

mp.events.add('vehicles.sell.price.show', () => {
    mp.callCEFV(`inputWindow.name = 'carsell_price';
    inputWindow.header = "Продажа транспорта";
    inputWindow.hint = "Введите цену Т/С";
    inputWindow.inputHint = "Цена...";
    inputWindow.value = "";
    `);
});

mp.events.add('vehicles.sell.price', (price) => {
    if (!mp.players.local.vehicle) return;
    price = parseInt(price);

    if (isNaN(price) || price < 0) return mp.notify.error('Некорректная цена', 'Ошибка');

    carSellData.price = price;

    mp.events.callRemote('vehicles.sell.send', JSON.stringify(carSellData));
    mp.events.call('vehicles.sell.close');
    mp.callCEFV('loader.show = true');
});


mp.events.add('vehicles.sell.send.ans', (ans, data) => {
    mp.callCEFV('loader.show = false');
    switch (ans) {
        case 0:
            mp.notify.error('Вы не в транспорте', 'Ошибка');
            break;
        case 1:
            mp.notify.error('Это не ваш транспорт', 'Ошибка');
            break;
        case 2:
            mp.notify.error('Некорректная цена', 'Ошибка');
            break;
        case 3:
            mp.notify.error('Игрок не найден', 'Ошибка');
            break;
        case 4:
            mp.notify.error('Игрок далеко', 'Ошибка');
            break;
        case 5:
            mp.callCEFV(`acceptWindow.header = 'Вы действительно хотите продать т/с "${data.vehicleName}" игроку ${data.targetName} за $${data.price}?';`);
            mp.callCEFV(`acceptWindow.name = 'carsell';`);
            mp.callCEFV(`acceptWindow.show = true;`);
            mp.busy.add('vehicle_seller_accept', true);
            break;
        case 6:
            mp.notify.error('Нельзя продать транспорт себе', 'Ошибка');
            break;
    }

});

mp.events.add('vehicles.sell.target.final', (ans, data) => {
    mp.callCEFV('loader.show = false');
    // mp.gui.cursor.show(false, false);
    switch (ans) {
        case 0:
            mp.notify.error('Недостаточно денег', 'Ошибка');
            break;
        case 1:
            mp.notify.success('Вы купили транспорт', 'Успешно');
            break;
        case 2:
            mp.notify.error('Не удалось купить т/с', 'Ошибка');
            break;
        case 3:
            mp.notify.error('У покупателя лимит на т/с', 'Ошибка');
            break;
        case 4:
            mp.notify.error(data.text, `Инвентарь`);
            break;
    }
});


mp.events.add('vehicles.sell.seller.final', (ans) => {

    // mp.gui.cursor.show(false, false);
    switch (ans) {
        case 0:
            mp.notify.error('У покупателя недостаточно денег', 'Ошибка');
            break;
        case 1:
            mp.notify.success('Вы продали транспорт', 'Успешно');
            break;
        case 2:
            mp.notify.error('Не удалось продать т/с', 'Ошибка');
            break;
        case 3:
            mp.notify.error('Достигнут лимит на т/с', 'Ошибка');
            break;
    }
});

mp.events.add('vehicles.sell.seller.accept', (accept) => {
    mp.busy.remove('vehicle_seller_accept');
    if (accept) {
        //mp.callCEFV('loader.show = true');
        mp.events.callRemote('vehicles.sell.seller.accept', JSON.stringify(carSellData));
        mp.callCEFV(`acceptWindow.show = false;`);
        //mp.gui.cursor.show(false, false);
    } else {
        carSellData.id = null;
        carSellData.price = null;
        mp.callCEFV(`acceptWindow.show = false;`);
        //mp.gui.cursor.show(false, false);
    }
});
