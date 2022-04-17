let autorestart = require('./index');

module.exports = {
    'init': () => {
        autorestart.init();
        inited(__dirname);
    }
}