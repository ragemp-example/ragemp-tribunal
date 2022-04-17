let route = {
    points: []
}

let checkpoints = [];

mp.events.add('routecreator.show', () => {
    mp.busy.add('routecreator', false);
    mp.callCEFV(`selectMenu.menu = cloneObj(selectMenu.menus["routeCreator"])`);
    mp.callCEFV(`selectMenu.show = true`);
});


mp.events.add('routecreator.close', () => {
    mp.busy.remove('routecreator');
    mp.callCEFV(`selectMenu.show = false`);
});


mp.events.add('routecreator.checkpoint.add', (type) => {

    let position = mp.players.local.position;

    route.points.push({
        x: position.x,
        y: position.y,
        z: position.z - 3,
        isStop: type
    });

    let check = mp.checkpoints.new(5, new mp.Vector3(position.x, position.y, position.z - 3), 10, // point
    {
        color: type ? [30, 206, 255, 255] : [255, 246, 0, 255],
        visible: true,
        dimension: 0
    });

    mp.notify.success(`${type ? 'Чекпоинт остановки' : 'Чекпоинт'} создан`);
    checkpoints.push(check);
});


mp.events.add('routecreator.route.save', (name, salary, level) => {
    if (!name || !salary) return mp.notify.error('Данные не указаны');
    if (isNaN(salary)) return mp.notify.error('Некорректная цена');
    route.name = name;
    route.salary = salary;
    route.level = level;
    mp.events.callRemote('busdriver.route.add', JSON.stringify(route));
    mp.events.call('routecreator.close');
    clearRoute();
});

mp.events.add('routecreator.checkpoint.delete', () => {
    let lastPoint = checkpoints[checkpoints.length - 1];
    if (!lastPoint) return mp.notify.warning('Нет чекпоинта');

    checkpoints.pop();
    route.points.pop();
    lastPoint.destroy();
    lastPoint = null;
    mp.notify.success('Последний чекпоинт удален');
});

mp.events.add('routecreator.route.clear', () => {
    if (!checkpoints) return mp.notify.warning('Нет чекпоинтов');
    clearRoute();
    mp.notify.success('Чекпоинты очищены');
});


function clearRoute() {
    checkpoints.forEach((current) => {
        current.destroy();
    });
    checkpoints = [];
    route.points = [];
}