import React, {Fragment, useState} from 'react';
import _ from 'lodash';
import styles from '@phone/phone.module.scss';
import add_icon from '@imgs/phone/add_icon.svg';
import search_icon from '@imgs/phone/search.svg';
import {connect} from "react-redux";
import {removeContact, updateContact, addContact} from "@phone/actions/contacts.actions";
import {addApp, closeApp} from '@phone/actions/apps.actions';
import CreateContact from "./CreateContact";
import Contact from "./Contact";

const Contacts = (props) => {
    const {
        contacts,
        addContactAction,
        removeContactAction,
        updateContactAction,
        addAppAction,
        closeAppAction
    } = props;

    const [searchValue, setSearchValue] = useState('');

    const addContact = (number, name) => {
        addContactAction(number, name);
        closeAppAction()
    };

    const getContacts = () =>
        _(contacts)
            .filter(contact => contact.name.toLowerCase().startsWith(searchValue.toLowerCase()))
            .sortBy(contact => contact.name)
            .groupBy(contact => contact.name[0].toUpperCase())
            .map((groupedContacts, letter) => ({ groupedContacts, letter }))
            .value()
            .map((group, index) => (
                <div key={index} className={styles.contactsGroup}>
                    <b>{group.letter}</b>
                    { group.groupedContacts.map((contact, ind) =>
                        <div
                            key={ind}
                            className={styles.contact}
                            onClick={() => addAppAction(<Contact contact={contact}/>)}
                        >
                            {contact.name}
                        </div>)
                    }
                </div>
            ));

    return (
        <div className={styles.app}>
            <div className={styles.container}>
                <div className={styles.contactsHeader}>
                    <img src={add_icon} onClick={() => addAppAction(
                        <CreateContact />)}
                    />
                    <h1>Контакты</h1>
                </div>
                <div className={styles.search}>
                    <img src={search_icon} />
                    <input
                        placeholder='Поиск'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <div className={styles.contactsList}>
                    { getContacts() }
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    contacts: state.info.contacts
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    closeAppAction: () => dispatch(closeApp()),
    removeContactAction: number => dispatch(removeContact(number)),
    addContactAction: (number, name) => dispatch(addContact(number, name)),
    updateContactAction: (number, newName) => dispatch(updateContact(number, newName))
});

export default connect(mapStateToProps, mapDispatchToProps)(Contacts);