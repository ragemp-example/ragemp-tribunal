import React, {Fragment} from 'react';
import {connect} from "react-redux";
import styles from '@phone/phone.module.scss';
import styled from 'styled-components';
import CreateContact, {Header} from "./CreateContact";

import back_icon from '@imgs/phone/back_icon.svg';
import contact_default from '@imgs/phone/contact_default.svg';
import dialog_icon from '@imgs/phone/chat.svg';
import call_icon from '@imgs/phone/start_call.svg';

import {removeContact} from "@phone/actions/contacts.actions";
import {addApp, closeApp} from '@phone/actions/apps.actions';
import Dialog from "../dialogs/Dialog";
import {addDialog} from "../../actions/dialogs.actions";
import {setActiveCall} from "../../actions/calls.actions";


const Button = styled.div`
  padding: 0.7em;
  color: ${props => props.color};
  border-bottom: 1px solid #EFEFEF;
  font-family: roboto;
`;

const Contact = (props) => {
    const {
        contact,
        contacts,
        removeContactAction,
        closeAppAction,
        addAppAction,
        dialogs,
        addDialogAction,
        setActiveCallAction
    } = props;

    const callContact = () => {
        // eslint-disable-next-line no-undef
        mp.trigger('phone.call.start', contact.number);

        setActiveCallAction(true, contact.name, true);
    };

    return (
        <div className={styles.app}>
            <div className={styles.container}>
                <Header>
                    <span className={styles.back} onClick={closeAppAction}>
                        <img src={back_icon}/>
                        <span>Контакты</span>
                    </span>
                </Header>
                <div className={styles.contactInfo}>
                    <img src={contact_default} />
                    <h1>{ contacts.find(con => con.number === contact.number).name }</h1>
                    <span>{ contact.number }</span>
                </div>
                <div className={styles.connectLine}>
                    <img src={call_icon} onClick={callContact} />
                    <img src={dialog_icon} onClick={() => {
                        if (!dialogs.find(d => d.number === contact.number)) {
                            addDialogAction(contact.number, contact.name);
                        }
                        addAppAction(<Dialog number={contact.number}/>)
                    }}/>
                </div>
                <div>
                    <Button
                        color={'#2496FF'}
                        onClick={() => addAppAction(<CreateContact defaultContact={contact} updatePage/>)}
                    >
                        Редактировать
                    </Button>
                    <Button color={'#FF3838'} onClick={() => {
                        // eslint-disable-next-line no-undef
                        mp.trigger('phone.contact.remove', contact.number);

                        removeContactAction(contact.number);
                        closeAppAction();
                    }}
                    >
                        Удалить контакт
                    </Button>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    contacts: state.info.contacts,
    dialogs: state.dialogs
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    closeAppAction: () => dispatch(closeApp()),
    removeContactAction: number => dispatch(removeContact(number)),
    addDialogAction: (number, name) => dispatch(addDialog(number, name)),
    setActiveCallAction: (state, number, isMine) => dispatch(setActiveCall(state, number, isMine))
});

export default connect(mapStateToProps, mapDispatchToProps)(Contact);