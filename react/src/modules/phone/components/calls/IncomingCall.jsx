import React, {Component, Fragment} from 'react';
import {setCall, setCallStatus, setActiveCall, setIncomingCall} from "../../actions/calls.actions";
import {connect} from "react-redux";

import styles from '@phone/phone.module.scss';

import start_call_icon from '@imgs/phone/call.svg';
import end_call_icon from '@imgs/phone/end_call.svg'
import {setColor} from "../../actions/apps.actions";

class IncomingCall extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastColor: ''
        };

        this.startCall = this.startCall.bind(this);
        this.endCall = this.endCall.bind(this);
    }

    componentDidMount() {
        this.props.setCall(true);
        this.setState({ lastColor: this.props.info.color });
        this.props.setColorAction('white')
    }

    componentWillUnmount() {
        this.props.setCall(false);
        this.props.setColorAction(this.state.lastColor);
    }

    startCall(event) {
        event.preventDefault();
        const { number, setCallStatus, setCall, info, setIncomingCall, setActiveCall } = this.props;
        // eslint-disable-next-line no-undef
        mp.trigger('phone.call.in.ans', 1);
        setIncomingCall(false);
        setCallStatus(0);
        setCall(true);

        let contact = info.contacts.find(con => con.number === number);
        let outputNumber = number;

        if (contact) {
            outputNumber = contact.name
        }

        setActiveCall(true, outputNumber, false);
    }

    endCall(event) {
        event.preventDefault();
        // eslint-disable-next-line no-undef
        mp.trigger('phone.call.in.ans', 0);
        this.props.setCall(false);
        this.props.setIncomingCall(false);
    }

    render() {

        const { info, number } = this.props;

        let contact = info.contacts.find(con => con.number === number);

        return (
            <div className={styles.app} style={{ background: 'linear-gradient(168.08deg, #1B2C36 3.02%, #321A1A 111.94%)' }}>
                <div className={styles.incomingCallText}>
                    <p>ВАМ ЗВОНИТ</p>
                    <b>{ contact ? contact.name : number }</b>
                </div>
                <div className={styles.buttonsLine}>
                    <img src={start_call_icon} onClick={this.startCall} />
                    <img src={end_call_icon} onClick={this.endCall} />
                </div>
            </div>
        );
    }
}


const mapStateToProps = state => ({
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    setCallStatus: status => dispatch(setCallStatus(status)),
    setCall: flag => dispatch(setCall(flag)),
    setActiveCall: (state, number, isMine) => dispatch(setActiveCall(state, number, isMine)),
    setIncomingCall: (state, number) => dispatch(setIncomingCall(state, number)),
    setColorAction: color => dispatch(setColor(color))
});

export default connect(mapStateToProps, mapDispatchToProps)(IncomingCall);