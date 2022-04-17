export const loadInfoTaxiDriver = info => ({
    type: 'LOAD_INFO_TAXI_DRIVER',
    payload: info
});

export const sortOrdersByDistance = () => ({
   type: 'SORT_ORDERS_BY_DISTANCE_TAXI_DRIVER'
});

export const addOrderTaxiDriver = order => ({
    type: 'ADD_ORDER_TAXI_DRIVER',
    payload: order
});

export const takeOrderTaxiDriver = orderId => ({
    type: 'TAKE_ORDER_TAXI_DRIVER',
    payload: orderId
});

export const cancelOrderTaxiDriver = orderId => ({
    type: 'CANCEL_ORDER_TAXI_DRIVER',
    payload: orderId
});

export const deleteOrderTaxiDriver = orderId => ({
    type: 'DELETE_ORDER_TAXI_DRIVER',
    payload: orderId
});

export const setDestinationTaxiDriver = (area, street, price) => ({
    type: 'SET_DESTINATION_TAXI_DRIVER',
    payload: { area, street, price }
});