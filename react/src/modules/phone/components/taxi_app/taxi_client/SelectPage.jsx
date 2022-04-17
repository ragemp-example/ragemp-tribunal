import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {cancelOrderTaxiClient, confirmOrderTaxiClient} from "../../../actions/taxi.client.actions";
import styles from "../taxi.module.scss";
import {Button} from "../taxi_driver/Order";

class SelectPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.cancelOrder = this.cancelOrder.bind(this);
        this.confirmOrder = this.confirmOrder.bind(this);
    }

    cancelOrder() {
        this.props.cancelOrderTaxi();

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.client.app.cancel');
    }

    confirmOrder() {
        this.props.confirmOrderTaxi();

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.client.app.confirm');
    }

    render() {
        const {taxi, info} = this.props;

        return (
            <Fragment>
                <div className={styles.title} style={{marginTop: '1.5em'}}>Подтверждение заказа</div>
                <div className={styles.ordersHeader} style={{paddingBottom: '24em'}}>
                    <b style={{ marginBottom: '1em', display: 'block', fontSize: '1.2em' }}>{info.name}</b>
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
                    <p>Итого</p>
                    <span>$ {taxi.order.price}</span>
                    <Button
                        onClick={this.confirmOrder}
                        style={{marginTop: '1.5em', padding: '0.9em 1em'}}
                        disabled={!taxi.order.isSelect}
                    >
                        Подтвердить
                    </Button>
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
    confirmOrderTaxi: () => dispatch(confirmOrderTaxiClient())
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectPage);