/* eslint-disable default-case */
import $ from 'jquery';

const initialState = {
    phone: true,
    // house: true,
    // business: true,
    // bank: true,
    // players: true
};

export default function forms(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case 'SHOW_PHONE':
            if (payload) {
                $('#phone').animate({ bottom: '10%' }, 100);
                $('#phone').css({ "display": "block" });
            } else {
                $('#phone').animate({ bottom: '-50%' }, 100, function() {
                    $('#phone').css({ "display": "none" })
                });
            }
            return {
                ...state,
                phone: payload
            };

        case 'HOUSE_ENTER':
        case 'HOUSE_SHOW':
            return {
                ...state,
                house: true
            };

        case 'HOUSE_ENTER_CLOSE':
        case 'HOUSE_CLOSE':
            return {
                ...state,
                house: false
            };

        case 'BIZ_SHOW':
            return {
                ...state,
                business: true
            };

        case 'BIZ_CLOSE':
            return {
                ...state,
                business: false
            };

        case 'SHOW_BANK':
            return {
                ...state,
                bank: true
            };

        case 'CLOSE_BANK':
            return {
                ...state,
                bank: false
            };

        case 'SHOW_PLAYERS':
            return {
                ...state,
                players: payload
            };
    }

    return state;
}
