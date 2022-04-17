import React, { Component } from 'react';
import styles from '../styles/house.module.scss';

const Message = ({ show, text, type, action }) => {
    return (
        show ?
        <div className={styles.message} onClick={action}>
            <p className={styles.messageText}>{ text }</p>
            <img src={type} />
            <p>Нажмите на это сообщение для того, чтобы его закрыть</p>
        </div>
        : null
    )
}

export default Message;