/* eslint-disable no-undef */
import myEventEmmiter from '../helpers/events.js';
import chat from './chat';
import phone from './phone';
import players from './players';
import house from './house';
import houseApp from './house.app';
import biz from './biz';
import bizApp from './biz.app';
import bizFaction from './biz.faction';
import taxiClient from './taxi.client';
import taxiDriver from './taxi.driver';
import bank from './bank';

export const PlayerEvents = (dispatch, getState) => {
    chat(myEventEmmiter, dispatch);
    phone(myEventEmmiter, dispatch);
    players(myEventEmmiter, dispatch);
    house(myEventEmmiter, dispatch);
    houseApp(myEventEmmiter, dispatch);
    biz(myEventEmmiter, dispatch);
    bizApp(myEventEmmiter, dispatch);
    bizFaction(myEventEmmiter, dispatch);
    taxiClient(myEventEmmiter, dispatch);
    taxiDriver(myEventEmmiter, dispatch);
    bank(myEventEmmiter, dispatch);
};




