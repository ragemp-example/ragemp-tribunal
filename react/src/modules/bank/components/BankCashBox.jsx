/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeBankPage} from "../actions/action.bankPages";
import {setArgsBank, setLoadingBank} from "../actions/action.bank";
import styles from '../styles/Bank.module.scss';
import {BackButton, Button, formatPrice, Input} from "./utils";

class BankCashBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popMoney: '',
            pushMoney: '',
            errorPop: '',
            errorPush: ''
        };

        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.getForm = this.getForm.bind(this);
        this.validPush = this.validPush.bind(this);
        this.validPop = this.validPop.bind(this);
        this.pushMoney = this.pushMoney.bind(this);
        this.popMoney = this.popMoney.bind(this);
    }

    handleChangeInput(e) {
        this.setState({ [e.target.id]: e.target.value });
    }

    validPop(money) {
        const { bank } = this.props; 

        if (money) {
            if (!isNaN(money) && parseInt(money) > 0) {
                if (parseInt(money) <= bank.biz[0].cashBox) {
                    this.setState({ errorPop: '', popMoney: '' });
                    return true;
                } else {
                    this.setState({ errorPop: 'Недостаточно денег в кассе' });
                    return false;
                }
            } else {
                this.setState({ errorPop: 'Некорректные данные' });
                return false;
            }
        } else {
            this.setState({ errorPop: 'Поле не заполнено' });
            return false;
        }
    }

    validPush(money) {
        const { bank } = this.props;

        if (money) {
            if (!isNaN(money) && parseInt(money) > 0) {
                if (parseInt(money) <= bank.money) {
                    this.setState({ errorPush: '', pushMoney: '' });
                    return true;
                } else {
                    this.setState({ errorPush: 'Недостаточно денег на счете' });
                    return false;
                }
            } else {
                this.setState({ errorPush: 'Некорректные данные' });
                return false;
            }
        } else {
            this.setState({ errorPush: 'Поле не заполнено' });
            return false;
        }
    }

    pushMoney() {
        const { pushMoney } = this.state;
        const { setArgs, setLoading, bank } = this.props;

        this.setState({ errorPop: '' });

        if (this.validPush(pushMoney)) {
            setArgs({ money: parseInt(pushMoney), id: bank.biz[0].id });
            setLoading(true);
            mp.trigger('bank.biz.cashbox.push', bank.biz[0].id, parseInt(pushMoney));
        }
    }

    popMoney() {
        const { popMoney } = this.state;
        const { setArgs, setLoading, bank } = this.props;

        this.setState({ errorPush: '' });

        if (this.validPop(popMoney)) {
            setArgs({ money: parseInt(popMoney), id: bank.biz[0].id });
            setLoading(true);
            mp.trigger('bank.biz.cashbox.pop', bank.biz[0].id, parseInt(popMoney));
        }
    }

    getForm() {
        const { bank } = this.props;
        const { pushMoney, popMoney, errorPush, errorPop } = this.state;

        const biz = bank.biz[0];

        if (bank.biz.length > 0) {
            return (
                <div className={styles.cashBoxWrapper}>
                    <p className={styles.cashBoxState}>Состояние касы: <span>${formatPrice(biz.cashBox)}</span></p>
                    <div className={styles.cashBoxAreas}>
                        <div className={styles.cashBoxArea}>
                            <h1>Пополнение кассы</h1>
                            <Input>
                                <p>Сумма пополнения</p>
                                <input
                                    value={pushMoney}
                                    id={'pushMoney'}
                                    onChange={this.handleChangeInput}
                                    placeholder={'Введите сумму...'}
                                />
                            </Input>
                            <Button onClick={this.pushMoney}>Пополнить</Button>
                        </div>
                        <div className={styles.cashBoxArea}>
                            <h1>Снятие из кассы</h1>
                            <Input>
                                <p>Сумма снятия</p>
                                <input
                                    value={popMoney}
                                    id={'popMoney'}
                                    onChange={this.handleChangeInput}
                                    placeholder={'Введите сумму...'}
                                />
                            </Input>
                            <Button onClick={this.popMoney}>Снять</Button>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <h1 style={{ fontSize: '2.5em', marginTop: '3em', textAlign: 'center', color: '#939393' }}>Нет бизнеса</h1>
            )
        }
    }

    render() {
        const { closePage } = this.props;
        const { errorPush, errorPop } = this.state;

        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Касса бизнеса</h1>

                { this.getForm() }

                <div className={styles.error}>
                    { errorPush || errorPop }
                </div>

                <BackButton onClick={closePage} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    bank: state.bank
});

const mapDispatchToProps = dispatch => ({
    closePage: () => dispatch(closeBankPage()),
    setArgs: args => dispatch(setArgsBank(args)),
    setLoading: flag => dispatch(setLoadingBank(flag)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BankCashBox);