/* eslint-disable default-case */
import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';

import styles from '../../phone.module.scss';
import end_call_icon from '@imgs/phone/end_call.svg'

import {setCall, setCallStatus, setActiveCall} from "../../actions/calls.actions";
import {setColor} from "../../actions/apps.actions";

class ActiveCall extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: '',
            isEnd: false,
            isStart: false,
            lastColor: ''
        };

        this.endCall = this.endCall.bind(this);
    }

    startCall() {
        setInterval(() => {!this.state.isEnd && this.increment()}, 1000)
    }

    componentDidMount() {
        const { setCall, info, setCallStatus, setColorAction } = this.props;
        setCall(true);

        // eslint-disable-next-line no-undef
        // mp.trigger('chat.message.get', 1, info.activeCall.callStatus.toString());

        if(info.activeCall.callStatus != null && info.activeCall.callStatus === 0) {
            if(!this.state.isStart) {
                this.setState({time: '00:00'});
                this.startCall();
                this.setState({isStart: true})
            }
        }

        this.setState({ lastColor: info.color });
        setColorAction('white');

        // setTimeout(() => {
        //     setCallStatus(0);
        // }, 1500)

        // setTimeout(() => {
        //     setCallStatus(2);
        // }, 2500)
    }

    componentDidUpdate() {
        const { info, setActiveCall } = this.props;

        if (info.activeCall.callStatus == null) return;

        if(info.activeCall.callStatus !== 0) {
            if (!this.state.isEnd) {
                this.setState({isEnd: true});
                setTimeout(() => {
                    setActiveCall(false);
                }, 1500)
            }
        } else {
            if(!this.state.isStart) {
                this.setState({time: '00:00'});
                this.startCall();
                this.setState({isStart: true})
            }
        }
    }

    componentWillUnmount() {
        this.props.setCallStatus(null);
        this.props.setCall(false);
        this.props.setColorAction(this.state.lastColor)
    }

    increment() {
        const { time } = this.state;
        if(time.length === 5) {
            var min = String(time).split(':')[0];
            var sec = String(time).split(':')[1];

            sec = Number(sec);
            sec += 1;

            if(sec >= 60) {
                sec %= 60;
                min = Number(min);
                min += 1;
                if(min < 10) {
                    min = '0' + min;
                }
            }

            if(sec < 10) {
                sec = '0' + sec;
            }

            let newTime;

            if(min == 60) {
                newTime = '01:00' + ':' + sec;
            } else {
                newTime = min + ':' + sec;
            }
            this.setState({time: newTime})
        } else {
            var hour = String(time).split(':')[0];
            var min = String(time).split(':')[1];
            var sec = String(time).split(':')[2];

            sec = Number(sec);
            sec += 1;

            if(min >= 60) {
                min %= 60;
                hour = Number(hour);
                hour += 1;
                if(hour < 10) {
                    hour = '0' + hour;
                }
            }

            if(sec >= 60) {
                sec %= 60;
                min = Number(min);
                min += 1;
                if(min < 10) {
                    min = '0' + min;
                }
            }

            if(sec < 10) {
                sec = '0' + sec;
            }

            let newTime = hour + ':' + min + ':' + sec;
            this.setState({time: newTime})
        }
    }

    endCall(event) {
        event.preventDefault();

        const { setCall, setCallStatus, setActiveCall } = this.props;

        setCall(false);
        setCallStatus(5);
        this.setState({ isEnd: true });

        // eslint-disable-next-line no-undef
        mp.trigger('phone.call.end');

        setTimeout(() => {
            setActiveCall(false);
            setCallStatus(null);
        }, 1500);
    }

    convertCallStatus(status) {
        switch (status) {
            case 0:
                return 'Звонок идет';
            case 1:
                return 'Нет номера';
            case 2:
                return 'Абонент занят';
            case 3:
                return 'Сброс вызова';
            case 4:
                return 'Абонент не поднял трубку';
            case 5:
                return 'Звонок завершен';
            default:
                return 'Набор номера';
        }
    }

    render() {

        const { number, info, isMine } = this.props;
        const { time } = this.state;

        // eslint-disable-next-line no-undef
        // mp.trigger('chat.message.get', 1, info.activeCall.callStatus.toString());

        return (
            <div className={styles.app} style={{ background: 'linear-gradient(168.08deg, #1B2C36 3.02%, #321A1A 111.94%)', animation: 'none' }}>
                <div className={styles.incomingCallText}>
                    <p>{ this.convertCallStatus(info.activeCall.callStatus) }</p>
                    <b>{ number }</b>
                    <p>{ time }</p>
                </div>
                {
                    !this.state.isEnd &&
                    <div className={styles.buttonsLine}>
                        <img src={end_call_icon} onClick={this.endCall} />
                    </div>
                }
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
    setColorAction: color => dispatch(setColor(color))
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveCall);