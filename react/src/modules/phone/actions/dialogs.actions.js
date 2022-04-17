import {DIALOGS} from "../reducers/types";

export const addDialog = (number, name) => ({
   type: DIALOGS.ADD,
   payload: { number, name }
});

export const readDialog = (number) => ({
    type: DIALOGS.READ,
    payload: number
});

export const removeDialog = (number) => ({
    type: DIALOGS.REMOVE,
    payload: number
});

export const addMessage = (number, text, isMine, isRead) => ({
   type: DIALOGS.ADD_MESSAGE,
   payload: { number, text, isMine, isRead }
});

export const renameDialog = (number, newName) => ({
   type: DIALOGS.RENAME,
   payload: { number, newName }
});