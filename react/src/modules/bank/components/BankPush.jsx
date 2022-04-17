/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeBankPage} from "../actions/action.bankPages";
import {pushBank, setAnswerBank, setArgsBank, setFuncBank, setLoadingBank} from "../actions/action.bank";
import styles from '../styles/Bank.module.scss';
import {BackButton, Button, Input} from "./utils";

class BankPush extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pushMoney: '',
            error: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.pushMoney = this.pushMoney.bind(this);
    }

    handleChange(e) {
        this.setState({ pushMoney: e.target.value });
    }

    validateForm() {
        const { pushMoney } = this.state;
        const { bank } = this.props;

        if (pushMoney) {
            if (!isNaN(pushMoney) && parseInt(pushMoney) > 0) {
                if (bank.cash >= parseInt(pushMoney)) {
                    this.setState({ error: '' });
                    return true;
                } else {
                    this.setState({ error: 'Недостаточно наличных' });
                    return false;
                }
            } else {
                this.setState({ error: 'Некорректные данные' });
                return false;
            }
        } else {
            this.setState({ error: 'Поле не заполнено' });
            return false;
        }
    }

    pushMoney() {
        const { pushMoney } = this.state;
        const { setArgs, setAnswer, setLoading } = this.props;

        if (this.validateForm()) {
            setLoading(true);
            setArgs({ money: parseInt(pushMoney) });
            mp.trigger('bank.push', parseInt(pushMoney));

            // setTimeout(() => {
            //     setAnswer({ answer: 2, type: 'push' })
            // }, 1000);
        }
    }

    render() {
        const { closePage } = this.props;
        const { pushMoney, error } = this.state;

        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Пополнение счёта</h1>

                <div className={styles.wrapper}>
                    <Input>
                        <p>Сумма пополнения</p>
                        <input
                            placeholder={'Введите сумму...'}
                            value={pushMoney}
                            style={{ borderColor: error && 'red' }}
                            onChange={this.handleChange}
                        />
                    </Input>
                    <Button onClick={this.pushMoney}>Пополнить</Button>

                    <div className={styles.error}>{error}</div>
                </div>

                <BackButton onClick={closePage}/>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    bank: state.bank
});

const mapDispatchToProps = dispatch => ({
    closePage: () => dispatch(closeBankPage()),
    pushBank: money => dispatch(pushBank(money)),
    setLoading: flag => dispatch(setLoadingBank(flag)),
    setAnswer: answer => dispatch(setAnswerBank(answer)),
    setArgs: args => dispatch(setArgsBank(args))
});

export default connect(mapStateToProps, mapDispatchToProps)(BankPush);