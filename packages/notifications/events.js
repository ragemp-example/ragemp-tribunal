let chat = call('chat');
let notifs = call('notifications');

module.exports = {
    "characterInit.done": async (player) => {
        var list = await notifs.popSavedNotifs(player);
        list.forEach(el => {
            notifs[el.type](player, el.text, el.header);
            let color;
            switch (el.type) {
                case 'warning':
                    color = 'ffc800';
                    break;
                case 'success':
                    color = '40ff26';
                    break;
                case 'error':
                    color = 'e3364b';
                    break;
                case 'info':
                    color = '8480ff';
                    break;
                default:
                    color = '8480ff';
                    break;
            }
            chat.push(player, `!{#${color}} ${el.text}`);
        });
    },
};
