/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeBankPage} from "../actions/action.bankPages";
import {setArgsBank, setLoadingBank} from "../actions/action.bank";
import styles from "../styles/Bank.module.scss";
import {BackButton, Button, Input} from "./utils";

class BankPop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popMoney: '',
            error: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.popMoney = this.popMoney.bind(this);
    }

    handleChange(e) {
        this.setState({ popMoney: e.target.value });
    }

    validateForm() {
        const { popMoney } = this.state;
        const { bank } = this.props;

        if (popMoney) {
            if (!isNaN(popMoney) && parseInt(popMoney) > 0) {
                if (bank.money >= parseInt(popMoney)) {
                    this.setState({ error: '' });
                    return true;
                } else {
                    this.setState({ error: 'Недостаточно средств на счете' });
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

    popMoney() {
        const { popMoney } = this.state;
        const { setArgs, setLoading } = this.props;

        if (this.validateForm()) {
            setArgs({ money: parseInt(popMoney) });
            setLoading(true);
            mp.trigger('bank.pop', parseInt(popMoney));
        }
    }

    render() {
        const { closePage } = this.props;
        const { popMoney, error } = this.state;

        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Снять со счёта</h1>

                <div className={styles.wrapper}>
                    <Input>
                        <p>Сумма снятия</p>
                        <input
                            placeholder={'Введите сумму...'}
                            value={popMoney}
                            style={{ borderColor: error && 'red' }}
                            onChange={this.handleChange}
                        />
                    </Input>
                    <Button onClick={this.popMoney}>Снять</Button>

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
    setArgs: args => dispatch(setArgsBank(args)),
    setLoading: flag => dispatch(setLoadingBank(flag)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BankPop);