import {BANK_APP} from "./types";

const initialState = {

};

export default (state = initialState, action) => {
    const {type, payload} = action;

    switch (type) {
        case BANK_APP.SHOW:
            return payload;

        case 'TRANSFER_BANK':
        case BANK_APP.TRANSFER:
            return {
                ...state,
                money: state.money - (payload.money || payload)
            };

        case BANK_APP.UPDATE:
            return {
              ...state,
              ...payload
            };

        case 'SET_ASK_ANSWER_BANK':
        case BANK_APP.ASK_ANSWER:
            return {
                ...state,
                askAnswer: payload.clear ? null : { nick: payload.nick }
            };

        case 'SET_ANSWER_BANK':
        case BANK_APP.ANSWER:
            return {
              ...state,
              answer: payload.answer
            };

        case 'PAY_BUSINESS_BANK':
        case BANK_APP.TAXES_BIZ:
            return {
                ...state,
                money: state.money - payload.money,
                biz: state.biz.map(b => {
                    if (b.id === payload.id) {
                        return {
                            ...b,
                            days: b.days + payload.days
                        }
                    }

                    return b;
                })
            };

        case 'PAY_HOUSE_BANK':
        case BANK_APP.TAXES_HOUSE:
            return {
                ...state,
                money: state.money - payload.money,
                houses: state.houses.map(house => {
                    if (house.name === payload.id) {
                        return {
                            ...house,
                            days: house.days + payload.days
                        }
                    }

                    return house;
                })
            };

        default:
            return state;
    }

    return state;
}