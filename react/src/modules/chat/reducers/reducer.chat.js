const initialState = {
    isShow: true,
    messages: [],
    opacity: 1,
    time: true,
    tags: [
        // { id: 1, name: 'Сказатьвфцвц' }
    ],
    isFocus: false,
    size: 1
};

export default function chatList(state = initialState, action) {
    const { type, payload } = action;
    const { messages } = state;

    const CHAT_SIZE = 100;

    switch (type) {
        case 'ADD_MESSAGE_TO_CHAT':
            if (state.messages.length < CHAT_SIZE) {
                return {
                    ...state,
                    messages: [
                        ...messages,
                        {
                            text: formatMessage(payload),
                            time: getTime()
                        }
                    ]
                }
            } else {
                const newState = {
                    ...state
                };
                newState.messages.splice(0, 1);
                newState.messages.push(
                    {
                        text: formatMessage(payload),
                        time: getTime()
                    }
                );
                return newState;
            }
        case 'SET_OPACITY_CHAT':
            return {
                ...state,
                opacity: payload
            };
        case 'SHOW_CHAT':
            return {
                ...state,
                isShow: payload
            };

        case 'SET_FOCUS_CHAT':
            return {
                ...state,
                isFocus: payload
            };

        case 'SET_TAGS_CHAT':
            return {
                ...state,
                tags: payload
            };

        case 'SET_TIME_CHAT':
            return {
                ...state,
                time: payload
            };

        case 'SET_SIZE_CHAT':
            let newSize = 0.5 + 0.25 * payload
            return {
                ...state,
                size: newSize
            }

        default:
            break;
    }

    return state;
}

function formatMessage(message) {
    var reg = /!{#[a-f0-9]{6}}/g;
    var regColor = /#[a-f0-9]{6}/g;
    var outputArray = [];

    if (message) {
        if (!reg.test(message)) {
            outputArray.push(
                {
                    text: message,
                    color: 'white'
                }
            );
            return outputArray;
        }
        var inputArray = message.split(reg);
    
        let colorIndex = 0;
    
        for (let wordIndex = 0; wordIndex < inputArray.length; wordIndex++) {
            if(inputArray[wordIndex].trim() != '') {
                outputArray.push({
                    text: inputArray[wordIndex],
                    color: message.match(reg)[colorIndex].match(regColor)[0]
                });
                colorIndex++;
            } else {
                outputArray.push(
                    {
                        text: '',
                        color: message.match(reg)[colorIndex].match(regColor)[0]
                    }
                )
            }
        }
    }

    return outputArray;
}

function getTime() {
    let date = new Date();
    return `[${String('00' + date.getHours()).slice(-2)}:${String('00' + date.getMinutes()).slice(-2)}:${String('00' + date.getSeconds()).slice(-2)}] `
}