Math.clamp = function(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// var mp = {
//     trigger(name, values)  {
//         console.log(`mp.trigger: ${name} ${JSON.stringify(values)}`);
//     },
// };

function getPaddingNumber(str, max = 5) {
    const string = str.toString();
    return string.length < max ? getPaddingNumber(`0${string}`, max) : string;
}

function prettyMoney(val) {
    val += '';
    return val.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
}

function setCursor(enable) {
    mp.invoke('focus', enable);
}

function cloneObj(inObj) {
    let outObj = JSON.parse(JSON.stringify(inObj));
    for (let key in inObj) {
        if (typeof(inObj[key]) == 'function') {
            outObj[key] = inObj[key];
        }
    }
    return outObj;
}

function debug(text) {
    terminal.debug(text);
}

function d(text) {
    notifications.push('info', text, `DEBUG-LOG`);
}

function convertToMoscowDate(date) {
    var offsetMs = date.getTimezoneOffset() * 60 * 1000;
    var moscowOffsetMs = 3 * 60 * 60 * 1000;
    return new Date(date.getTime() + offsetMs + moscowOffsetMs);
}

var busy = {
    list: [],
    add(name, mouse = true, client = false) {
        if (this.list.includes(name)) return false;
        this.list.push(name);
       if (client) mp.trigger('busy.add', name, mouse, true);
        return true;
    },
    includes(name) {
        if (name == null) return this.list.length > 0;
        if (typeof name != 'object') return this.list.includes(name);
        else {
            for (var i = 0; i < name.length; i++) {
                if (this.list.includes(name[i])) return true;
            }
            return false;
        }
    },
    remove(name, client = false) {
        var index = this.list.indexOf(name);
        if (index != -1) this.list.splice(index, 1);
        if (client) mp.trigger('busy.remove', name, true);
    },
};
