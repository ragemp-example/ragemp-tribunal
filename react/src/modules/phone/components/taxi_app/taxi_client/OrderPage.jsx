import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
    cancelOrderTaxiClient, confirmOrderTaxiClient,
    driverReadyTaxiClient,
    playerInTaxiClient,
    setDestinationTaxiClient
} from "../../../actions/taxi.client.actions";
import styles from "../taxi.module.scss";
import {Button} from "../taxi_driver/Order";

class OrderPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.cancelOrder = this.cancelOrder.bind(this);
    }

    componentDidMount() {
        // setTimeout(() => {
        //     this.props.taxiReady()
        // }, 1000);
        //
        // setTimeout(() => {
        //     this.props.inTaxi()
        // }, 5000);
        //
        // setTimeout(() => {
        //     this.props.setDestination('Бертон', 'Ветряная ферма Ron Alternates', 120)
        // }, 10000);

        // setTimeout(() => {
        //     this.props.confirmOrder()
        // }, 13000);
    }

    cancelOrder() {
        this.props.cancelOrderTaxi();

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.client.app.cancel');
    }

    render() {
        const { taxi, info } = this.props;

        return (
            <Fragment>
                <div className={styles.title} style={{marginTop: '1.5em'}}>Ожидайте</div>
                <div className={styles.ordersHeader} style={{paddingBottom: '24em'}}>
                    <b style={{ marginBottom: '1em', display: 'block', fontSize: '1.2em' }}>{info.name}</b>
                    <p>Водитель</p>
                    <span>{taxi.order.name}</span>
                    <p>Авто</p>
                    <span>{taxi.order.model}</span>
                    <p>Номер</p>
                    <span>{taxi.order.number}</span>
                    <Button
                        onClick={this.cancelOrder}
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
    taxiReady: () => dispatch(driverReadyTaxiClient()),
    inTaxi: () => dispatch(playerInTaxiClient()),
    confirmOrder: () => dispatch(confirmOrderTaxiClient()),
    setDestination: (area, street, price) => dispatch(setDestinationTaxiClient(area, street, price))
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderPage);