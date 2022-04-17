export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('house.menu', () => {
        dispatch({
            type: 'HOUSE_SHOW'
        });
    });

    myEventEmmiter.on('house.load', (info) => {
        dispatch({
            type: 'HOUSE_LOAD',
            payload: info
        })
    });

    myEventEmmiter.on('house.menu.close', () => {
        dispatch({
            type: 'HOUSE_CLOSE'
        });
    });

    myEventEmmiter.on('house.menu.enter', (place) => {
        dispatch({
            type: 'HOUSE_ENTER',
            payload: place
        });
    });

    myEventEmmiter.on('house.menu.enter.close', () => {
        dispatch({
            type: 'HOUSE_ENTER_CLOSE'
        });
    });

    myEventEmmiter.on('house.buy.ans', (ans, owner) => {
        dispatch({
            type: 'HOUSE_BUY_ANSWER',
            payload: {
                answer: ans,
                owner: owner
            }
        });
    });

    myEventEmmiter.on('house.enter.ans.err', () => {
        dispatch({
            type: 'HOUSE_ENTER_ANSWER',
            payload: 0
        });
    });
}