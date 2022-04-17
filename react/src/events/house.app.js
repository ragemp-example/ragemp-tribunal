export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('house.sell.toGov.ans', (ans) => {
        dispatch({
            type: 'SET_SELL_STATUS_HOUSE',
            payload: ans
        });
    });
    
    myEventEmmiter.on('house.sell.ans', (ans) => {
        dispatch({
            type: 'SET_SELL_STATUS_HOUSE',
            payload: ans
        });
    });
    
    myEventEmmiter.on('house.sell.check.ans', (nick, price) => {
        dispatch({
            type: 'SET_SELL_INFO_HOUSE',
            payload: { nick, price }
        });
    });
    
    myEventEmmiter.on('house.improvements.buy.ans', (ans) => {
        dispatch({
            type: 'BUY_IMPROVEMENT_HOUSE_ANS',
            payload: ans
        });
    });
}