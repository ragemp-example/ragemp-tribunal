/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';

import {logo} from './icons';
import styles from '../styles/Bank.module.scss';
import {loadBankInfo, closeBank} from "../actions/action.bank";
import BankMenu from "./BankMenu";
import AnsOperationBank from "./AnsOperationBank";
import Loader from "./Loader";
import {formatNumber, formatPrice} from "./utils";

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    // componentWillMount() {
    //     this.props.loadInfo({
    //         number: '1239293',
    //         cash: 223123999,
    //         money: 232322,
    //         name: 'Immanuel Swift',
    //         houses: [
    //             // {
    //             //     name: 25,
    //             //     class: 'Люкс',
    //             //     rent: 290,
    //             //     days: 13
    //             // }
    //         ], // если нет, то []
    //         biz: [
    //             // {
    //             //     id: 3,
    //             //     name: `"У дома твоей мамы в деревне"`,
    //             //     type: 'Оружейный магазин',
    //             //     rent: 500,
    //             //     days: 30,
    //             //     cashBox: 448448
    //             // }
    //         ], // если нет, то []
    //         phoneMoney: 21 // если нет, то null
    //     });
    // }

    exitBank() {
        const { closeBank, bank } = this.props;

        if (!bank.isLoading) {
            closeBank();
            mp.trigger('bank.close');
        }
    }

    getHeader() {
        const { bank } = this.props;

        return (
            <div className={styles.header}>
                <div className={styles.logo}>
                    <img src={logo} />
                    <span>Мой банк</span>
                </div>
                <div className={styles.money}>
                    <span>Наличные</span>
                    <p>${formatPrice(bank.cash)}</p>
                </div>
                <div className={styles.money}>
                    <span>На счету</span>
                    <p>${formatPrice(bank.money)}</p>
                </div>
                <div className={styles.info}>
                    <div className={styles.name}>{bank.name}</div>
                    <span className={styles.number}>{formatNumber(bank.number)}</span>
                </div>
            </div>
        )
    }

    getPages() {
        const { pages } = this.props;

        return pages.map((page, index) => <Fragment key={index}>{page}</Fragment>)
    }

    getForm() {
        const { pages, bank } = this.props;

        return (
            <Fragment>
                { this.getHeader() }

                { bank.isLoading ? <Loader /> : this.getPages() }
            </Fragment>
        )
    }

    render() {
        const { bank } = this.props;

        return (
            <div className={styles.back}>
                { Object.keys(bank).length > 1 ? this.getForm() : <Loader/> }
                { Object.keys(bank).length > 1 && bank.answer != null && <AnsOperationBank /> }
                <div className={styles.exit} onClick={this.exitBank.bind(this)}>ЗАКРЫТЬ <span>X</span></div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    bank: state.bank,
    pages: state.bankPages
});

const mapDispatchToProps = dispatch => ({
    loadInfo: info => dispatch(loadBankInfo(info)),
    closeBank: () => dispatch(closeBank())
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);