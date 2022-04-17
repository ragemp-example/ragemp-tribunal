import React, {Fragment, useEffect} from 'react';
import {connect} from 'react-redux';
import Error from "./Error";
import Success from "./Success";
import Wait from "./Wait";
import {setAnswerBankApp} from "../../actions/bankApp.actions";

const Answer = ({ bankApp, info, setAnswerAction, taxes, onSuccess }) => {
    useEffect(() => {
        // setTimeout(() => {
        //     setAnswerAction(1);
        // }, 1000)
    }, []);

    const getSuccessText = () => {
        if (taxes) return `Вы успешно оплатили ${info.days} дней налогообложения для ${info.name}`;

        return `Вы успешно перевели $${info.sum} человеку ${info.name}`;
    };

    const getPage = () => {
        switch (bankApp.answer) {
            case 0:
                return <Error text='Ошибка'/>;
            case 1:
                return <Success text={getSuccessText()} onSuccess={onSuccess}/>;
            case 2:
                return <Error text='Недостаточно денежных средств'/>;
            case 5:
                return <Error text='Вам необходимо отыграть 30 часов'/>;
            case 10:
                return <Error text='Человек с таким номером счета не найден'/>;
            default:
                return <div/>;
        }
    };

    return bankApp.answer ? getPage() : <Wait taxes={taxes} />;
};

const mapStateToProps = state => ({
    bankApp: state.bankApp
});

const mapDispatchToProps = dispatch => ({
    setAnswerAction: answer => dispatch(setAnswerBankApp(answer))
});

export default connect(mapStateToProps, mapDispatchToProps)(Answer);