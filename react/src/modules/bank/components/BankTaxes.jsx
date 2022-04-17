/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeBankPage} from "../actions/action.bankPages";
import {setLoadingBank, setArgsBank} from "../actions/action.bank";
import styles from '../styles/Bank.module.scss';
import {BackButton, Button} from "./utils";
import BankTax from "./BankTax";

class BankTaxes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            houseDays: 0,
            bizDays: 0
        };

        this.payBiz = this.payBiz.bind(this);
        this.payHouse = this.payHouse.bind(this);
    }

    payHouse(days) {
        const { houseDays } = this.state;
        const { bank, setLoading, setArgs } = this.props;

        setArgs({ money: parseInt(bank.houses[0].rent*days), name: bank.houses[0].name, days: parseInt(days) });
        setLoading(true);
        mp.trigger('bank.house.push', bank.houses[0].name, parseInt(days));
        this.setState({ houseDays: 0 });
    }


    payBiz(days) {
        const { bizDays } = this.state;
        const { setLoading, setArgs, bank } = this.props;

        setArgs({ money: parseInt(bank.biz[0].rent*days), id: bank.biz[0].id, days: parseInt(days) });
        setLoading(true);
        mp.trigger('bank.biz.push', bank.biz[0].id, parseInt(days));
        this.setState({ bizDays: 0 });
    }

    render() {
        const { closePage, bank } = this.props;
        const { error } = this.state;

        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Оплата налогов</h1>
                <div className={styles.cashBoxWrapper} style={{ marginTop: '1.5em' }}>
                    <div className={styles.cashBoxAreas}>
                        <BankTax
                            bank={bank}
                            house={bank.houses[0]}
                            pay={this.payHouse}
                            setError={(err) => this.setState({ error: err })}
                            none={bank.houses.length === 0 && 'Нет жилища'}
                            title={'Оплата жилья'}
                        />
                        <BankTax
                            bank={bank}
                            biz={bank.biz[0]}
                            pay={this.payBiz}
                            setError={(err) => this.setState({ error: err })}
                            none={bank.biz.length === 0 && 'Нет бизнеса'}
                            title={'Оплата бизнеса'}
                        />
                    </div>
                </div>

                {/*<div className={styles.error}>{error}</div>*/}
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

export default connect(mapStateToProps, mapDispatchToProps)(BankTaxes);