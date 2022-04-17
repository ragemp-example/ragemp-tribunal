import React, {Fragment} from 'react';
import moment from 'moment-timezone';
import outgoing from '@imgs/phone/outgoing.svg';
import info_icon from '@imgs/phone/info.svg';
import styles from '../../../phone.module.scss';


const isMissed = type => type === 0;
const isOutgoing = type => type === 1;
const isIncoming = type => type === 2;

const convertName = name => {
    let convertedName = name.split(' ')[0];

    console.log(name.split(' '));

    if (name.split(' ').length > 1) convertedName += ` ${name.split(' ')[1][0]}.`;

    return convertedName;
};

const convertDate = date => {
    if (new Date(date).getDate() !== new Date(Date.now()).getDate()) return new Date(date).toLocaleDateString();

    return moment().tz('Europe/Moscow').format('HH:mm')
};

const Element = ({info, onClick}) => {
    const {name, number, date, type} = info;

    return (
        <div className={styles.callStoryElement}>
            {isOutgoing(type) && <img src={outgoing}/>}
            <div className={styles.callStoryInfo}>
                <b style={{color: isMissed(type) && '#FF3B30'}}>{name ? convertName(name) : number}</b>
                <p>{name ? 'сотовый' : 'USA'}</p>
            </div>
            <div className={styles.callStoryDate}>
                <span>{convertDate(date)}</span>
                <img src={info_icon} onClick={() => onClick(number)}/>
            </div>
        </div>
    );
};

export default Element;