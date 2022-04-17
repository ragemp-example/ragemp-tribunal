import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp, setApp, disabledHome} from "../../actions/apps.actions";
import {setSellInfoBusiness, setSellStatusBusiness} from "../../actions/biz.actions";
import ConfirmSell from "./ConfirmSell";
import HeaderBusinessApp from "./Header";
import styles from './Biz.module.scss';
import {Button, Container, Input} from "./utils";

class Sell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            sellPrice: '',
            errorUser: '',
            errorPrice: ''
        };

        this.getContent = this.getContent.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.sellBusiness = this.sellBusiness.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    handleChangeInput(e) {
        this.setState({ [e.target.id]: e.target.value })
    }

    sellBusiness() {
        const { disableHome, setSellStatus, setSellInfo, addApp, business } = this.props;
        const { userId, sellPrice } = this.state;

        disableHome(true);
        addApp(<ConfirmSell />);

        // eslint-disable-next-line no-undef
        mp.trigger('biz.sell.check', business.id, userId, parseInt(sellPrice));

        // setTimeout(() => {
        //     setSellInfo({nick: 'Dun', price: this.state.sellPrice})
        // }, 1000)
    }

    validateForm() {
        const { userId, sellPrice } = this.state;
        const { business } = this.props;

        if (!userId) return this.setState({ errorUser: 'Поле не заполнено' });
        this.setState({ errorUser: '' });

        if (!sellPrice) return this.setState({ errorPrice: 'Поле не заполнено' });
        this.setState({ errorPrice: '' });

        if (isNaN(sellPrice)) return this.setState({ errorPrice: 'Некорректное значение' });
        this.setState({ errorPrice: '' });

        if (sellPrice < business.price) return this.setState({ errorPrice: `Цена должна быть не ниже государственной ($${business.price})` });
        this.setState({ errorPrice: '' });

        this.sellBusiness();
    }

    getContent() {
        const { business, closeApp, addApp } = this.props;
        const { errorUser, errorPrice } = this.state;

        return (
            <Container>
                <h1 className={styles.title}>Продажа на руки</h1>

                <label>ID или имя покупателя</label>
                <Input
                    placeholder='Введите ID или имя'
                    onChange={e => this.setState({ userId: e.target.value })}
                    error={errorUser}
                />
                <label>Сумма сделки</label>
                <Input
                    placeholder='Введите сумму'
                    onChange={e => this.setState({ sellPrice: e.target.value })}
                    error={errorPrice}
                />
                <div className={styles.error}>{ errorPrice || errorUser }</div>

                <div className={styles.buttonsBlock}>
                    <Button onClick={this.validateForm}>
                        Подтвердить
                    </Button>
                </div>
            </Container>
        )
    }

    render() {

        const { business } = this.props;

        return (
            <div className={styles.back}>
                <HeaderBusinessApp business={business}/>

                {
                    this.getContent(business)
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    business: state.info.biz[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    addApp: app => dispatch(addApp(app)),
    setApp: app => dispatch(setApp(app)),
    disableHome: state => dispatch(disabledHome(state)),
    setSellStatus: status => dispatch(setSellStatusBusiness(status)),
    setSellInfo: info => dispatch(setSellInfoBusiness(info)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sell);