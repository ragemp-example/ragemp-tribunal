import React, {useState} from 'react';
import {connect} from 'react-redux';
import {addApp} from "../../../actions/apps.actions";
import {setActiveCall, setCall, setCallStatus} from "../../../actions/calls.actions";
import styles from '../../../phone.module.scss';
import styled from 'styled-components';
import Element from "./Element";
import Menu from "./Menu";
import Dialog from "../../dialogs/Dialog";
import {addDialog} from "../../../actions/dialogs.actions";


const Header = styled.div`
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1em;
  box-sizing: border-box;
  
  & h1 {
    margin: 0;
    margin-top: 0.7em;
    font-size: 1.6em;
  }
`;

const CallStory = ({ info, setCallStatusAction, setCallAction,
                       setActiveCallAction, dialogs, addDialogAction, addAppAction }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [activeNumber, setActiveNumber] = useState();

    const toggleMenu = () => setShowMenu(!showMenu);

    const startCall = () => {
        if (!activeNumber) return;

        const contact = info.contacts.find(c => c.number === activeNumber);

        setCallAction(true);
        setCallStatusAction(null);
        setActiveCallAction(true, contact ? contact.name : activeNumber, true);

        // eslint-disable-next-line no-undef
        mp.trigger('phone.call.start', activeNumber);
    };

    const startDialog = () => {
        if (!activeNumber) return;

        if (!dialogs.find(d => d.number === activeNumber)) {
            const contact = info.contacts.find(c => c.number === activeNumber);
            addDialogAction(activeNumber, contact ? contact.name : '');
        }
        addAppAction(<Dialog number={activeNumber}/>)
    };

    return (
        <div className={styles.app}>
            <div style={{ filter: showMenu && 'blur(2px)' }}>
                <Header>
                    <h1>Недавние</h1>
                </Header>
                <div className={styles.callStoryList} >
                    { info.callStory.map((c, i) => {
                        const contact = info.contacts.find(cont => cont.number === c.number);
                        return (
                            <Element
                                info={{
                                    ...c,
                                    name: contact && contact.name
                                }}
                                onClick={(number) => {
                                    if (showMenu) return;
                                    toggleMenu();
                                    setActiveNumber(number);
                                }}
                                key={i}
                            />
                        )
                    })
                    }
                </div>
            </div>
            { showMenu && <Menu startCall={startCall} startDialog={startDialog} close={toggleMenu}  /> }
        </div>
    );
}

const mapStateToProps = state => ({
    info: state.info,
    dialogs: state.dialogs
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    addDialogAction: (number, name) => dispatch(addDialog(number, name)),
    setCallStatusAction: status => dispatch(setCallStatus(status)),
    setCallAction: flag => dispatch(setCall(flag)),
    setActiveCallAction: (state, number, isMine) => dispatch(setActiveCall(state, number, isMine)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CallStory);