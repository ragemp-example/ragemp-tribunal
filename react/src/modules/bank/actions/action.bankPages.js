export const addBankPage = page => ({
    type: 'ADD_BANK_PAGE',
    payload: page
});

export const setBankPage = page => ({
    type: 'SET_BANK_PAGE',
    payload: page
});

export const closeBankPage = () => ({
    type: 'CLOSE_BANK_PAGE'
});