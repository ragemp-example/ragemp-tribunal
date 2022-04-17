/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {setArgsBank, setAskAnswerBank, setLoadingBank, setAnswerBank} from "../actions/action.bank";
import {closeBankPage} from "../actions/action.bankPages";
import styles from '../styles/Bank.module.scss';
import BankError from "./BankError";
import {Button, formatPrice} from "./utils";

class BankConfirmTransfer extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.transfer = this.transfer.bind(this);
    }

    back() {
        const { closePage, setAskAnswer } = this.props;

        setAskAnswer(null, true);
        closePage();
    }

    transfer() {
        const { setAnswer, setArgs, setLoading, bank } = this.props;

        setArgs({ money: this.props.money });
        setLoading(true);

        // setTimeout(() => {
        //     setAnswer({ answer: 1, type: 'transfer' })
        // }, 1000)

        mp.trigger('bank.transfer');
    }

    render() {
        const { bank, number, money } = this.props;

        if (!bank.askAnswer) return <div />;

        return (
            bank.askAnswer.nick ?
            <div className={[styles.page].join(' ')}>
                <div className={styles.confirmPage}>
                    <p>
                        Вы действительно хотите перевести <span>${formatPrice(money)}</span>
                        гражданину <b>{bank.askAnswer.nick}</b>?
                    </p>
                    <Button onClick={this.transfer}>Да</Button>
                    <Button secondary onClick={this.back.bind(this)}>Нет</Button>
                </div>
            </div>
            : <BankError text={'Гражданин с таким номером счета не найден'} confirm />
        );
    }
}

const mapStateToProps = state => ({
    bank: state.bank
});

const mapDispatchToProps = dispatch => ({
    setAskAnswer: (askAnswer, clear) => dispatch(setAskAnswerBank(askAnswer, clear)),
    closePage: () => dispatch(closeBankPage()),
    setLoading: flag => dispatch(setLoadingBank(flag)),
    setArgs: args => dispatch(setArgsBank(args)),
    setAnswer: ans => dispatch(setAnswerBank(ans))
});

export default connect(mapStateToProps, mapDispatchToProps)(BankConfirmTransfer);