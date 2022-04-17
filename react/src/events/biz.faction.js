export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('biz.faction.order.ans', (ans) => {
        dispatch({
            type: 'SET_ORDER_STATUS_BUSINESS_FACTION',
            payload: ans
        });
    });

    myEventEmmiter.on('biz.faction.order.complete', (resources, sum) => {
        dispatch({
            type: 'ORDER_COMPLETE_BUSINESS_FACTION',
            payload:  { count: resources, sum: sum }
        });
    });

    myEventEmmiter.on('biz.faction.order.take', (flag) => {
        dispatch({
            type: 'TAKE_ORDER_BUSINESS_FACTION',
            payload: flag
        });
    });

    myEventEmmiter.on('biz.faction.improvements.buy.ans', (ans) => {
        dispatch({
            type: 'BUY_IMPROVEMENT_BUSINESS_FACTION_ANS',
            payload: ans
        });
    });
}