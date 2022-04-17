import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import styles from '@phone/phone.module.scss';
import {connect} from "react-redux";
import {addApp} from '@phone/actions/apps.actions'
import search_icon from '@imgs/phone/search.svg';
import arrow from '@imgs/phone/arrow.svg';
import Dialog from "./Dialog";
import {addMessage, renameDialog} from "../../actions/dialogs.actions";


const Title = styled.p`
  text-align: center;
  font-weight: bold;
  margin-top: 2.5em;
`;

const Search = styled.div`
  width: 100%;
  padding: 0.3em 0.8em;
  box-sizing: border-box;
  margin-top: 1em;
  background-color: #EFEFEF;
`;

const Dialogs = ({ dialogs, contacts, addAppAction, addMessageAction, renameDialogAction }) => {
    const [searchValue, setSearchValue] = useState('');

    // useEffect(() => {
    //     setTimeout(() => addMessageAction('123', 'hi', false, false), 1000)
    // }, []);

    const getSenderName = (dialog) => {
        if (dialog.name) return dialog.name;

        const contact = contacts.find(c => c.number === dialog.number);
        if (contact) {
            renameDialogAction(dialog.number, contact.name);
            return contact.name;
        }

        return dialog.number;
    };

    const getTimeMessage = date =>
        `${String('00' +
            new Date(date).getHours()).slice(-2)}:${String('00'
            + new Date(date).getMinutes()).slice(-2)}`;

    const getDialogs = () =>
        _(dialogs)
            .filter(dialog => {
                if (dialog.name) return dialog.name.toLowerCase().startsWith(searchValue.toLowerCase());
                if (dialog.number) return dialog.number.toLowerCase().startsWith(searchValue.toLowerCase())
            })
            .orderBy(dialog => new Date(dialog.PhoneMessages.length > 0 ? dialog.PhoneMessages.slice(-1)[0].date : Date.now()), ['desc'])
            .value()
            .filter(dialog => dialog.PhoneMessages.length > 0)
            .map((dialog, index) => (
                <div className={styles.dialog} key={index} onClick={() => addAppAction(<Dialog number={dialog.number}/>)}>
                    <div className={styles.dialogInfo}>
                        <b>{getSenderName(dialog)}</b>
                        <div className={styles.dialogTime}>
                            <span>{dialog.PhoneMessages.slice(-1)[0] ? getTimeMessage(dialog.PhoneMessages.slice(-1)[0].date) : ''}</span>
                            <img src={arrow} />
                        </div>
                    </div>
                    <p>
                        { dialog.PhoneMessages.slice(-1)[0].isMine && 'Вы: ' }
                        { dialog.PhoneMessages.slice(-1)[0].text }
                    </p>
                </div>
            ));

    return (
        <div className={styles.app}>
            <Title>Сообщения</Title>
            <Search>
                <div className={styles.dialogsSearch}>
                    <img src={search_icon} />
                    <input
                        placeholder='Поиск'
                        value={searchValue}
                        maxLength={15}
                        onChange={e => setSearchValue(e.target.value)}
                    />
                </div>
            </Search>
            <div className={styles.container} style={{ marginTop: '1em' }}>
                <div className={styles.dialogsList}>
                    { getDialogs() }
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    dialogs: state.dialogs,
    contacts: state.info.contacts
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    renameDialogAction: (number, newName) => dispatch(renameDialog(number, newName)),
    addMessageAction: (number, text, isMine, isRead) => dispatch(addMessage(number, text, isMine, isRead))
});

export default connect(mapStateToProps, mapDispatchToProps)(Dialogs);