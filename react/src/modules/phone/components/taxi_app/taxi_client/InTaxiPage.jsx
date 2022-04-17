import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {cancelOrderTaxiClient} from "../../../actions/taxi.client.actions";
import styles from "../taxi.module.scss";
import {Button} from "../taxi_driver/Order";

class InTaxiPage extends Component {
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
                <div className={styles.title} style={{marginTop: '1.5em'}}>Выбор маршрута</div>
                <div className={styles.ordersHeader} style={{paddingBottom: '24em'}}>
                    <b style={{ marginBottom: '1em', display: 'block', fontSize: '1.2em' }}>{info.name}</b>
                    <div className={styles.activeOrderInfo}>
                        <div className={styles.point} style={{backgroundColor: '#2EE836'}}/>
                        <div className={styles.location}>
                            {taxi.order.location.street}, {taxi.order.location.area}
                        </div>
                    </div>
                    <Button
                        style={{marginTop: '1.5em', padding: '0.9em 1em'}}
                        disabled={!taxi.isSelect}
                    >
                        Подтвердить
                    </Button>
                    <Button
                        onClick={this.createOrder}
                        style={{marginTop: '1.5em', padding: '0.9em 1em'}}
                    >
                        Отменить
                    </Button>
                    <div style={{ textAlign: 'center', marginTop: '1.5em' }}>Выберите маршрут на карте</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(InTaxiPage);