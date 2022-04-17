const utils = call('utils');

module.exports = {
    elevators: [
        // Vespucci PD 1
        [
            {
                name: 'Этаж -1',
                pos: new mp.Vector3(-1066.0960693359375, -833.7847290039062, 5)
            },
            {
                name: 'Этаж -2',
                pos: new mp.Vector3(-1065.93212890625, -834.0538330078125, 11.035581588745117)
            },
            {
                name: 'Этаж -3',
                pos: new mp.Vector3(-1065.964111328125, -834.0104370117188, 14.88)
            },
            {
                name: 'Этаж 1',
                pos: new mp.Vector3(-1066.0960693359375, -833.7847290039062, 19.035493850708008)
            },
            {
                name: 'Этаж 2',
                pos: new mp.Vector3(-1065.93212890625, -834.0538330078125, 23.035581588745117)
            },
            {
                name: 'Этаж 3',
                pos: new mp.Vector3(-1065.964111328125, -834.0104370117188, 27.036060333251953)
            },
        ],
        // Vespucci PD 2
        [
            {
                name: 'Этаж -1',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 4.884997844696045)
            },
            {
                name: 'Этаж -2',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 10.2)
            },
            {
                name: 'Этаж -3',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 13.6)
            },
            {
                name: 'Этаж 1',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 18.9)
            },
            {
                name: 'Этаж 2',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 22.9)
            },
            {
                name: 'Этаж 3',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 26.8)
            },
            {
                name: 'Этаж 4',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 30.7)
            },
            {
                name: 'Этаж 5',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 34.3)
            },
            {
                name: 'Этаж 6',
                pos: new mp.Vector3(-1095.9619140625, -850.625732421875, 38.2)
            },
        ],
        // EMS 1
        [
            {
                name: 'Этаж 1',
                pos: new mp.Vector3(331.349609375, -592.4553833007812, 28.898488998413086)
            },
            {
                name: 'Этаж 4',
                pos: new mp.Vector3(331.349609375, -592.4553833007812, 43.28)
            },
        ],
        // EMS 2
        [
            {
                name: 'Этаж 1',
                pos: new mp.Vector3(335.6091613769531, -580.56494140625, 28.89882469177246)
            },
            {
                name: 'Этаж 4',
                pos: new mp.Vector3(335.6091613769531, -580.56494140625, 43.28)
            },
            {
                name: 'Этаж 5',
                pos: new mp.Vector3(335.6091613769531, -580.56494140625, 48.22)
            },
            {
                name: 'Этаж 10',
                pos: new mp.Vector3(335.6091613769531, -580.56494140625, 74.06)
            },
        ],
    ],
    init() {
        this.createElevators();
    },
    createElevators() {
        for (let i = 0; i < this.elevators.length; i++) {
            const elevator = this.elevators[i];
            elevator.forEach(x => {
                const pos = x.pos;
                let colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.2);
                colshape.onEnter = (player) => {
                    if (player.vehicle) return;
                    const floors = elevator.map(x => {
                        return x.name
                    })
                    player.call('elevators.inside', [x.name, floors]);
                    player.elevatorId = i;
                };
                colshape.onExit = (player) => {
                    player.call('elevators.inside', [null]);
                    player.elevatorId = null;
                };

                mp.markers.new(1, new mp.Vector3(pos.x, pos.y, pos.z - 1), 1,
                    {
                        direction: new mp.Vector3(pos.x, pos.y, pos.z),
                        rotation: 0,
                        color: [4, 100, 217, 100],
                        visible: true,
                        dimension: 0
                    });
                mp.labels.new(`Нажмите ~g~E`, new mp.Vector3(pos.x, pos.y, pos.z + 0.3),
                    {
                        los: false,
                        font: 0,
                        drawDistance: 10,
                    });
            });
        }
    },
    teleport(player, floorName) {
        const elevator = this.elevators[player.elevatorId];
        const floor = elevator.find(x => x.name === floorName);
        if (!floor) return;
        utils.setPlayerPosition(player, floor.pos);
    }
}