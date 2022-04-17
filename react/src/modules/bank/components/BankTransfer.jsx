/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addBankPage, closeBankPage} from "../actions/action.bankPages";
import {setAskAnswerBank, setLoadingBank, transferBank} from "../actions/action.bank";
import BankConfirmTransfer from "./BankConfirmTransfer";
import styles from "../styles/Bank.module.scss";
import {BackButton, Button, Input} from "./utils";

const inputStyle = {
    border: '1px solid #838383',
    borderRadius: '5px'
};

class BankTransfer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transferMoney: '',
            user: '',
            errorMoney: '',
            errorUser: ''
        };

        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.transferMoney = this.transferMoney.bind(this);
    }

    handleChangeInput(e) {
        this.setState({ [e.target.id]: e.target.value });
    }

    validateUser() {
        const { user } = this.state;

        if (!user) return this.setState({ errorUser: 'Номер счета не заполнен' });
        if (isNaN(user) || parseInt(user) < 0) return this.setState({ errorUser: 'Некорректный номер счета' });

        this.setState({ errorUser: '' });
        return true;
    }

    validateMoney() {
        const { transferMoney } = this.state;
        const { bank } = this.props;

        if (!transferMoney) return this.setState({ errorMoney: 'Сумма перевода не заполнена'});
        if (isNaN(transferMoney) || parseInt(transferMoney) < 0) return this.setState({ errorMoney: 'Некорректная сумма перевода' });
        if (parseInt(transferMoney) > bank.money) return this.setState({ errorMoney: 'Недостаточно средств на счете'});
        // if (parseInt(transferMoney) >= 200000) return this.setState({ errorMoney: 'Сумма перевода не должна превышать $200 000'});

        this.setState({ errorMoney: '' });
        return true;
    }

    transferMoney() {
        const { transferMoney, user } = this.state;
        const { setLoading, addPage } = this.props;

        if (this.validateUser() && this.validateMoney()) {
            addPage(<BankConfirmTransfer money={transferMoney} number={user}/>);
            setLoading(true);

            mp.trigger('bank.transfer.ask', parseInt(user), parseInt(transferMoney));

            // setTimeout(() => {
            //     this.props.setAskAnswer('Dun Hill');
            // }, 1000)
        }
    }

    render() {
        const { closePage, bank } = this.props;
        const { errorMoney, errorUser, transferMoney, user } = this.state;

        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Перевод на другой счёт</h1>

                <div className={styles.wrapper}>
                    <Input>
                        <p>Номер счёта</p>
                        <input
                            id={'user'}
                            placeholder={'Введите номер счёта...'}
                            value={user}
                            style={{ borderColor: errorUser && 'red' }}
                            onChange={this.handleChangeInput}
                        />
                    </Input>
                    <Input>
                        <p>Сумма перевода</p>
                        <input
                            id={'transferMoney'}
                            placeholder={'Введите сумму...'}
                            value={transferMoney}
                            style={{ borderColor: errorMoney && 'red' }}
                            onChange={this.handleChangeInput}
                        />
                    </Input>
                    <Button onClick={this.transferMoney}>Перевести</Button>

                    <div className={styles.error}>{errorUser || errorMoney}</div>
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
    transferBank: money => dispatch(transferBank(money)),
    closePage: () => dispatch(closeBankPage()),
    addPage: page => dispatch(addBankPage(page)),
    setLoading: flag => dispatch(setLoadingBank(flag)),
    setAskAnswer: (nick, clear) => dispatch(setAskAnswerBank(nick, clear))
});

export default connect(mapStateToProps, mapDispatchToProps)(BankTransfer);