import React, {useState, useRef, useEffect} from 'react';
import $ from 'jquery';
import {connect} from "react-redux";
import {closeApp} from '@phone/actions/apps.actions';
import styles from '@phone/phone.module.scss';
import {Header} from "../contacts/CreateContact";
import back_icon from '@imgs/phone/back_icon.svg';
import {addMessage, readDialog, removeDialog} from "../../actions/dialogs.actions";

const Dialog = ({ number, dialogs, closeAppAction, addMessageAction, readDialogAction, removeDialogAction }) => {
    const [inputMessage, setInputMessage] = useState('');

    const _dialog = dialogs.find(d => d.number === number);

    const messagesEndRef = useRef(null);
    const refList = useRef(null);

    const scrollToBottom = () => {
        let list = document.getElementById('messagesList');
        list.scrollTop = list.scrollHeight - list.clientHeight;
        list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    };

    // useEffect(() => {
    //     setTimeout(() => addMessageAction(_dialog.number, 'wdaw', false, true), 1000)
    // }, []);

    useEffect(() => {
        // eslint-disable-next-line no-undef
        mp.trigger('phone.dialog.read', _dialog.number);

        readDialogAction(_dialog.number);

        scrollToBottom();
    }, []);

    useEffect(() => scrollToBottom(), [_dialog]);

    const getTimeMessage = date =>
        `${String('00' + 
            new Date(date).getHours()).slice(-2)}:${String('00' 
            + new Date(date).getMinutes()).slice(-2)}`;

    const getMessages = () => {
      return _dialog.PhoneMessages.map((message, index) => {
          const classes = [styles.message];
          if (message.isMine) classes.push(styles.myMessage);
          if (!message.isRead) classes.push(styles.notReadMessage);

          return <div key={index} className={classes.join(' ')}>
              <p>{getTimeMessage(message.date)}</p>
              <span>{message.text}</span>
          </div>
      })
    };

    const sendMessage = () => {
        if (!inputMessage) return;

        // eslint-disable-next-line no-undef
        mp.trigger('phone.message.send', inputMessage, _dialog.number);

        addMessageAction(number, inputMessage, true, true);
        setInputMessage('');
    };

    return (
        <div className={styles.app} style={{ backgroundColor: '#F8F8F8' }}>
            <div className={styles.container}>
                <Header>
                    <span className={styles.back} onClick={closeAppAction}>
                        <img src={back_icon}/>
                        <span>Сообщения</span>
                    </span>
                    <p style={{ color: 'black' }}>{_dialog.name || _dialog.number}</p>
                </Header>
                <div className={styles.messagesList} ref={refList} id='messagesList'>
                    { getMessages() }
                    <div ref={messagesEndRef} />
                </div>
                <input
                    maxLength={60}
                    className={styles.messageInput}
                    value={inputMessage}
                    placeholder='Сообщение...'
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => {
                        if (e.keyCode === 13) sendMessage()
                    }}
                />
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    dialogs: state.dialogs
});

const mapDispatchToProps = dispatch => ({
    closeAppAction: () => dispatch(closeApp()),
    removeDialogAction: number => dispatch(removeDialog(number)),
    readDialogAction: number => dispatch(readDialog(number)),
    addMessageAction: (number, text, isMine, isRead) => dispatch(addMessage(number, text, isMine, isRead))
});

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);