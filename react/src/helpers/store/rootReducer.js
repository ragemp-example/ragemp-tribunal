import { combineReducers } from 'redux';

import forms from './forms';
import chat from '../../modules/chat/reducers/reducer.chat';
import apps from '../../modules/phone/reducers/apps.reducer';
import info from '../../modules/phone/reducers/info.reducer';
import dialogs from '../../modules/phone/reducers/dialogs.reducer';
import house from '../../modules/houses/reducers/reducer.house';
import biz from '../../modules/biz/reducers/reducer.biz';
import bank from '../../modules/bank/reducers/reducer.bank';
import bankPages from '../../modules/bank/reducers/reducer.bankPages';
import taxiClient from '../../modules/phone/reducers/taxi.client.reducer';
import taxiDriver from '../../modules/phone/reducers/taxi.driver.reducer';
import players from '../../modules/players/reducers/reducer.players';
import bankApp from '../../modules/phone/reducers/bankApp.reducer';

export default combineReducers({
    forms,
    chat,
    apps,
    info,
    dialogs,
    house,
    biz,
    bank,
    bankPages,
    taxiClient,
    taxiDriver,
    players,
    bankApp
});