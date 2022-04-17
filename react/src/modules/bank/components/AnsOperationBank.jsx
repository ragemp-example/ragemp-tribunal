import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addBankPage, closeBankPage} from "../actions/action.bankPages";
import BankError from "./BankError";
import BankSuccess from "./BankSuccess";

class AnsOperationBank extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getAnswer = this.getAnswer.bind(this);
    }

    getTextAnswer(answer) {
        if (answer == 0) {
            return 'Ошибка';
        } else if (answer == 2) {
            return 'Недостаточно денег на счете';
        } else if (answer == 3) {
            return 'Недостаточно наличных денег';
        } else if (answer == 4) {
            return 'Недостаточно денег в кассе бизнеса';
        } else if (answer == 5) {
            return 'Вам требуется отыграть 30 часов';
        }
    }

    getAnswer() {
        const { bank } = this.props;
        if (bank.answer == null) return;

        if (bank.answer == 1) {
            return <BankSuccess args={bank.args}/>
        } else {
            let text = this.getTextAnswer(bank.answer);
            return <BankError text={text} />
        } 
    }

    render() {
        const { bank } = this.props;

        return (
            <Fragment>
                {this.getAnswer() }
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    bank: state.bank
});

const mapDispatchToProps = dispatch => ({
    closePage: () => dispatch(closeBankPage()),
    addPage: page => dispatch(addBankPage(page)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnsOperationBank);