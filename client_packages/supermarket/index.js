mp.events.add({
    "supermarket.enter": (data) => {
        showSupermarketMenu(data);
    },
    "supermarket.exit": () => {
        closeSupermarketMenu();
    }
});

function showSupermarketMenu(data) {
    let categories = data.items;
    let productPrice = data.productPrice;
    let priceMultiplier = data.priceMultiplier;
    for (let key in categories) {
        let items = categories[key].map(x => {
            return {
                ...x,
                img: `img/inventory/items/${x.id}.png`,
                price: x.products * productPrice * priceMultiplier
            }
        });
        mp.callCEFV(`shop.addProducts('${key}', ${JSON.stringify(items)})`);
        mp.busy.add('supermarket', true);
        mp.callCEFV('shop.show = true');
    }
}

function closeSupermarketMenu() {
    mp.busy.remove('supermarket');
    mp.callCEFV('shop.show = false');
}