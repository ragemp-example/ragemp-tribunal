let masks = require('./index.js');

module.exports = {
    "/ms": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(-1338.8355712890625, -1279.46044921875, 4.861823558807373));
        }
    },
    "/initmasks": {
        access: 6,
        handler: async (player, args) => {
            for (let i = 1; i < 160; i++) {
                await db.Models.Mask.create({
                    drawable: i
                });
            }
        }
    },
    "/masklist": {
        access: 6,
        args: '',
        description: 'Просмотр списка масок',
        handler: (player, args, out) => {
            let list = masks.getMaskList();
            let text = '';
            list.forEach((mask) => {
                text += `ID: ${mask.id} | Текстура: ${mask.drawable} | Имя: ${mask.name} | Цена: ${mask.price} | ${mask.isAvailable ? 'Доступна' : 'Недоступна'} для покупки<br/>`;
            });
            out.log(text, player);
        }
    },
    "/maskname": {
        access: 6,
        args: '[id] [имя]',
        description: 'Изменить имя маски',
        handler: (player, args, out) => {
            let list = masks.getMaskList();
            let id = args[0];
            args.shift();
            let mask = list.find(x => x.id == id);
            if (!mask) return out.error('Маска не найдена', player);
            let name = args.join(' ');
            mask.name = name;
            mask.save();
            out.info(`Для маски с ID ${id} установлено имя ${name}`, player);
        }
    },
    "/maskprice": {
        access: 6,
        args: '[id] [цена]',
        description: 'Изменить цену маски',
        handler: (player, args, out) => {
            let list = masks.getMaskList();
            let id = args[0];
            let mask = list.find(x => x.id == id);
            if (!mask) return out.error('Маска не найдена', player);
            let price = parseInt(args[1]) || 0;
            mask.price = price;
            mask.save();
            out.info(`Для маски с ID ${id} установлена цена ${price}`, player);
        }
    },
    "/maskav": {
        access: 6,
        args: '[id] [доступность: 0/1]',
        description: 'Изменить доступность маски в магазине',
        handler: (player, args, out) => {
            let list = masks.getMaskList();
            let id = args[0];
            let mask = list.find(x => x.id == id);
            if (!mask) return out.error('Маска не найдена', player);
            let available = parseInt(args[1]) || 0;
            mask.isAvailable = available;
            mask.save();
            out.info(`Маска с ID ${id} теперь ${available ? 'доступна' : 'недоступна'} для покупки`, player);
        }
    },
    "/maskadd": {
        access: 6,
        args: '[drawable] [цена] [доступна 0/1] [имя]',
        description: 'Добавить маску в магазин',
        handler: async (player, args, out) => {
            let list = masks.getMaskList();
            let drawable = parseInt(args[0]) || 0;
            let price = parseInt(args[1]) || 0;
            let available = parseInt(args[2]) || 0;
            args.splice(0, 3);
            let name = args.join(' ');
            let mask = await db.Models.Mask.create({
                drawable: drawable,
                price: price,
                isAvailable: available,
                name: name
            });
            list.push(mask);
            out.info(`Добавлена маска #${mask.id} | ${drawable} | $${price} | ${name} | ${available ? 'Доступна' : 'Недоступна'} для покупки`, player);
        }
    }
}