import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {cancelOrderTaxiClient} from "../../../actions/taxi.client.actions";
import styles from "../taxi.module.scss";
import {Button} from "../taxi_driver/Order";

class WayPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.cancelOrder = this.cancelOrder.bind(this);
    }

    cancelOrder() {
        this.props.cancelOrderTaxi();

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.client.app.cancel');
    }

    render() {
        const {taxi, info} = this.props;

        return (
            <Fragment>
                <div className={styles.title} style={{marginTop: '1.5em'}}>Поездка</div>
                <div className={styles.ordersHeader} style={{paddingBottom: '24em'}}>
                    <p>Водитель</p>
                    <span>{taxi.order.name}</span>
                    <p>Авто</p>
                    <span>{taxi.order.model}</span>
                    <p>Номер</p>
                    <span>{taxi.order.number}</span>
                    <div className={styles.activeOrderInfo} style={{ marginBottom: '0.5em' }}>
                        <div className={styles.point} style={{backgroundColor: '#2EE836'}}/>
                        <div className={styles.location}>
                            {taxi.order.location.street}, {taxi.order.location.area}
                        </div>
                    </div>
                    <div className={styles.activeOrderInfo}>
                        <div className={styles.point}/>
                        <div className={styles.location}>
                            {taxi.order.street}, {taxi.order.area}
                        </div>
                    </div>
                    <p>Стоимость заказа</p>
                    <span>$ {taxi.order.price}</span>
                    <p>Сумма спишется по окончанию поездки</p>
                    <Button
                        onClick={this.createOrder}
                        style={{marginTop: '1.5em', padding: '0.9em 1em'}}
                    >
                        Отменить
                    </Button>
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    taxi: state.taxiClient,
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    cancelOrderTaxi: () => dispatch(cancelOrderTaxiClient()),
});

export default connect(mapStateToProps, mapDispatchToProps)(WayPage);