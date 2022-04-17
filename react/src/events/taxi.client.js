export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('taxi.client.location', (area, street) => {
        dispatch({
            type: 'LOAD_LOCATION_TAXI_CLIENT',
            payload: { area, street }
        });
    });

    myEventEmmiter.on('taxi.client.order.ans', (order) => {
        dispatch({
            type: 'ANS_ORDER_TAXI_CLIENT',
            payload: order
        });
    });

    myEventEmmiter.on('taxi.client.order.ready', () => {
        dispatch({
            type: 'DRIVER_READY_TAXI_CLIENT'
        });
    });

    myEventEmmiter.on('taxi.client.order.inTaxi', () => {
        dispatch({
            type: 'PLAYER_IN_TAXI_CLIENT'
        });
    });

    myEventEmmiter.on('taxi.client.order.destination', (area, street, price) => {
        dispatch({
            type: 'SET_DESTINATION_TAXI_CLIENT',
            payload: { area, street, price }
        });
    });

    myEventEmmiter.on('taxi.client.order.cancel', () => {
        dispatch({
            type: 'CANCEL_ORDER_TAXI_CLIENT'
        });
    });

    myEventEmmiter.on('taxi.client.order.error', () => {
        dispatch({
            type: 'ERROR_ORDER_TAXI_CLIENT'
        });
    });
}