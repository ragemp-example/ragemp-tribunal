const score = [
    [
        { kills: 3 },
        { kills: 2 },
        { kills: 4 },
    ],
    [
        { kills: 1 },
        { kills: 1 },
        { kills: 10 },
    ],
]

const compare = (a, b) => (a.kills < b.kills) ? 1 : -1;

const sorted = score.map(s => s.sort(compare));
// console.log(sorted);

// function randomInteger(min, max) {
//     var rand = min - 0.5 + Math.random() * (max - min + 1);
//     rand = Math.round(rand);
//     return rand;
// }
// console.log(randomInteger(0, 2));