import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {ansOrderTaxiClient, createOrderTaxiClient, loadLocationTaxiClient} from "../../../actions/taxi.client.actions";
import styles from "../taxi.module.scss";
import {Button} from "../taxi_driver/Order";
import Header from "../Header";


class StartPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getLocation = this.getLocation.bind(this);
        this.createOrder = this.createOrder.bind(this);
    }

    componentDidMount() {
        // setTimeout(() => {
        //     this.props.loadLocation('Бертон', 'Карсон-Авеню')
        // }, 1000)

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.client.app.open');
    }

    createOrder() {
        this.props.createOrderTaxi();

        // setTimeout(() => {
        //     this.props.ansTaxi({
        //         name: 'Kir Swift',
        //         model: 'Blista',
        //         number: 'ZBT228'
        //     })
        // }, 5000);

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.client.app.search');
    }

    getLocation() {
        const {taxi} = this.props;

        if (taxi.location) return `${taxi.location.street}, ${taxi.location.area}`;
        return 'Определение местоположения...';
    }

    render() {
        const {taxi, info} = this.props;

        return (
            <Fragment>
                <div className={styles.title} style={{marginTop: '1.5em'}}>Заказ</div>
                <div className={styles.ordersHeader} style={{paddingBottom: '24em'}}>
                    <b style={{ marginBottom: '1em', display: 'block', fontSize: '1.2em' }}>{info.name}</b>
                    <div className={styles.activeOrderInfo}>
                        <div className={styles.point} style={{backgroundColor: '#2EE836'}}/>
                        <div className={styles.location}>
                            {this.getLocation()}
                        </div>
                    </div>
                    <Button
                        onClick={this.createOrder}
                        style={{marginTop: '1.5em', padding: '0.9em 1em'}}
                        disabled={!taxi.location}
                    >
                        Заказать
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
    loadLocation: (area, street) => dispatch(loadLocationTaxiClient(area, street)),
    createOrderTaxi: () => dispatch(createOrderTaxiClient()),
    ansTaxi: answer => dispatch(ansOrderTaxiClient(answer)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StartPage);