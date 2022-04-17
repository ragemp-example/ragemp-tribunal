 var lsCustoms = new Vue({
     el: "#lsCustoms",
     data: {
         show: false,

         menu: {
             values: {
                 repair: {
                     title: "Ремонт авто",
                     price: 0,
                     handler() {
                        alert(`Чиним тачку за ${this.price} доляров`);
                     },
                 },
                 colors: {
                     title: "Цвета",
                     values: [],
                     handler(index) {
                         alert(`Ставим цвет ${this.values[index].value} за ${this.values[index].price} доляров`)
                     },
                 },
                 engine: {
                     title: "Двигатель",
                     values: [],
                     handler(index) {
                         alert(`Ставим улучшение ${this.values[index].value} за ${this.values[index].price} доляров`)
                     },
                 }
             },
             focus: 1,
         },
         slider: {
             show: false,
             focus: 1,
             maxValues: 15,
         }
     },
     computed: {
        items() {
            return { first: {}, ...this.menu.values, last: {} };
        },
        sliderItems() {
            let values = this.menuFocusItem.values;

            if (values[0].value[0] == '#') return values;
            return [{}, ...this.menuFocusItem.values, {}];
        },
        menuLength() {
            return Object.keys(this.menu.values).length;
        },
        menuFocusKey() {
            return Object.keys(this.menu.values)[this.menu.focus-1];
        },
        menuFocusItem() {
            return this.menu.values[this.menuFocusKey];
        }
     },
     methods: {
         menuTurnOver(forward) {
             if (this.slider.show) return;

             if (!forward) {
                 if (this.menu.focus == 1) return;
                 else return this.menu.focus--;
             }

             if (forward && this.menu.focus == this.menuLength) return;
             else return this.menu.focus++;
         },
         sliderTurnOver(forward) {
            
             if (!forward) {
                 if (this.slider.focus == 1) return;
                 else {
                    this.slider.focus--;
                    mp.trigger('tuning.mod.set', -1, this.slider.focus - 2);
                    return;
                 } 
             }

             if (!this.sliderItems[0].value)
                 if (forward && this.slider.focus == this.sliderItems.length-2) return;
                 else {
                    this.slider.focus++;
                    mp.trigger('tuning.mod.set', -1, this.slider.focus - 2);
                    return;
                 }  

             if (forward && this.slider.focus == this.sliderItems.length) return;
             else {
                this.slider.focus++;
                mp.trigger('tuning.mod.set', -1, this.slider.focus - 2);
                return;
             }
         },
         itemIsShown(index) {
             return index == this.menu.focus-1 ||
                index == this.menu.focus ||
                index == this.menu.focus+1;
         },
         sliderItemsShow(index) {
             if (!this.sliderItems[0].value)
                 return index == this.slider.focus-1 ||
                    index == this.slider.focus ||
                    index == this.slider.focus+1;

             return (index < this.slider.focus+1 || index < this.slider.maxValues) &&
                index >= this.slider.focus+1 - this.slider.maxValues// ||
                //index >= this.slider.focus+2 - this.slider.maxValues;
         },
         onKeyDown(e) {
             if (!this.show) return;
             if (e.keyCode == 39) {
                 if (this.slider.show)
                    this.sliderTurnOver(true);
                else
                    this.menuTurnOver(true);
             } else if (e.keyCode == 37) {
                if (this.slider.show)
                    this.sliderTurnOver(false);
                else
                    this.menuTurnOver(false);
             } else if (e.keyCode == 13) {
                 if (this.slider.show) {
                     this.menuFocusItem.handler(this.slider.focus-1);
                 } else {
                     let item = this.menuFocusItem;
                     if (item.values) {
                         if (item.modType != null) {
                            mp.trigger('tuning.modType.set', item.modType);
                         } else {
                             if (item.title == 'Цвета') {
                                mp.trigger('tuning.modType.set', 999); // цвет
                             } else if (item.title == 'Доп. цвета') {
                                mp.trigger('tuning.modType.set', 1000); // цвет
                             }
                         }
                         this.slider.show = true;
                         return;
                     }
                     this.menuFocusItem.handler();
                 }
             } 
         },
         onKeyUp(e) {
            if (e.keyCode == 27) {
                if (this.slider.show) {
                    this.slider.show = false;
                    this.slider.focus = 1;
                    mp.trigger('tuning.params.set');
                } else {
                    if (this.show) {
                        this.show = false;
                        mp.trigger('tuning.end');
                    }
                }
            }
         },
         setValues(key, value) {
             this.menu.values[key].values = value;
         },
         setPrice(key, value) {
             this.menu.values[key].price = value;
         },
         updateSetMod(key, valueId) {
             this.menu.values[key].values.forEach(x => {
                 if (x.price.toString().includes('уст.')) {
                     x.price = x.price.toString().slice(0, -7);
                 }
             })
             this.menu.values[key].values[valueId].price += ' - уст.';
             this.slider.focus--;
             this.slider.focus++;
         }
     },
     watch: {
        show() {
            this.menu.focus = 1;
            this.slider.focus = 1;
            this.slider.show = false;
        }
     },
     mounted() {
         let self = this;

         window.addEventListener('keydown', function(e) {
             if (!self.menu) return;
             if (busy.includes(["inventory", "chat", "terminal", "phone"])) return;
             self.onKeyDown(e);
         });

         window.addEventListener('keyup', function(e) {
            if (!self.menu) return;
            if (busy.includes(["inventory", "chat", "terminal", "phone"])) return;
            self.onKeyUp(e);
        });
     }
 });

// for tests

// lsCustoms.show = true;
//
// lsCustoms.setValues('colors', [
//     {
//         value: "#fec",
//         price: 100,
//     },
//     {
//         value: "#ffc",
//         price: 1000000,
//     },
//     {
//         value: "#0ec",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#f0c",
//         price: 100,
//     },
//     {
//         value: "#00f",
//         price: 100,
//     },
//     {
//         value: "#0ff",
//         price: 100,
//     },
//     {
//         value: "#f02",
//         price: 100,
//     },
//     {
//         value: "#f02",
//         price: 100,
//     },
//     {
//         value: "#f02",
//         price: 100,
//     },
//     {
//         value: "#f02",
//         price: 100,
//     },
// ]);
//
// lsCustoms.setValues('engine', [
//     {
//         value: "Стандартный",
//         price: 1000,
//     },
//     {
//         value: "Улучшенный СУД, уровень 1",
//         price: 1000,
//     },
//     {
//         value: "Улучшенный СУД, уровень 2",
//         price: 1000,
//     },
// ]);
//
// lsCustoms.setPrice('repair', 5000000000);
