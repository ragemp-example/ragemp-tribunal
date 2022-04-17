import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp, setApp, disabledHome} from "../../actions/apps.actions";
import {setSellInfoHouse, setSellStatusHouse} from "../../actions/house.actions";
import ConfirmSell from "./ConfirmSell";
import HouseHeader from "./HouseHeader";
import styles from './HouseApp.module.scss';
import {Button, Container, Input} from "./utils";
import {cancel, ok} from "./icons";

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
        this.sellHouse = this.sellHouse.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    handleChangeInput(e) {
        this.setState({ [e.target.id]: e.target.value })
    }

    sellHouse() {
        const { disableHome, setSellInfo, addApp, house } = this.props;
        const {userId, sellPrice} = this.state;

        disableHome(true);
        addApp(<ConfirmSell />);

        // eslint-disable-next-line no-undef
        mp.trigger('house.sell.check', house.name, userId, parseInt(sellPrice));

        // setTimeout(() => {
        //     setSellInfo({nick: 'Dun', price: this.state.sellPrice})
        // }, 1000)
    }

    validateForm() {
        const { userId, sellPrice } = this.state;
        const { house } = this.props;

        if (!userId) return this.setState({ errorUser: 'Поле не заполнено' });
        this.setState({ errorUser: '' });

        if (!sellPrice) return this.setState({ errorPrice: 'Поле не заполнено' });
        this.setState({ errorPrice: '' });

        if (isNaN(sellPrice)) return this.setState({ errorPrice: 'Некорректное значение' });
        this.setState({ errorPrice: '' });

        if (sellPrice < house.price) return this.setState({ errorPrice: `Цена должна быть не ниже государственной ($${house.price})` });
        this.setState({ errorPrice: '' });

        this.sellHouse();
    }

    getContent() {
        const { closeApp, info } = this.props;
        const { errorUser, errorPrice } = this.state;

        return (
            <div className={styles.back}>
                <HouseHeader />

                <Container>
                    <h1 style={{ textAlign: 'left' }}>Продажа на руки</h1>

                    <div className={styles.sellInfo}>
                        <Input
                            placeholder='ID или имя покупателя'
                            onChange={e => this.setState({ userId: e.target.value })}
                            error={errorUser}
                        />
                        <Input
                            placeholder='Сумма сделки'
                            onChange={e => this.setState({ sellPrice: e.target.value })}
                            error={errorPrice}
                        />
                    </div>

                    <div className={styles.error}>
                        { errorUser || errorPrice }
                    </div>

                    {
                        !info.disabled &&
                        <div className={styles.buttonsBlock}>
                            <Button
                                primary
                                onClick={this.validateForm}
                            >
                                <span>Подтвердить</span>
                                <img src={ok} />
                            </Button>
                            <Button
                                onClick={closeApp}
                            >
                                <span>Отменить</span>
                                <img src={cancel} />
                            </Button>
                        </div>
                    }
                </Container>
            </div>
        )
    }

    render() {
        return this.getContent();
    }
}

const mapStateToProps = state => ({
    info: state.info,
    house: state.info.houses[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    addApp: app => dispatch(addApp(app)),
    setApp: app => dispatch(setApp(app)),
    disableHome: state => dispatch(disabledHome(state)),
    setSellStatus: status => dispatch(setSellStatusHouse(status)),
    setSellInfo: info => dispatch(setSellInfoHouse(info)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sell);