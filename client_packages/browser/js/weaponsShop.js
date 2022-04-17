
var weaponsShop = new Vue({
    el: "#weaponsShop",
    data: {
        show: false,
        number: "",
        menuFocus: "pistols",
        menu: {
            pistols: {
                title: "Пистолеты",
                focus: null,
                list: [],
            },
            // sniperRifles: {
            //     title: "Снайперские винтовки",
            //     focus: null,
            //     list: [],
            // },
            rifles: {
                title: "Винтовки",
                focus: null,
                list: [],
            },
            shotguns: {
                title: "Дробовики",
                focus: null,
                list: [],
            },
            armour: {
                title: "Бронежилеты",
                focus: null,
                list: [],
            }
        },
    },
    computed: {
        itemFocus() {
            return this.menu[this.menuFocus].focus;
        },
        showBullets() {
            return this.menuFocus != 'armour';
        }
    },
    methods: {
        setMenuFocus(key) {
            let page = this.menu[key];

            if (!page.focus)
                page.focus = page.list[0];

            this.menuFocus = key;
        },
        setNumber(number) {
            this.number = number;
        },
        setWeaponsList(weaponsClass, list) {
            let page = this.menu[weaponsClass];
            page.list = list;
            page.focus = page.list[0];
        },
        buy(id) {
            if (this.menuFocus == 'armour') {
                mp.trigger('callRemote', 'ammunation.armour.buy', id);
            } else {
                mp.trigger('callRemote', 'ammunation.weapon.buy', id);
            }
        },
        buyBullets(amount, caliber) {
            let itemIds = {
                "9mm": 37,
                "12mm": 38,
                "7.62mm": 39,
                "5.56mm": 40
            }
            let values = JSON.stringify([itemIds[caliber], amount]);
            mp.trigger('callRemote', 'ammunation.ammo.buy', values);
        },
        close() {
            mp.trigger('ammunation.exit');
        }
    }
})

// for tests

// weaponsShop.show = true;
// weaponsShop.setNumber(40);
//
// weaponsShop.setWeaponsList("pistols", [
//     {
//         id: 0,
//         img: "img/inventory/items/20.png",
//         caliber: ".50",
//         name: "Heavy Pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
//     {
//         id: 1,
//         img: "img/inventory/items/20.png",
//         caliber: "9",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
//     {
//         id: 2,
//         img: "img/inventory/items/20.png",
//         caliber: "5.56",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
//     {
//         id: 3,
//         img: "img/inventory/items/20.png",
//         caliber: "7.62",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 30,
//     },
//     {
//         id: 4,
//         img: "img/inventory/items/20.png",
//         caliber: "7.62",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
//     {
//         id: 5,
//         img: "img/inventory/items/20.png",
//         caliber: "7.62",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 20,
//     }
// ]);
//
// weaponsShop.setWeaponsList("rifles", [
//     {
//         id: 0,
//         img: "img/inventory/items/50.png",
//         caliber: ".50",
//         name: "Heavy Pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
//     {
//         id: 1,
//         img: "img/inventory/items/50.png",
//         caliber: "9",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
//     {
//         id: 2,
//         img: "img/inventory/items/50.png",
//         caliber: "5.56",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
//     {
//         id: 3,
//         img: "img/inventory/items/50.png",
//         caliber: "7.62",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 30,
//     },
//     {
//         id: 4,
//         img: "img/inventory/items/50.png",
//         caliber: "7.62",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
//     {
//         id: 5,
//         img: "img/inventory/items/50.png",
//         caliber: "7.62",
//         name: "heavy pistol",
//         price: 520,
//         priceByBullet: 20,
//     }
// ]);
//
// weaponsShop.setWeaponsList("sniperRifles", [
//     {
//         id: 0,
//         img: "img/inventory/items/20.png",
//         caliber: ".50",
//         name: "Heavy Pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
// ]);
//
// weaponsShop.setWeaponsList("shotguns", [
//     {
//         id: 0,
//         img: "img/inventory/items/20.png",
//         caliber: ".50",
//         name: "Heavy Pistol",
//         price: 520,
//         priceByBullet: 20,
//     },
// ]);
