/* eslint-disable default-case */
const initialState = {};

export default function taxiClient(state = initialState, action) {
    const {type, payload} = action;

    switch (type) {
        case 'LOAD_LOCATION_TAXI_CLIENT':
            return {
                ...state,
                location: payload
            };

        case 'CLEAR_LOCATION_TAXI_CLIENT':
            return {
                ...state,
                location: undefined
            };

        case 'ANS_ORDER_TAXI_CLIENT':
            return {
                ...state,
                isSearch: false,
                order: payload
            };

        case 'DRIVER_READY_TAXI_CLIENT':
            return {
                ...state,
                order: {
                    ...state.order,
                    isReady: true,
                    location: state.location
                }
            };

        case 'PLAYER_IN_TAXI_CLIENT':
            return {
                ...state,
                order: {
                    ...state.order,
                    isInTaxi: true
                }
            };

        case 'SET_DESTINATION_TAXI_CLIENT':
            return {
                ...state,
                order: {
                    ...state.order,
                    area: payload.area,
                    street: payload.street,
                    price: payload.price,
                    isSelect: true
                }
            };

        case 'CONFIRM_ORDER_TAXI_CLIENT':
            return {
                ...state,
                order: {
                    ...state.order,
                    isWay: true
                }
            };

        case 'CREATE_ORDER_TAXI_CLIENT':
            return {
                ...state,
                isSearch: true
            };

        case 'CANCEL_ORDER_TAXI_CLIENT':
            return {};

        case 'ERROR_ORDER_TAXI_CLIENT':
            return {
                ...state,
                order: {
                    ...state.order,
                    isWay: false
                }
            }
    }

    return state;
}