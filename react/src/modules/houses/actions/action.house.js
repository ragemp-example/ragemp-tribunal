export const closeHousePanel = () => ({
    type: 'HOUSE_CLOSE'
});

export const showHousePanel = () => ({
    type: 'HOUSE_SHOW'
});

export const loadHouseInfo = (info) => ({
    type: 'HOUSE_LOAD',
    payload: info
});

export const blurHousePanel = (state) => ({
    type: 'HOUSE_BLUR',
    payload: state
});

export const loadingHousePanel = (state) => ({
    type: 'HOUSE_LOADING',
    payload: state
});

export const menuHouse = (state) => ({
    type: 'HOUSE_MENU',
    payload: state
});

export const messageHouse = (text, type) => ({
    type: 'HOUSE_MESSAGE',
    payload: text ? { text, type } : null
});

export const answerBuyHouse = (answer, owner) => ({
    type: 'HOUSE_BUY_ANSWER',
    payload: { answer, owner }
});

export const loadingEnterHouse = (state) => ({
    type: 'HOUSE_ENTER_LOADING',
    payload: state
});

export const answerEnterHouse = (answer) => ({
    type: 'HOUSE_ENTER_ANSWER',
    payload: answer
});
