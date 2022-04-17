export const closeBizPanel = () => ({
    type: 'BIZ_CLOSE'
});

export const showBizPanel = () => ({
    type: 'BIZ_SHOW'
});

export const loadBizInfo = (info) => ({
    type: 'BIZ_LOAD',
    payload: info
});

export const blurBizPanel = (state) => ({
    type: 'BIZ_BLUR',
    payload: state
});

export const loadingBizPanel = (state) => ({
    type: 'BIZ_LOADING',
    payload: state
});

export const menuBiz = (state) => ({
    type: 'BIZ_MENU',
    payload: state
});

export const messageBiz = (text, type) => ({
    type: 'BIZ_MESSAGE',
    payload: text ? { text, type } : null
});

export const answerBuyBiz = (answer, owner) => ({
    type: 'BIZ_BUY_ANSWER',
    payload: { answer, owner }
});
