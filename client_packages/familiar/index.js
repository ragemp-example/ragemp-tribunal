mp.familiar = {
    // Список имен знакомых
    list: [],

    init(list) {
        list.forEach(name => {
            var rec = mp.utils.getPlayerByName(name);
            if (rec) rec.isFamiliar = true;
        });
        this.list = list;

        //mp.playerMenu.setFamiliar(this.list.length);
    },
    add(name) {
        if (this.list.includes(name)) return mp.notify.error(`Вы уже знаете ${name}`, `Знакомство`);
        this.list.push(name);
        var rec = mp.utils.getPlayerByName(name);
        if (rec) rec.isFamiliar = true;

        //mp.playerMenu.setFamiliar(this.list.length);
    },
    remove(name) {
        var i = this.list.indexOf(name);
        if (i == -1) return mp.notify.error(`Вы не знаете ${name}`, `Знакомство`);
        this.list.splice(i, 1);
        var rec = mp.utils.getPlayerByName(name);
        if (rec) delete rec.isFamiliar;

        mp.playerMenu.setFamiliar(this.list.length);
    },
    updateName(name, oldName) {
        var i = this.list.indexOf(oldName);
        if (i != -1) this.list.splice(i, 1);
        this.list.push(name);
    },
};

mp.events.add({
    "characterInit.done": () => {},
    "familiar.init": (list) => {
        mp.familiar.init(list);
    },
    "familiar.add": (name) => {
        mp.familiar.add(name);
    },
    "familiar.remove": (name) => {
        mp.familiar.remove(name);
    },
    "familiar.name.update": (name, oldName) => {
        mp.familiar.updateName(name, oldName);
    },
    "entityStreamIn": (player) => {
        if (player.type != "player") return;
        if (!mp.familiar.list.length) return;
        if (!mp.familiar.list.includes(player.name)) return;

        player.isFamiliar = true;
    },
});
