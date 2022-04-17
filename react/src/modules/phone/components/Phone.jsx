import React, { useEffect, useState, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import styles from '@phone/phone.module.scss'
import MainDisplay from "@phone/components/MainDisplay";
import { addApp, closeApp } from '@phone/actions/apps.actions';
import cutout from '@imgs/phone/cutout.svg';
import line from '@imgs/phone/line.svg';
import wallpaper from '@imgs/phone/wallpaper.png';
import TopPanel from "@phone/components/TopPanel";
import IncomingCall from "@phone/components/calls/IncomingCall";
import ActiveCall from "@phone/components/calls/ActiveCall";
import {setIncomingCall} from "../actions/calls.actions";
import {setApp} from "../actions/apps.actions";


const styleDev = {
  bottom: '7%',
  display: 'block'
};

const styleBuild = {
    bottom: '-50%',
    display: 'none'
};

const Phone = ({ apps, info, addAppAction, closeAppAction, setIncomingCallAction, setAppAction }) => {
    const [time, setTime] = useState(moment());

    // useEffect(() => {
    //     setTimeout(() => {
    //         setIncomingCallAction(true, 88988);
    //     }, 1000);
    // }, []);

    useEffect(() => {
        addAppAction(<MainDisplay/>);
        setInterval(() => setTime(moment()), 1000);
    }, []);

    useEffect(() => {
        const onKeypress = e => {
            // console.log(e);

            if (e.key === 'Escape') {
                if (!isDisabled()) closeAppAction();
            }
        };

        document.addEventListener('keydown', onKeypress, false);

        return () => {
            document.removeEventListener('keydown', onKeypress, false);
        };
    }, []);

    const isDisabled = () => {
      if (info.isCall) return true;
      if (info.disabled) return true;

      return false;
    };

    const getColor = () => {
      if (apps.length === 1) return 'white';
      return info.color || 'black';
    };

    return (
        <div id='phone'>
            <img src={wallpaper} className={styles.wallpaper} />
            <div className={styles.display}>
                <TopPanel time={time.tz('Europe/Moscow').format('HH:mm')} color={getColor()} />
                {
                    apps.map((app, index) => <Fragment key={index}>{ app.form || app }</Fragment>)
                }
                { info.incomingCall && info.incomingCall.state && <IncomingCall number={info.incomingCall.number} /> }
                { info.activeCall && info.activeCall.state && <ActiveCall number={info.activeCall.number} isMine={info.activeCall.isMine}/> }
            </div>
            <div className={styles.cutout}>
                <img src={cutout} />
            </div>
            <div className={styles.bottomLine} onClick={() => {
                if (!isDisabled()) setAppAction(<MainDisplay />)
            }}>
                <img src={line} />
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    apps: state.apps,
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    setAppAction: app => dispatch(setApp(app)),
    closeAppAction: () => dispatch(closeApp()),
    // setIncomingCallAction: (state, number) => dispatch(setIncomingCall(state, number))
});

export default connect(mapStateToProps, mapDispatchToProps)(Phone);