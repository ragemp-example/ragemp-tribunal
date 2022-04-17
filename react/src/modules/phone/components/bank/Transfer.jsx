import React, {useState} from 'react';
import {connect} from 'react-redux';
import styles from './BankApp.module.scss';
import Header from "./Header";
import {Button, Container, Input} from "./utils";
import {addApp} from "../../actions/apps.actions";
import Confirm from "./Confirm";
import {setAskAnswerBank} from "../../actions/bankApp.actions";

const Transfer = ({ bankApp, addAppAction, setAskAnswerAction }) => {
    const [user, setUser] = useState('');
    const [sum, setSum] = useState('');
    const [errorUser, setErrorUser] = useState('');
    const [errorSum, setErrorSum] = useState('');

    const transfer = () => {
        addAppAction(<Confirm info={{ type: 'transfer', sum: sum, number: user }} />);

        // eslint-disable-next-line no-undef
        mp.trigger('bank.transfer.ask', parseInt(user), parseInt(sum));

        // setTimeout(() => {
        //     setAskAnswerAction('Swift');
        // }, 1500);
    };

    const validateForm = () => {
        if (!user) return setErrorUser('Поле не заполнено');
        setErrorUser('');

        if (!sum || parseInt(sum) < 0) return setErrorSum('Поле не заполнено');
        setErrorSum('');

        if(isNaN(user)) return setErrorUser('Некорректное значение');
        setErrorUser('');

        if(isNaN(sum)) return setErrorSum('Некорректное значение');
        setErrorSum('');

        if(parseInt(sum) > bankApp.money) return setErrorSum('Недостаточно денежных средств');
        setErrorSum('');

        // if(parseInt(sum) > 200000) return setErrorSum('Сумма перевода не должна превышать $200 000');
        // setErrorSum('');

        transfer();
    };

    return (
        <div className={styles.back}>
            <Header />
            <Container>
                <h1 className={styles.title}>Перевод денег</h1>
                <div className={styles.inputBlock}>
                    <label>Номер счета</label>
                    <Input
                        value={user}
                        placeholder='Введите номер счета'
                        onChange={e => setUser(e.target.value)}
                        error={errorUser}
                        maxLength={25}
                    />
                    <label>Сумма</label>
                    <Input
                        value={sum}
                        placeholder='Введите сумму'
                        onChange={e => setSum(e.target.value)}
                        error={errorSum}
                        maxLength={10}
                    />
                </div>
                <div className={styles.error}>{ errorUser || errorSum }</div>
                <Button
                    onClick={validateForm}
                >
                    Перевести
                </Button>
            </Container>
        </div>
    );
}

const mapStateToProps = state => ({
    bankApp: state.bankApp
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    setAskAnswerAction: (answer, clear) => dispatch(setAskAnswerBank(answer, clear))
});

export default connect(mapStateToProps, mapDispatchToProps)(Transfer);