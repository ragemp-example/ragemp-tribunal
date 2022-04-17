import {CONTACTS} from "@phone/reducers/types";

export const addContact = (number, name) => ({
   type: CONTACTS.ADD,
   payload: { name, number }
});

export const removeContact = (number) => ({
   type: CONTACTS.REMOVE,
   payload: number
});

export const updateContact = (number, newName) => ({
   type: CONTACTS.UPDATE,
   payload: { number, newName }
});