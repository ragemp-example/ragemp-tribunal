export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('players.show', (flag) => {
        dispatch({
            type: 'SHOW_PLAYERS',
            payload: flag
        });
    });

    myEventEmmiter.on('players.load', (players) => {
        dispatch({
            type: 'LOAD_PLAYERS',
            payload: players
        });
    });

    myEventEmmiter.on('players.add', (player) => {
        dispatch({
            type: 'ADD_PLAYER',
            payload: player
        });
    });

    myEventEmmiter.on('players.remove', (id) => {
        dispatch({
            type: 'REMOVE_PLAYER',
            payload: id
        });
    });

    myEventEmmiter.on('players.update', (id, data) => {
        dispatch({
            type: 'UPDATE_PLAYER',
            payload: { id, data }
        });
    });
}