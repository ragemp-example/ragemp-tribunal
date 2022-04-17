import React from 'react';
import styles from './BankApp.module.scss';
import Header from "./Header";
import {Container} from "./utils";
import wait from '@imgs/phone/bank_app/wait.svg';

const Wait = ({ taxes }) => {
    return (
        <div className={styles.back}>
            <Header disabled />
            <Container>
                <h1 className={styles.title} style={{ fontSize: '1.7em' }}>Ожидание {taxes ? 'оплаты' : 'перевода'}</h1>
                <div className={styles.wait}>
                    <img src={wait} />
                </div>
            </Container>
        </div>
    );
};

export default Wait;