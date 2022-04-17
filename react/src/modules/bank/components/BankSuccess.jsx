/* eslint-disable no-duplicate-case */
/* eslint-disable default-case */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
    payBusinessBank,
    payHouseBank,
    popBank,
    pushBank,
    pushPhoneBank,
    setAnswerBank,
    transferBank,
    pushCashBoxBank,
    popCashBoxBank, setAskAnswerBank
} from "../actions/action.bank";
import {closeBankPage, setBankPage} from '../actions/action.bankPages';
import BankMenu from './BankMenu';
import styles from '../styles/Bank.module.scss';
import {BackButton} from "./utils";

class BankSuccess extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const { bank, closePage, popBank, pushBank, transferBank, payHouse, payBusiness, pushPhoneBank, pushCashBoxBank, popCashBoxBank } = this.props;

        switch (bank.type) {
            case 'pop':
                // popBank(bank.args.money);
                break;

            case 'push':
                // pushBank(bank.args.money);
                break;

            case 'transfer':
                closePage();
                // transferBank(bank.args.money);
                break;

            case 'phone':
                // pushPhoneBank(bank.args.money);
                break;

            case 'house':
                // payHouse(bank.args.name, bank.args.days, bank.args.money);
                break;

            case 'biz':
                // payBusiness(bank.args.id, bank.args.days, bank.args.money);
                break;

            case 'cashbox_push':
                // pushCashBoxBank(bank.args.id, bank.args.money);
                break;
                
            case 'cashbox_pop':
                // popCashBoxBank(bank.args.id, bank.args.money);
                break;
        }
    }

    exit() {
        const { setAnswer, setPage, setAskAnswer } = this.props;

        setAskAnswer(null, true);
        setAnswer({ answer: null, type: null });
        setPage(<BankMenu />);
    }

    render() {
        return (
            <div className={[styles.page, styles.successPage].join(' ')}>
                <h1 className={styles.title}>Успешно!</h1>
                <p>Операция выполнена.</p>
                <BackButton onClick={this.exit.bind(this)} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    bank: state.bank
});

const mapDispatchToProps = dispatch => ({
    setAnswer: answer => dispatch(setAnswerBank(answer)),
    setAskAnswer: (answer, clear) => dispatch(setAskAnswerBank(answer, clear)),
    pushBank: money => dispatch(pushBank(money)),
    transferBank: money => dispatch(transferBank(money)),
    popBank: money => dispatch(popBank(money)),
    payHouse: (name, days, money) => dispatch(payHouseBank(name, days, money)),
    payBusiness: (name, days, money) => dispatch(payBusinessBank(name, days, money)),
    pushPhoneBank: money => dispatch(pushPhoneBank(money)),
    pushCashBoxBank: (id, money) => dispatch(pushCashBoxBank(id, money)),
    popCashBoxBank: (id, money) => dispatch(popCashBoxBank(id, money)),
    setPage: page => dispatch(setBankPage(page)),
    closePage: () => dispatch(closeBankPage())
});

export default connect(mapStateToProps, mapDispatchToProps)(BankSuccess);