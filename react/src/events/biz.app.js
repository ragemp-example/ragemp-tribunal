export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('biz.sell.toGov.ans', (ans) => {
        dispatch({
            type: 'SET_SELL_STATUS_BUSINESS',
            payload: ans
        });
    });

    myEventEmmiter.on('biz.sell.ans', (ans) => {
        dispatch({
            type: 'SET_SELL_STATUS_BUSINESS',
            payload: ans
        });
    });

    myEventEmmiter.on('biz.sell.check.ans', (nick, price) => {
        dispatch({
            type: 'SET_SELL_INFO_BUSINESS',
            payload: { nick, price }
        });
    });

    myEventEmmiter.on('biz.order.ans', (ans) => {
        dispatch({
            type: 'SET_ORDER_STATUS_BUSINESS',
            payload: ans
        });
    });

    myEventEmmiter.on('biz.order.complete', (resources, sum) => {
        dispatch({
            type: 'ORDER_COMPLETE_BUSINESS',
            payload: { count: resources, sum: sum }
        });
    });

    myEventEmmiter.on('biz.order.take', (flag) => {
        dispatch({
            type: 'TAKE_ORDER_BUSINESS',
            payload: flag
        });
    });

    myEventEmmiter.on('biz.statistics.update', (date, money) => {
        dispatch({
            type: 'UPDATE_STATISTICS_BUSINESS',
            payload: { date, money }
        });
    });

    myEventEmmiter.on('biz.cashbox.update', (money) => {
        dispatch({
            type: 'UPDATE_CASHBOX_BUSINESS',
            payload: money
        });
    });

    myEventEmmiter.on('biz.improvements.buy.ans', (ans) => {
        dispatch({
            type: 'BUY_IMPROVEMENT_BUSINESS_ANS',
            payload: ans
        });
    });

    myEventEmmiter.on('biz.products.update', (number) => {
        dispatch({
            type: 'UPDATE_PRODUCTS_BUSINESS',
            payload: number
        });
    });
}