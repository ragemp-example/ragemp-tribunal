export const closeBank = () => ({
    type: 'CLOSE_BANK'
});

export const loadBankInfo = info => ({
   type: 'LOAD_BANK_INFO',
   payload: info
});

export const setLoadingBank = flag => ({
   type: 'SET_LOADING_BANK',
   payload: flag
});

export const pushBank = money => ({
    type: 'PUSH_BANK',
    payload: money
});

export const pushPhoneBank = money => ({
    type: 'PUSH_PHONE_BANK',
    payload: money
});

export const popBank = money => ({
    type: 'POP_BANK',
    payload: money
});

export const transferBank = money => ({
    type: 'TRANSFER_BANK',
    payload: money
});

export const payHouseBank = (name, days, money) => ({
    type: 'PAY_HOUSE_BANK',
    payload: { name, days, money }
});

export const payBusinessBank = (id, days, money) => ({
    type: 'PAY_BUSINESS_BANK',
    payload: { id, days, money }
});

export const pushCashBoxBank = (id, money) => ({
    type: 'PUSH_CASHBOX_BANK',
    payload: { id, money }
});

export const popCashBoxBank = (id, money) => ({
    type: 'POP_CASHBOX_BANK',
    payload: { id, money }
});

export const setArgsBank = args => ({
    type: 'SET_ARGS_BANK',
    payload: args
});

export const setAnswerBank = answer => ({
    type: 'SET_ANSWER_BANK',
    payload: answer
});

export const setAskAnswerBank = (nick, clear) => ({
    type: 'SET_ASK_ANSWER_BANK',
    payload: {nick, clear}
});