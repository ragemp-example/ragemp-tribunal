var gungame = new Vue({
    el: '#gungame',
    data: {
        show: false,
        info: null,
        score: null,
        kills: 0
    },
    methods: {
        getTeamSum(team) {
            // console.log(this.score[team]);
            return this.score[team].reduce((a, b) => a + b.kills, 0);
        },
        kill() {
            this.kills += 1;
        }
    },
    watch: {
        show(val) {
            if (!val) {
                this.info = null;
                this.score = null;
                this.kills = 0;
            }
        }
    }
});

// hud.show = true;
// gungame.show = true;
// gungame.info = {
//     players: 3,
//     max: 10,
//     type: 0,
//     time: 5
// }
// gungame.score = [
//     [
//         { kills: 3, name: 'Dun Hill' },
//         { kills: 2, name: 'Dun Hill' },
//         { kills: 6, name: 'Dun Hill' },
//         { kills: 6, name: 'Dun Hill' },
//         { kills: 6, name: 'Dun Hill' },
//         { kills: 6, name: 'Dun Hill' },
//     ],
//     [
//         { kills: 1, name: 'Dun Hill' },
//         { kills: 1, name: 'Kirill Swiftiniodawdawd' },
//         { kills: 1, name: 'Dun Hill' },
//         { kills: 1, name: 'Dun Hill' },
//         { kills: 1, name: 'Dun Hill' },
//         { kills: 1, name: 'Dun Hill' },
//         { kills: 1, name: 'Dun Hill' },
//         { kills: 1, name: 'Dun Hill' },
//     ],
//     [
//         { kills: 1, name: 'Dun Hill' },
//         { kills: 2, name: 'Dun Hill' },
//         { kills: 3, name: 'Dun Hill' },
//         { kills: 3, name: 'Dun Hill' },
//         { kills: 3, name: 'Dun Hill' },
//         { kills: 3, name: 'Dun Hill' },
//         { kills: 3, name: 'Dun Hill' },
//         { kills: 3, name: 'Dun Hill' },
//     ]
// ]