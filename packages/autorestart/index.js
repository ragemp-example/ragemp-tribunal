let timer;
let chat;

module.exports = {
    restartTime: 4,
    init() {
        timer = call('timer');
        chat = call('chat');
        let date = new Date();
        let currentMinutes = (date.getUTCHours() + 3) * 60 + date.getUTCMinutes();
        let minutesTillRestart = 24 * 60 - currentMinutes + this.restartTime * 60;
        console.log(`[AUTORESTART] До автоматического рестарта ${minutesTillRestart} минут`);
        timer.add(() => {
            this.restart();
        }, minutesTillRestart * 60 * 1000);
    },
    restart() {
        mp.players.forEach(rec => {
            chat.push(rec, '!{#ff0000}Внимание! Через 30 секунд произойдет автоматический рестарт сервера!')
            mp.events.call('playerQuit', rec);
        });
        timer.add(() => {
            console.log('[AUTORESTART] Производится автоматический рестарт');
            process.exit();
        }, 30000);
    }
}