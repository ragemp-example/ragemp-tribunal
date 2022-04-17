import {BIZ} from '../reducers/types';

export const setSellStatusBusiness = status => ({
    type: BIZ.SET_SELL_STATUS,
    payload: status
});

export const setSellInfoBusiness = info => ({
    type: BIZ.SET_SELL_INFO,
    payload: info
});

export const createOrderBusiness = (productsCount, productsPrice) => ({
    type: BIZ.CREATE_ORDER,
    payload: { productsCount, productsPrice }
});

export const cancelOrderBusiness = () => ({
    type: BIZ.CANCEL_ORDER
});

export const setOrderStatusBusiness = status => ({
    type: BIZ.SET_ORDER_STATUS,
    payload: status
});

export const sellBusiness = id => ({
    type: BIZ.SELL,
    payload: id
});

export const buyImprovementBusiness = type => ({
    type: BIZ.BUY_IMPROVEMENT,
    payload: type
});

export const setBuyStatusBusiness = status => ({
    type: BIZ.BUY_IMPROVEMENT_ANS,
    payload: status
});

export const updateCashBoxBusiness = money => ({
    type: BIZ.UPDATE_CASHBOX,
    payload: money
});