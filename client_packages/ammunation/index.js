mp.events.add({
    "ammunation.enter": (data, weaponsConfig) => {
        let types = ['pistols', 'shotguns', 'rifles', 'armour'];

        types.forEach(type => {
            let weapons = [];
            for (let key in weaponsConfig) {
                if (weaponsConfig[key].type == type) {
                    weapons.push({ ...weaponsConfig[key], id: key });
                }
            }
            weapons = weapons.map(x => {
                return {
                    ...x,
                    img: `img/inventory/items/${x.itemId}.png`,
                    price: parseInt(x.products * data.productPrice * data.priceMultiplier),
                    priceByBullet: parseInt(data.ammoProducts * data.productPrice * data.priceMultiplier)
                }
            });
            mp.callCEFV(`weaponsShop.setWeaponsList('${type}', ${JSON.stringify(weapons)})`);
            mp.game.graphics.transitionToBlurred(500);
            mp.game.ui.displayRadar(false);
            mp.callCEFV(`hud.show = false`);
            mp.callCEFV(`weaponsShop.show = true`);
            mp.busy.add('ammunation', true);
            mp.callCEFR('setOpacityChat', [0.0]);
        });
    },
    "ammunation.exit": () => {
        mp.game.graphics.transitionFromBlurred(500);
        mp.busy.remove('ammunation');
        mp.callCEFV(`weaponsShop.show = false`);
        mp.callCEFV(`hud.show = true`);
        mp.callCEFR('setOpacityChat', [1.0]);
        mp.game.ui.displayRadar(true);
    },
});