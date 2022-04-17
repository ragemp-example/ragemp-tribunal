export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('biz.menu', () => {
        dispatch({
            type: 'BIZ_SHOW'
        });
    });

    myEventEmmiter.on('biz.load', (info) => {
        dispatch({
            type: 'BIZ_LOAD',
            payload: info
        })
    });

    myEventEmmiter.on('biz.menu.close', () => {
        dispatch({
            type: 'BIZ_CLOSE'
        });
    });

    myEventEmmiter.on('biz.buy.ans', (ans, owner) => {
        dispatch({
            type: 'BIZ_BUY_ANSWER',
            payload: {
                answer: ans,
                owner: owner
            }
        });
    });
}