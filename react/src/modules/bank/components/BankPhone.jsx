/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeBankPage} from "../actions/action.bankPages";
import {setArgsBank, setLoadingBank} from "../actions/action.bank";

class BankPhone extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pushPhoneMoney: '',
            error: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.pushPhoneMoney = this.pushPhoneMoney.bind(this);
    }

    handleChange(e) {
        this.setState({ pushPhoneMoney: e.target.value });
    }

    validateForm() {
        const { pushPhoneMoney } = this.state;
        const { bank } = this.props;

        if (pushPhoneMoney) {
            if (!isNaN(pushPhoneMoney) && parseInt(pushPhoneMoney) > 0) {
                if (bank.money >= parseInt(pushPhoneMoney)) {
                    this.setState({ error: '' });
                    return true;
                } else {
                    this.setState({ error: 'Недостаточно денег на счете' });
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

    pushPhoneMoney() {
        const { pushPhoneMoney } = this.state;
        const { setArgs, setLoading } = this.props;

        if (this.validateForm()) {
            setArgs({ money: parseInt(pushPhoneMoney) });
            setLoading(true);
            mp.trigger('bank.phone.push', parseInt(pushPhoneMoney));
        }
    }

    render() {
        const { closePage, bank } = this.props;
        const { pushPhoneMoney, error } = this.state;

        return (
            <Fragment>
                <div className='page_title-bank-react'>
                    Пополонение счета телефона
                </div>

                <div className='push_block-bank-react'>
                    {
                        bank.phoneMoney !== null
                        ? <Fragment>
                                <div>Введите сумму пополнения</div>
                                <div>
                                    <input
                                        className='input-bank-react'
                                        value={pushPhoneMoney}
                                        style={{ borderColor: error && 'red' }}
                                        onChange={this.handleChange}
                                    />
                                    <input className='button_input-bank-react' value='ОК' onClick={this.pushPhoneMoney} type='submit'/>
                                </div>

                                <div style={{ fontSize: '130%' }}>Текущий баланс:
                                    <span style={{ color: 'green', marginLeft: '2%' }}>${ bank.phoneMoney }</span>
                                </div>
                            </Fragment>
                        : <Fragment>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40%" height="40%" viewBox="0 0 57.685 99.3">
                                    <path id="Path_103" data-name="Path 103" d="M58.312,0H14.041A6.726,6.726,0,0,0,7.334,6.707V92.59a6.728,6.728,0,0,0,6.707,6.71H58.312a6.724,6.724,0,0,0,6.707-6.707V6.707A6.726,6.726,0,0,0,58.312,0ZM29.095,4.834H43.258a.813.813,0,0,1,0,1.626H29.095a.813.813,0,0,1,0-1.626Zm7.082,91.112A3.355,3.355,0,1,1,39.53,92.59,3.353,3.353,0,0,1,36.176,95.947Zm24.175-9.059H12V10.636H60.352Z" transform="translate(-7.334)"/>
                                </svg>
                                <div style={{ marginTop: '5%' }}>У Вас нет телефона</div>
                            </Fragment>
                    }
                    <div className='buttons_panel-bank-react'>
                        <button className='button_panel-bank-react' onClick={closePage}>
                            Назад
                        </button>
                    </div>

                    <div style={{ color: 'red', marginTop: '5%' }}>{ error }</div>
                </div>
            </Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(BankPhone);