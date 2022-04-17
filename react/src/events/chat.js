export default (myEventEmmiter, dispatch) => {
    myEventEmmiter.on('pushChatMessage', (message) => {
        dispatch({
            type: 'ADD_MESSAGE_TO_CHAT',
            payload: message
        });
    });

    myEventEmmiter.on('showChat', (param) => {
        dispatch({
            type: 'SHOW_CHAT',
            payload: param
        });
    });

    myEventEmmiter.on('setFocusChat', (param) => {
        dispatch({
            type: 'SET_FOCUS_CHAT',
            payload: param
        });
    });

    myEventEmmiter.on('setTimeChat', (flag) => {
        dispatch({
            type: 'SET_TIME_CHAT',
            payload: flag
        });
    });

    myEventEmmiter.on('setOpacityChat', (opacity) => {
        dispatch({
            type: 'SET_OPACITY_CHAT',
            payload: opacity
        });
    });

    myEventEmmiter.on('setTagsChat', (tags) => {
        dispatch({
            type: 'SET_TAGS_CHAT',
            payload: tags
        });
    });

    myEventEmmiter.on('setSizeChat', (size) => {
        dispatch({
            type: 'SET_SIZE_CHAT',
            payload: size
        });
    });
}