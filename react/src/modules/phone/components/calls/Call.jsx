import React, {useState, useEffect} from 'react';
import styles from '@phone/phone.module.scss';
import add_icon from '@imgs/phone/add_icon.svg';
import delete_icon from '@imgs/phone/delete_icon.svg';
import call_icon from '@imgs/phone/call.svg';
import { addApp } from '@phone/actions/apps.actions'
import {connect} from "react-redux";
import CreateContact from "../contacts/CreateContact";
import {setActiveCall, setCall, setCallStatus} from "../../actions/calls.actions";
import {setColor} from "../../actions/apps.actions";
import EmergencyCall from "./EmergencyCall";

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

const Call = ({ contacts, addAppAction, setCallAction, setCallStatusAction, setActiveCallAction, setColorAction }) => {
    const [number, setNumber] = useState('');

    const clear = () => setNumber(number.slice(0, number.length - 1));

    const startCall = () => {
        if (!number) return;

        if (number === '911') return addAppAction(<EmergencyCall/>);

        let outputNumber;

        if (number) {
            let contact = contacts.find(cont => cont.number === number);

            if (contact) {
                outputNumber = contact.name;
            } else {
                outputNumber = number;
            }

            setCallAction(true);
            setCallStatusAction(null);
            setActiveCallAction(true, outputNumber, true);

            // eslint-disable-next-line no-undef
            mp.trigger('phone.call.start', number);
        }
    }

    return (
        <div className={styles.app}>
            <div className={styles.callHeader}>
                <div>
                    <img src={add_icon} onClick={() => {
                        if (number) {
                            let isContact = contacts.find(con => con.number == number);
                            addAppAction(<CreateContact
                                defaultContact={{number, name: isContact && isContact.name}}
                                updatePage={isContact}
                            />)
                        }
                    }} />
                </div>
                <span>{ number }</span>
                <div>
                    <img src={delete_icon} onClick={clear} />
                </div>
            </div>
            <div className={styles.callDigits}>
                {
                    digits.map((digit, index) => (
                        <div
                            className={styles.callDigit}
                            key={index}
                            onClick={() => {
                                if (number.length === 8) return;

                                setNumber(number + digit)
                            }}
                        >
                            {digit}
                        </div>
                    ))
                }
                <div></div>
                <div style={{ textAlign: 'center' }}>
                    <img src={call_icon} onClick={startCall} />
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
   contacts: state.info.contacts,
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    setCallStatusAction: status => dispatch(setCallStatus(status)),
    setCallAction: flag => dispatch(setCall(flag)),
    setActiveCallAction: (state, number, isMine) => dispatch(setActiveCall(state, number, isMine)),
    setColorAction: color => dispatch(setColor(color))
});

export default connect(mapStateToProps, mapDispatchToProps)(Call);