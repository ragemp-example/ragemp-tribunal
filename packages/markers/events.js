let markers = call('markers');

module.exports = {
    "init": async () => {
        await markers.init();
        inited(__dirname);
    },
};
