import React, { Fragment } from 'react';
import HouseButton from './HouseButton';
import Loader from './Loader';
import styles from '../styles/house.module.scss';

const getButtons = buttons => (
    buttons.map((button, index) => (
        <HouseButton
            key={index}
            text={button.text} 
            image={button.image} 
            action={button.action}
        />
    ))
);

const Menu = ({ show, loading, buttons, action }) => {
    if (show) {
        return (
            <div className={[styles.menu].join(' ')} style={{ justifyContent: buttons.length === 1 && 'center' }}>
                {
                    !loading ?
                    <Fragment>
                        <div className={styles.exit} onClick={action}>ЗАКРЫТЬ <span>X</span></div>
                        { getButtons(buttons) }
                    </Fragment>
                    : <Loader show={true}/>
                }
            </div>
        );
    } else return null
};

export default Menu;