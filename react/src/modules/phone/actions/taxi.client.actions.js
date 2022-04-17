export const loadLocationTaxiClient = (area, street) => ({
    type: 'LOAD_LOCATION_TAXI_CLIENT',
    payload: { area, street }
});

export const createOrderTaxiClient = () => ({
    type: 'CREATE_ORDER_TAXI_CLIENT'
});

export const cancelOrderTaxiClient = () => ({
   type: 'CANCEL_ORDER_TAXI_CLIENT'
});

export const ansOrderTaxiClient = order => ({
   type: 'ANS_ORDER_TAXI_CLIENT',
   payload: order
});

export const clearLocationTaxiClient = () => ({
    type: 'CLEAR_LOCATION_TAXI_CLIENT'
});

export const setDestinationTaxiClient = (area, street, price) => ({
    type: 'SET_DESTINATION_TAXI_CLIENT',
    payload: { area, street, price }
});

export const driverReadyTaxiClient = () => ({
    type: 'DRIVER_READY_TAXI_CLIENT'
});

export const playerInTaxiClient = () => ({
    type: 'PLAYER_IN_TAXI_CLIENT'
});

export const confirmOrderTaxiClient = () => ({
    type: 'CONFIRM_ORDER_TAXI_CLIENT'
});

