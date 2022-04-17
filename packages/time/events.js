"use strict";
var time = require('./index.js');

module.exports = {
    "init": () => {
        time.init();
        inited(__dirname);
    },
}
