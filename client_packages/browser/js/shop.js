
var shop = new Vue({
    el: "#shop",
    data: {
        show: false,
        title: "Супермаркет",
        focus: "products",
        pages: {
            products: {
                title: "Продукты",
                img: "img/shop/market.svg",
                list: [],
            },
            other: {
                title: "Прочее",
                img: "img/shop/dots.svg",
                list: [],
            }
        }
    },
    methods: {
        addProducts(page, list) {
            if (this.pages[page])
                this.pages[page].list = list;
        },
        buy(id) {
            mp.trigger('callRemote', 'supermarket.products.buy', id);
        },
        setTitle(title) {
            this.title = title;
        },
        close() {
            mp.trigger('supermarket.exit');
        }
    }
});

// for tests

// shop.show = true;
//
// shop.addProducts("products", [
//     {
//         id: 0,
//         img: "img/inventory/items/1.png",
//         name: "Молоко",
//         description: "Зачем нужен этот товар блин вобще вот так вот вота вот Зачем нужен этот товар блин вобще вот так вот вота вот",
//         price: 120,
//     },
//     {
//         id: 1,
//         img: "img/inventory/items/1.png",
//         name: "Молоко",
//         description: "Зачем нужен этот товар блин вобще вот так вот вота вот",
//         price: 120,
//     },
//     {
//         id: 2,
//         img: "img/inventory/items/1.png",
//         name: "Молоко",
//         description: "Зачем нужен этот товар блин вобще вот так вот вота вот ",
//         price: 120,
//     },
//     {
//         id: 3,
//         img: "img/inventory/items/1.png",
//         name: "Молоко",
//         description: "Зачем нужен этот товар блин вобще вот так вот вота вот Зачем нужен этот товар блин вобще вот так вот вота вот",
//         price: 120,
//     },
// ]);
//
// shop.addProducts("other", [
//     {
//         id: 0,
//         name: "Молоко",
//         description: "Зачем нужен этот товар блин вобще вот так вот вота вот",
//         price: 120,
//     },
//     {
//         id: 1,
//         name: "Молоко",
//         description: "Зачем нужен этот товар блин вобще вот так вот вота вот",
//         price: 120,
//     },
//     {
//         id: 2,
//         name: "Молоко",
//         description: "Зачем нужен этот товар блин вобще вот так вот вота вот",
//         price: 120,
//     },
//     {
//         id: 3,
//         name: "Молоко",
//         description: "Зачем нужен этот товар блин вобще вот так вот вота вот",
//         price: 120,
//     },
// ]);
//
// shop.setTitle("Магазин “Бульвар Веспуччи 54”");
