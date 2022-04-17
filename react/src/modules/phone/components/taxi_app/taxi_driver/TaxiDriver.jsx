import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import Header from "../Header";
import {addOrderTaxiDriver, loadInfoTaxiDriver, takeOrderTaxiDriver} from "../../../actions/taxi.driver.actions";
import {closeApp, setColor} from "../../../actions/apps.actions";
import ActiveOrder from "./ActiveOrder";
import OrderList from "./OrderList";
import styles from '../taxi.module.scss';
import Loader from "../../Loader";


class TaxiDriver extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastColor: ''
        };

        this.getForm = this.getForm.bind(this);
    }

    componentDidMount() {
        const { taxi, info, setColor } = this.props;

        this.setState({ lastColor: info.color });
        setColor('white');

        // setTimeout(() => {
        //     this.props.loadInfo({
        //         name: 'Dun Hill',
        //         orders: [
        //             {
        //                 id: 0,
        //                 distance: 4.2
        //             },
        //             {
        //                 id: 1,
        //                 distance: 0.5
        //             },
        //             {
        //                 id: 0,
        //                 distance: 4.2
        //             },
        //             {
        //                 id: 1,
        //                 distance: 0.5
        //             },
        //             {
        //                 id: 0,
        //                 distance: 4.2
        //             },
        //             {
        //                 id: 1,
        //                 distance: 0.5
        //             },
        //             {
        //                 id: 0,
        //                 distance: 4.2
        //             },
        //             {
        //                 id: 1,
        //                 distance: 0.5
        //             },
        //         ]
        //     })
        // }, );
        // //
        // setTimeout(() => {
        //     // this.props.addOrder({id: 4, distance: 3.1});
        // }, 2000);

        if (Object.keys(taxi).length === 0) {
            // eslint-disable-next-line no-undef
            mp.trigger('taxi.driver.app.open');
        }
    }

    componentWillUnmount() {
        this.props.setColor(this.state.lastColor);
    }

    getForm() {
        const { taxi, takeOrder } = this.props;

        return (
            <div className={styles.app} style={{ backgroundColor: '#232323' }}>
                <Header>TAXI DRIVER</Header>

                {
                    taxi.activeOrder == null
                    ?   <div className={styles.orders}>
                            <div className={styles.title}>Заказы</div>
                            <div className={styles.ordersHeader}>
                                <p>Вы</p>
                                <span>{taxi.name}</span>
                                <p>Доступно заказов</p>
                                <span>{taxi.orders.length}</span>
                            </div>
                            <OrderList orders={taxi.orders} takeOrder={takeOrder} />
                            <div className={styles.ordersBottom}/>
                        </div>
                    : <ActiveOrder />
                }
            </div>
        );
    }

    render() {
        const { taxi } = this.props;

        return Object.keys(taxi).length > 0 ? this.getForm() : <Loader />
    }
}

const mapStateToProps = state => ({
    taxi: state.taxiDriver,
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    loadInfo: info => dispatch(loadInfoTaxiDriver(info)),
    closeApp: () => dispatch(closeApp()),
    addOrder: order => dispatch(addOrderTaxiDriver(order)),
    takeOrder: id => dispatch(takeOrderTaxiDriver(id)),
    setColor: color => dispatch(setColor(color))
});

export default connect(mapStateToProps, mapDispatchToProps)(TaxiDriver);