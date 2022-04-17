/* eslint-disable default-case */
const initialState = {};

export default function house(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case 'HOUSE_SHOW':
            return { ...state, show: true, loading: true }

        case 'HOUSE_CLOSE':
            return {};

        case 'HOUSE_LOAD':
            return { ...state, ...payload, load: true, loading: false };

        case 'HOUSE_BLUR':
            return { ...state, blur: payload };

        case 'HOUSE_LOADING':
            return { ...state, loading: payload };

        case 'HOUSE_MESSAGE':
            return { ...state, message: payload };

        case 'HOUSE_MENU':
            return { ...state, menu: payload ? { show: payload } : null };

        case 'HOUSE_ENTER':
            return { ...state, place: payload, menu: { show: true } }

        case 'HOUSE_ENTER_CLOSE':
            return { ...state, menu: null, place: null }

        case 'HOUSE_ENTER_ANSWER':
            // if (payload === 1) return {};
            if (payload === 0) 
                return {
                    ...state,
                    message: {
                        text: "Дверь заперта",
                        type: 'error'
                    },
                    loading: false,
                    menu: null
                }
            break;

        case 'HOUSE_ENTER_LOADING':
            return { ...state, menu: { ...state.menu, loading: payload } }

        case 'HOUSE_BUY_ANSWER':
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
                        text: "У вас уже есть дом",
                        type: 'error'
                    } 
                }

            if (payload.answer === 1) 
                return { 
                    ...state, 
                    loading: false, 
                    owner: payload.owner,
                    message: {
                        text: "Успешно приобретено",
                        type: 'success'
                    } 
                }
    }

    return state;
}