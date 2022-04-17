import {BANK_APP} from "../modules/phone/reducers/types";

export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('bank.show', (bankInfo) => {
        dispatch({
            type: 'SHOW_BANK',
            payload: bankInfo
        });
    });

    myEventEmmiter.on('bank.update', (bankInfo) => {
        dispatch({
            type: 'UPDATE_BANK',
            payload: bankInfo
        });
    });


    myEventEmmiter.on('bank.close', () => {
        dispatch({
            type: 'CLOSE_BANK'
        });
    });

    myEventEmmiter.on('bank.push.ans', (result) => {
        dispatch({
            type: 'SET_ANSWER_BANK',
            payload: {
                type: 'push',
                answer: result
            }
        });
    });

    myEventEmmiter.on('bank.pop.ans', (result) => {
        dispatch({
            type: 'SET_ANSWER_BANK',
            payload: {
                type: 'pop',
                answer: result
            }
        });
    });

    myEventEmmiter.on('bank.phone.push.ans', (result) => {
        dispatch({
            type: 'SET_ANSWER_BANK',
            payload: {
                type: 'phone',
                answer: result
            }
        });
    });

    myEventEmmiter.on('bank.house.push.ans', (result) => {
        dispatch({
            type: 'SET_ANSWER_BANK',
            payload: {
                type: 'house',
                answer: result
            }
        });
    });

    myEventEmmiter.on('bank.biz.push.ans', (result) => {
        dispatch({
            type: 'SET_ANSWER_BANK',
            payload: {
                type: 'biz',
                answer: result
            }
        });
    });

    myEventEmmiter.on('bank.biz.cashbox.push.ans', (result) => {
        dispatch({
            type: 'SET_ANSWER_BANK',
            payload: {
                type: 'cashbox_push',
                answer: result
            }
        });
    });

    myEventEmmiter.on('bank.biz.cashbox.pop.ans', (result) => {
        dispatch({
            type: 'SET_ANSWER_BANK',
            payload: {
                type: 'cashbox_pop',
                answer: result
            }
        });
    });

    myEventEmmiter.on('bank.transfer.ask.ans', (nick) => {
        dispatch({
            type: 'SET_ASK_ANSWER_BANK',
            payload: {nick}
        });
    });

    myEventEmmiter.on('bank.transfer.ans', (result) => {
        dispatch({
            type: 'SET_ANSWER_BANK',
            payload: {
                type: 'transfer',
                answer: result
            }
        });
    });

    myEventEmmiter.on('bank.phoneApp.show.ans', (data) => {
        dispatch({
            type: BANK_APP.SHOW,
            payload: data
        });
    });
}