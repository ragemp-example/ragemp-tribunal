/* eslint-disable default-case */
import React from 'react'
import BankMenu from "../components/BankMenu";

const initialState = [ <BankMenu /> ];

export default function bankPages(state = initialState, action) {
    const {type, payload} = action;
    var newState;

    switch (type) {
        case 'SET_BANK_PAGE':
            return [ payload ];

        case 'ADD_BANK_PAGE':
            return [ ...state, payload ];

        case 'CLOSE_BANK_PAGE':
            newState = [ ...state ];

            if (newState.length > 1) {
                newState.splice(newState.length - 1, 1);
            }

            return newState;

        case 'CLOSE_BANK':
            return [ <BankMenu /> ];
    }

    return state;
}