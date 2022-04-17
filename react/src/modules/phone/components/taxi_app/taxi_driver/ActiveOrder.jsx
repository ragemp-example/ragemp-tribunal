import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {cancelOrderTaxiDriver, setDestinationTaxiDriver} from "../../../actions/taxi.driver.actions";
import styles from '../taxi.module.scss';
import info_icon from '@imgs/phone/taxi_app/info.svg';
import {Button} from "./Order";


class ActiveOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.cancelOrder = this.cancelOrder.bind(this);
    }

    // componentDidMount() {
    //     setTimeout(() => {
    //         this.props.setDestination('Бертон', 'Карсон-Авеню', 16)
    //     }, 3000)
    // }

    cancelOrder() {
        const { taxi, cancelOrderTaxi } = this.props;

        cancelOrderTaxi(taxi.activeOrder.id);

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.driver.app.order.cancel', taxi.activeOrder.id);
    }

    getWayPage() {
        const { taxi } = this.props;

        return (
            <Fragment>
                <div className={styles.title} style={{ marginTop: '1.5em' }}>В пути</div>
                <div className={styles.ordersHeader} style={{ paddingBottom: '24em' }}>
                    <div className={styles.activeOrderInfo}>
                        <div className={styles.point}/>
                        <div>
                            <p>{taxi.activeOrder.area},</p>
                            <p>{taxi.activeOrder.street}</p>
                        </div>
                    </div>
                    <p>Стоимость заказа</p>
                    <span>$ {taxi.activeOrder.price}</span>
                    <Button
                        onClick={this.cancelOrder}
                        style={{ marginTop: '1.5em', padding: '0.9em 1em' }}
                    >
                        Отменить
                    </Button>
                </div>
            </Fragment>
        )
    }

    getDefaultPage() {
        const { taxi } = this.props;

        return (
            <Fragment>
                <div className={styles.info}>
                    <img src={info_icon} />
                    <p>Местоположение клиента отмечено на вашем GPS</p>
                </div>
                <div className={styles.ordersHeader} style={{ marginTop: '7.5em', paddingBottom: '2.5em' }}>
                    <b>Заказ #{taxi.activeOrder.id + 1}</b>
                    <Button
                        onClick={this.cancelOrder}
                        style={{ marginTop: '1.5em', padding: '0.9em 1em' }}
                    >
                        Отменить
                    </Button>
                </div>
            </Fragment>
        )
    }

    render() {
        const { taxi } = this.props;

        return (
            <Fragment>
                { taxi.activeOrder.isWay ? this.getWayPage() : this.getDefaultPage() }
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    taxi: state.taxiDriver
});

const mapDispatchToProps = dispatch => ({
    cancelOrderTaxi: orderId => dispatch(cancelOrderTaxiDriver(orderId)),
    setDestination: (area, street, price) => dispatch(setDestinationTaxiDriver(area, street, price)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveOrder);