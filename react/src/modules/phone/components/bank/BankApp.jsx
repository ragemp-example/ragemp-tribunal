import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {addApp} from '../../actions/apps.actions';
import styles from './BankApp.module.scss';
import Header from "./Header";
import {Container, formatPrice} from "./utils";
import Transfer from "./Transfer";
import Taxes from "./Taxes";
import Success from "./Success";
import Error from "./Error";
import Wait from "./Wait";
import Confirm from "./Confirm";
import Loader from "../Loader";
import {showBankApp, updateBankApp} from "../../actions/bankApp.actions";


const BankApp = ({ bankApp, addAppAction, showBankAppAction, updateBankAppAction }) => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        setInterval(() => setDate(new Date()), 5000)
    }, []);

    useEffect(() => {
        // setTimeout(() => {
        //     showBankAppAction({
        //         money: 120000,
        //         houses: [
        //             {
        //                 name: 228,
        //                 area: 'Глен-рич',
        //                 rent: 350,
        //                 days: 12
        //             }
        //         ],
        //         biz: [
        //             {
        //                 id: 3,
        //                 name: 'Ponsonbys',
        //                 type: 'Магазин одежды',
        //                 area: 'Глен-рич',
        //                 rent: 500,
        //                 days: 2
        //             }
        //         ]
        //     })
        // }, 500);

        // setTimeout(() => {
        //     updateBankAppAction({ money: 300 })
        // }, 2000)

        showBankAppAction({});

        // eslint-disable-next-line no-undef
        mp.trigger('bank.phoneApp.show');
    }, []);

    const getPage = () => {
        return (
            <Container width style={{ marginTop: '2.5em' }}>
                <div className={styles.card}>
                    <b>Баланс</b>
                    <span>{date.toLocaleDateString('ru-RU')}</span>
                    <div className={styles.money}>
                        <span>$</span>{ formatPrice(bankApp.money) }
                    </div>
                </div>
                <label>Активности</label>
                <div className={styles.buttons}>
                    <div className={styles.button} onClick={() => addAppAction(<Transfer/>)}>
                        <span><b>+</b></span>
                        <p>Перевести деньги</p>
                    </div>
                    <div className={styles.button} onClick={() => addAppAction(<Taxes/>)}>
                        <span><b>$</b></span>
                        <p>Оплатить налоги</p>
                    </div>
                </div>
            </Container>
        );
    };

    return (
        <div className={styles.back}>
            <Header />
            { bankApp.number ? getPage() : <Loader color='#56AB2F' /> }
        </div>
    )
};

const mapStateToProps = state => ({
    bankApp: state.bankApp
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    showBankAppAction: data => dispatch(showBankApp(data)),
    updateBankAppAction: data => dispatch(updateBankApp(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BankApp);