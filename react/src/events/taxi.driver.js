export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('taxi.driver.load', (info) => {
        dispatch({
            type: 'LOAD_INFO_TAXI_DRIVER',
            payload: info
        });
    });

    myEventEmmiter.on('taxi.driver.order.add', (order) => {
        dispatch({
            type: 'ADD_ORDER_TAXI_DRIVER',
            payload: order
        });
    });

    myEventEmmiter.on('taxi.driver.order.delete', (orderId) => {
        dispatch({
            type: 'DELETE_ORDER_TAXI_DRIVER',
            payload: orderId
        });
    });

    myEventEmmiter.on('taxi.driver.order.cancel', () => {
        dispatch({
            type: 'CANCEL_ORDER_TAXI_DRIVER'
        });
    });

    myEventEmmiter.on('taxi.driver.order.error', () => {
        dispatch({
            type: 'ERROR_ORDER_TAXI_DRIVER'
        });
    });

    myEventEmmiter.on('taxi.driver.order.way', (area, street, price) => {
        dispatch({
            type: 'SET_DESTINATION_TAXI_DRIVER',
            payload: { area, street, price }
        });
    });
}