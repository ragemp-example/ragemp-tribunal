import React from 'react';
import {APPS} from "./types";
import MainDisplay from "../../phone/components/MainDisplay";


const initialState = [];

export default (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case APPS.ADD:
            return [
                ...state,
                payload
            ];

        case APPS.SET:
            return [ payload ];

        case APPS.SET_APPS:
            return payload;

        case APPS.CLOSE:
            return state.length > 1 ? state.filter((_, index) => index !== state.length - 1) : state;

        case 'DELETE_APP_TO_PHONE':
            const newStateDel = [ ...state ];

            let appName;

            if (payload === 'house') {
                appName = 'HouseApp'
            }

            if (payload === 'biz') {
                appName = 'BusinessApp'
            }

            if (payload === 'taxi') {
                appName = 'TaxiDriver'
            }

            let indDel = newStateDel.findIndex(app => app.name === appName);
            if (indDel !== -1) {
                return [ <MainDisplay /> ]
            } else {
                return  newStateDel;
            }

        default:
            return state;
    }
}