import React from 'react';
import styles from '@phone/phone.module.scss';

const PhoneAppIcon = ({ image, name, handleClick, app, notifs }) => {
    return (
        <div className={styles.appIcon} onClick={() => handleClick(app)}>
            <img src={image} alt="img"/>
            {notifs > 0 && <div className={styles.notifications}>{ notifs }</div> }
            <span>{ name }</span>
        </div>
    );
};

export default PhoneAppIcon;