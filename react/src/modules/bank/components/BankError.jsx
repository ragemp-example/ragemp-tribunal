import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {setAnswerBank, setAskAnswerBank} from "../actions/action.bank";
import styles from '../styles/Bank.module.scss';
import {BackButton} from "./utils";
import {closeBankPage} from "../actions/action.bankPages";

class BankError extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    exit() {
        const { setAnswer, setAskAnswer, confirm, closePage } = this.props;

        setAnswer({ answer: null, type: null });
        setAskAnswer(null, true);
        if(confirm) closePage();
    }

    render() {
        const { text } = this.props;

        return (
            <div className={[styles.page, styles.errorPage].join(' ')}>
                <h1 className={styles.title}>Ошибка!</h1>
                <p>{text}</p>
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
    setAskAnswer: (nick, clear) => dispatch(setAskAnswerBank(nick, clear)),
    closePage: () => dispatch(closeBankPage())
});

export default connect(mapStateToProps, mapDispatchToProps)(BankError);