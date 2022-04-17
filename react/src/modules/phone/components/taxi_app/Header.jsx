import React from 'react';
import styles from "./taxi.module.scss";
import logo from '@imgs/phone/taxi_app/logo.svg';

const Header = ({ children }) => {
    return (
        <div className={styles.header}>
            <img src={logo} />
            <span>{ children }</span>
        </div>
    );
};

export default Header;