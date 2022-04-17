import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import Header from "./Header";
import {closeApp} from "../../actions/apps.actions";
import {cancelOrderBusiness, updateCashBoxBusiness} from '../../actions/biz.actions';
import styles from './Biz.module.scss';
import {Button, Container} from "./utils";
import {order_cancel} from './icons'

class OrderCancel extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.cancelOrder = this.cancelOrder.bind(this);
    }

    cancelOrder() {
        const { business, cancelOrder, updateCashBox } = this.props;

        // eslint-disable-next-line no-undef
        mp.trigger('biz.order.cancel', business.id);
        // const sum = parseInt(business.order.productsCount * business.order.productPrice * 0.8);
        // updateCashBox(sum);
        cancelOrder();
    }

    render() {
        const { business, closeApp } = this.props;

        try {
            return (
                <div className={styles.back}>
                    <Header business={business}/>
                    <Container>
                        <h1 className={styles.title}>Отмена заказа</h1>
                        <div style={{ marginTop: '7%' }} className={styles.stockInfo}>
                            <p>Активный заказ: <span style={{ color: '#45C34A' }}>{business.order.productsCount} на ${business.order.productsPrice}</span></p>
                            <p style={{ color: 'rgba(255,255,255,0.67)' }}>При отмене заказ вам будет возвращено 80% от полной суммы</p>
                        </div>
                        <div className={styles.sellImage} style={{ marginTop: '20%' }}>
                            <img src={order_cancel} />
                        </div>

                        <div className={styles.buttonsBlock}>
                            <Button cancel onClick={this.cancelOrder}>
                                Отменить
                            </Button>
                        </div>
                    </Container>
                </div>
            );
        } catch (e) {
            return <h1>Ошибка</h1>
        }
    }
}

const mapStateToProps = state => ({
    business: state.info.biz[0],
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    cancelOrder: () => dispatch(cancelOrderBusiness()),
    updateCashBox: money => dispatch(updateCashBoxBusiness(money))
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderCancel);