export const setOpacityChat = opacity => ({
    type: 'SET_OPACITY_CHAT',
    payload: opacity
});

export const showChat = (param) => ({
    type: 'SHOW_CHAT',
    payload: param
});

export const setFocusChat = (param) => ({
    type: 'SET_FOCUS_CHAT',
    payload: param
});

export const setTagsChat = (tags) => ({
    type: 'SET_TAGS_CHAT',
    payload: tags
});

export const pushMessage = (message) => ({
    type: 'ADD_MESSAGE_TO_CHAT',
    payload: message
});
