import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import MainContainer from './MainContainer.jsx';
import store from './helpers/store/store.js';
import './styles/main.css';
import './fonts/fonts.css';
import './styles/animations.css';

import myEventEmmiter from './helpers/events.js';

// eslint-disable-next-line no-undef
mp.react = myEventEmmiter;

ReactDOM.render(
    <Provider store={store}>
        <MainContainer />
    </Provider>,
    document.getElementById('root')
);
