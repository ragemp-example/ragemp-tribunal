import {APPS} from "../reducers/types";

export const addApp = app => ({
   type: APPS.ADD,
   payload: app
});

export const setApp = app => ({
   type: APPS.SET,
   payload: app
});

export const setApps = apps => ({
   type: APPS.SET_APPS,
   payload: apps
});

export const closeApp = () => ({
   type: APPS.CLOSE,
});

export const disabledHome = state => ({
   type: 'DISABLED_HOME',
   payload: state
});

export const setColor = color => ({
   type: 'SET_COLOR',
   payload: color
});
