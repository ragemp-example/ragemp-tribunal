let ammunation = require('./index.js');

module.exports = {
    "/createan": {
        description: 'Создать аммунацию',
        args: '',
        access: 6,
        handler: async (player, args) => {
            let ammo = await db.Models.Ammunation.create({
                x: player.position.x,
                y: player.position.y,
                z: player.position.z - 1.3
            });
            ammunation.createAmmunation(ammo);
        }
    }
}