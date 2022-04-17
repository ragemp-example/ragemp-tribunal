/* eslint-disable default-case */
const initialState = {};

export default function biz(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case 'BIZ_SHOW':
            return { ...state, show: true, loading: true }

        case 'BIZ_CLOSE':
            return {};

        case 'BIZ_LOAD':
            return { ...state, ...payload, load: true, loading: false };

        case 'BIZ_BLUR':
            return { ...state, blur: payload };

        case 'BIZ_LOADING':
            return { ...state, loading: payload };

        case 'BIZ_MESSAGE':
            return { ...state, message: payload };

        case 'BIZ_MENU':
            return { ...state, menu: payload ? { show: payload } : null };

        case 'BIZ_BUY_ANSWER':
            if (payload.answer === 0) 
                return { 
                    ...state,
                    loading: false, 
                    message: {
                        text: "У вас недостаточно денег для покупки",
                        type: 'error'
                    } 
                }

            if (payload.answer === 2) 
                return { 
                    ...state, 
                    loading: false, 
                    message: {
                        text: "У вас уже есть бизнес",
                        type: 'error'
                    } 
                }

            if (payload.answer === 1) 
                return { 
                    ...state, 
                    loading: false, 
                    owner: payload.owner,
                    actions: payload.actions,
                    message: {
                        text: "Успешно приобретено",
                        type: 'success'
                    } 
                }
    }

    return state;
}