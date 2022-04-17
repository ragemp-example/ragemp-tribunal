import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {cancelOrderTaxiClient} from "../../../actions/taxi.client.actions";
import styles from "../taxi.module.scss";
import {Button} from "../taxi_driver/Order";

class TaxiReadyPage extends Component {
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
        const { taxi, info } = this.props;

        return (
            <Fragment>
                <div className={styles.title} style={{marginTop: '1.5em'}}>Водитель подъехал</div>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(TaxiReadyPage);