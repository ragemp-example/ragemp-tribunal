import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeApp, setApp, disabledHome} from "../../actions/apps.actions";
import {
    createOrderBusiness,
    sellBusiness,
    setSellInfoBusiness,
    setSellStatusBusiness
} from "../../actions/biz.actions";
import MainDisplay from "../MainDisplay";
import Header from "./Header";
import {Button, Container} from "./utils";
import styles from './Biz.module.scss';

class Success extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.back = this.back.bind(this);
        this.getButton = this.getButton.bind(this);
    }

    componentDidMount() {
        const { business, sellBusiness, createOrder, productsCount, productsPrice, disableHome } = this.props;

        if (business.sellStatus != null) {
            sellBusiness(business.id);
            disableHome(false);
        } else if (business.orderStatus != null) {
            createOrder(productsCount, parseInt(productsCount * productsPrice));
            disableHome(false);
        }
    }

    back() {
        const { business, setApp, closeApp, info } = this.props;

        closeApp();
    }

    getButton(status) {
        const { setApp } = this.props;

        if (status === 'Бизнес продан') {
            return (
                <Button onClick={() => setApp(<MainDisplay />)}>
                    В главное меню
                </Button>
            )
        }

        if (status === 'Заказ успешно сделан') {
            return (
                <Button onClick={this.back}>
                    Назад
                </Button>
            )
        }
    }

    render() {

        const { business, status, name, area } = this.props;

        return (
            <div className={styles.back}>
                <Header business={business || { name, area }} />
                <Container>
                    <h1 className={styles.message}>{status}</h1>
                    <div className={styles.buttonsBlock}>
                        { this.getButton(status) }
                    </div>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    business: state.info.biz[0]
});

const mapDispatchToProps = dispatch => ({
    setApp: app => dispatch(setApp(app)),
    closeApp: () => dispatch(closeApp()),
    disableHome: state => dispatch(disabledHome(state)),
    setSellStatus: status => dispatch(setSellStatusBusiness(status)),
    setSellInfo: info => dispatch(setSellInfoBusiness(info)),
    sellBusiness: id => dispatch(sellBusiness(id)),
    createOrder: (productsCount, productsPrice) => dispatch(createOrderBusiness(productsCount, productsPrice))
});

export default connect(mapStateToProps, mapDispatchToProps)(Success);