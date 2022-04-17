import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {cancelOrderTaxiClient, createOrderTaxiClient} from "../../../actions/taxi.client.actions";
import styles from "../taxi.module.scss";
import {Button} from "../taxi_driver/Order";
import info_icon from '@imgs/phone/taxi_app/info.svg';

class SearchPage extends Component {
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
        const { taxi } = this.props;

        return (
            <Fragment>
                <div className={styles.info}>
                    <img src={info_icon} />
                    <p>Заказ автоматически отменится, если вы выйдете из зоны заказа</p>
                </div>
                <div className={styles.ordersHeader} style={{ marginTop: '6.5em', paddingBottom: '3.5em' }}>
                    <b>Ищем Вам машину...</b>
                    <Button
                        onClick={this.cancelOrder}
                        style={{ marginTop: '1.5em', padding: '0.9em 1em' }}
                    >
                        Отменить
                    </Button>
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    taxi: state.taxiClient
});

const mapDispatchToProps = dispatch => ({
    cancelOrderTaxi: () => dispatch(cancelOrderTaxiClient()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage);