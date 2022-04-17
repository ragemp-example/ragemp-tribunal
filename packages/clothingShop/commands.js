module.exports = {
    '/loadcshops': {
        args: '',
        description: 'Загрузка магазов одежды',
        access: 6,
        handler: (player, args) => {
            let data = [
                
            ]

            data.forEach(async (current) => {
                let type;
                switch (current.subclass) {
                    case 'binco':
                        type = 0;
                        break;
                    case 'discount':
                        type = 1;
                        break;
                    case 'suburban':
                        type = 2;
                        break;
                    case 'ponsonbys':
                        type = 3;
                        break;
                }


                await db.Models.ClothingShop.create({
                    class: current.class + 1,
                    bType: type,
                    x: current.pos[0],
                    y: current.pos[1],
                    z: current.pos[2],
                    placeX: current.clothes[0][5][0],
                    placeY: current.clothes[0][5][1],
                    placeZ: current.clothes[0][5][2],
                    placeH: current.clothes[0][6],
                    cameraX: current.clothes[0][7][0],
                    cameraY: current.clothes[0][7][1],
                    cameraZ: current.clothes[0][7][2],
                });
            });
        }
    },
    '/setclshape': {
        args: '[id]',
        description: 'Учстановить колшейп магазина одежды',
        access: 6,
        handler: async (player, args, out) => {
                let id = parseInt(args[0]);
                let shape = mp.colshapes.toArray().find(x => x.clothingShopId === id);

                if (!shape) return out.error('Магазин не найден', player);

                shape.destroy();

                let shop = await db.Models.ClothingShop.findOne({
                    where: {
                        id: id
                    }
                });

                await shop.update({
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z - 1.3
                });

                shape = mp.colshapes.newSphere(shop.x, shop.y, shop.z, 1.8);
                shape.isClothingShop = true;
                shape.clothingShopId = id;

                mp.markers.new(1, new mp.Vector3(shop.x, shop.y, shop.z - 0.1), 0.8,
                {
                    color: [50, 168, 82, 128],
                    visible: true,
                    dimension: 0
                });
            
        }
    }
}