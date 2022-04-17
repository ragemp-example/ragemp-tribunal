/* eslint-disable default-case */
const initialState = {
    isLoading: true,
};

export default function bank(state = initialState, action) {
    const { type, payload } = action;
    const { cash, money, phoneMoney } = state;

    switch (type) {
        case 'SHOW_BANK':
        case 'LOAD_BANK_INFO':
            return payload;

        case 'UPDATE_BANK':
            if (state.cash) {
                return {
                    ...state,
                    ...payload
                };
            } else return state;

        case 'CLOSE_BANK':
            return {};

        case 'SET_LOADING_BANK':
            return {
                ...state,
                isLoading: payload
            };

        case 'PUSH_BANK':
            return {
                ...state,
                cash: cash - payload,
                money: money + payload
            };

        case 'PUSH_PHONE_BANK':
            return {
                ...state,
                money: money - payload,
                phoneMoney: phoneMoney + payload
            };

        case 'POP_BANK':
            return {
                ...state,
                cash: cash + payload,
                money: money - payload
            };

        case 'TRANSFER_BANK':
            return {
                ...state,
                money: money - payload
            };

        case 'PAY_HOUSE_BANK':
            const newStateHouse = {
                ...state,
                money: money - payload.money,  
            };

            newStateHouse.houses[0].days += payload.days;

            return newStateHouse;

        case 'PAY_BUSINESS_BANK':
            const newStateBiz = {
                ...state,
                money: money - payload.money,
            };

            newStateBiz.biz[0].days += payload.days;

            return newStateBiz;

        case 'PUSH_CASHBOX_BANK':
            const newStateCashBoxPush = {
                ...state,
                money: money - payload.money
            };

            newStateCashBoxPush.biz[0].cashBox += payload.money;

            return newStateCashBoxPush;

        case 'SET_ANSWER_BANK':
            return  {
                ...state,
                answer: payload.answer,
                type: payload.type,
                isLoading: false
            };

        case 'SET_ARGS_BANK':
            return {
                ...state,
                args: payload
            };

        case 'SET_ASK_ANSWER_BANK':
            return {
                ...state,
                isLoading: false,
                askAnswer: payload.clear ? null : { nick: payload.nick }
            };

        case 'POP_CASHBOX_BANK':
            const newStateCashBoxPop = {
                ...state,
                money: money + payload.money
            };

            newStateCashBoxPop.biz[0].cashBox -= payload.money;

            return newStateCashBoxPop;
    }

    return state;
}