import {HOUSE} from "../reducers/types";

export const changeStateHouse = () => ({
    type: HOUSE.CHANGE_STATE
});

export const setSellStatusHouse = status => ({
    type: HOUSE.SET_SELL_STATUS,
    payload: status
});

export const setSellInfoHouse = info => ({
    type: HOUSE.SET_SELL_INFO,
    payload: info
});

export const sellHouse = name => ({
    type: HOUSE.SELL,
    payload: name
});

export const buyImprovementHouse = type => ({
    type: HOUSE.BUY_IMPROVEMENT,
    payload: type
});

export const setBuyStatusHouse = status => ({
    type: HOUSE.BUY_IMPROVEMENT_ANS,
    payload: status
});