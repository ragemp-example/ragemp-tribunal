import React from 'react';
import styles from '../styles/house.module.scss';


const HouseButton = ({ image, text, action }) => {
    return (
        <div className={styles.button} onClick={action}>
            <img src={image} />
            <div>{ text }</div>
        </div>
    )
}

export default HouseButton;