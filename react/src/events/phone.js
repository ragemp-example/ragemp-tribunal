export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('phone.show', (flag) => {
        dispatch({
            type: 'SHOW_PHONE',
            payload: flag
        });
    });

    myEventEmmiter.on('phone.load', (info) => {
        dispatch({
            type: 'LOAD_INFO_TO_PHONE',
            payload: info
        });
    });

    myEventEmmiter.on('news.price', (symbolPrice) => {
        dispatch({
            type: 'SET_SYMBOL_PRICE_NEWS',
            payload: symbolPrice
        });
    });

    myEventEmmiter.on('phone.message.list', (dialogs) => {
        dispatch({
            type: 'LOAD_DIALOGS',
            payload: dialogs
        });
    });

    myEventEmmiter.on('phone.message.load', (messages, number) => {
        dispatch({
            type: 'LOAD_MESSAGES_TO_DIALOG',
            payload: { messages, number }
        });
    });

    myEventEmmiter.on('phone.message.set', (message, number) => {
        dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                number: number,
                text: message,
                isMine: false,
                isRead: false
            }
        });
    });

    myEventEmmiter.on('phone.contact.mine.update', (oldNumber, newNumber) => {
        dispatch({
            type: 'UPDATE_MY_NUMBER',
            payload: { oldNumber, newNumber }
        });
    });

    myEventEmmiter.on('phone.call.in', (number) => {
        dispatch({
            type: 'INCOMING_CALL',
            payload: { state: true, number: number }
        });
    });

    myEventEmmiter.on('phone.call.end', () => {
        dispatch({
            type: 'SET_CALL_STATUS',
            payload: 5
        });
    });

    myEventEmmiter.on('phone.call.ans', (ans) => {
        dispatch({
            type: 'SET_CALL_STATUS',
            payload: ans
        });
    });

    myEventEmmiter.on('phone.call.story.add', (number, type, date) => {
        dispatch({
            type: 'CALL_STORY_ADD',
            payload: { number, type, date }
        });
    });

    myEventEmmiter.on('phone.app.add', (appName, info) => {
        dispatch({
            type: 'ADD_APP_TO_PHONE',
            payload: { appName, info }
        });
    });

    myEventEmmiter.on('phone.app.remove', (appName) => {
        dispatch({
            type: 'DELETE_APP_TO_PHONE',
            payload: appName
        });
    });

    myEventEmmiter.on('phone.back', () => {
        dispatch({
            type: 'CLOSE_APP',
        });
    });
}