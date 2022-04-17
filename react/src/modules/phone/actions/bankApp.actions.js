import {BANK_APP} from "../reducers/types";

export const showBankApp = data => ({
   type: BANK_APP.SHOW,
   payload: data
});

export const updateBankApp = data => ({
   type: BANK_APP.UPDATE,
   payload: data
});

export const setAskAnswerBank = (nick, clear) => ({
   type: BANK_APP.ASK_ANSWER,
   payload: { nick, clear }
});

export const setAnswerBankApp = answer => ({
   type: BANK_APP.ANSWER,
   payload: {answer}
});

export const transferBankApp = money => ({
   type: BANK_APP.TRANSFER,
   payload: { money }
});

export const taxesHouseBankApp = (money, days, id) => ({
   type: BANK_APP.TAXES_HOUSE,
   payload: { money, days, id }
});

export const taxesBizBankApp = (money, days, id) => ({
   type: BANK_APP.TAXES_BIZ,
   payload: { money, days, id }
});