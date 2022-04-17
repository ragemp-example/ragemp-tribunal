import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
    ansOrderTaxiClient,
    ansTaxiClient,
    cancelOrderTaxiClient, clearLocationTaxiClient,
    createOrderTaxiClient,
    loadLocationTaxiClient
} from "../../../actions/taxi.client.actions";
import {closeApp} from "../../../actions/apps.actions";
import SearchPage from "./SearchPage";
import TaxiReadyPage from "./TaxiReadyPage";
import WayPage from "./WayPage";
import OrderPage from "./OrderPage";
import InTaxiPage from "./InTaxiPage";
import StartPage from "./StartPage";
import SelectPage from "./SelectPage";
import styles from "../taxi.module.scss";
import Header from "../Header";

class TaxiClient extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getPage = this.getPage.bind(this);
    }

    componentWillUnmount() {
        const { taxi, clearLocation } = this.props;

        (!taxi.order && !taxi.isSearch) && clearLocation();
    }

    cancelOrder() {
        this.props.cancelOrderTaxi();

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.client.app.cancel');
    }

    getPage() {
        const { taxi } = this.props;

        if (!taxi.isSearch) {
            if (taxi.order) {
                if (taxi.order.isReady) {
                    if (taxi.order.isInTaxi) {
                        if (taxi.order.isSelect) {
                            if (taxi.order.isWay) {
                                return <WayPage/>
                            } else {
                                return <SelectPage />
                            }
                        } else {
                            return <InTaxiPage />
                        }
                    } else {
                        return <TaxiReadyPage/>
                    }
                } else {
                    return <OrderPage />
                }
            } else {
                return <StartPage />
            }
        } else {
            return <SearchPage />
        }
    }

    render() {
        const { taxi, closeApp } = this.props;

        return (
            <div className={[styles.app, styles.clientApp].join(' ')}>
                <Header>TAXI</Header>
                {this.getPage()}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    taxi: state.taxiClient
});

const mapDispatchToProps = dispatch => ({
    loadLocation: (area, street) => dispatch(loadLocationTaxiClient(area, street)),
    createOrderTaxi: () => dispatch(createOrderTaxiClient()),
    cancelOrderTaxi: () => dispatch(cancelOrderTaxiClient()),
    ansTaxi: answer => dispatch(ansOrderTaxiClient(answer)),
    closeApp: () => dispatch(closeApp()),
    clearLocation: () => dispatch(clearLocationTaxiClient())
});

export default connect(mapStateToProps, mapDispatchToProps)(TaxiClient);