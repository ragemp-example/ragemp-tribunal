import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp} from "../../actions/apps.actions";
import Success from "./Success";
import Error from "./Error";
import Loader from "../Loader";
import styles from './Biz.module.scss';

class AnsOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getAnsPage = this.getAnsPage.bind(this);
    }

    getAnsPage(status) {
        const { addApp, closeApp, productsCount, productsPrice } = this.props;

        if (status === 0) {
            closeApp();
            addApp(<Error status='Ошибка'/>);
        }
        else if (status === 1) {
            closeApp();
            closeApp();
            addApp(<Success status='Заказ успешно сделан' productsCount={productsCount} productsPrice={productsPrice}/>);
        }
        else if (status === 2) {
            closeApp();
            addApp(<Error status='Недостаточно денег в кассе'/>);
        }

        else if (status === 3) {
            closeApp();
            addApp(<Error status='Недостаточно места на складе'/>);
        }
    }

    render() {
        const { info } = this.props;

        return (
            <Fragment>
                {
                    info.biz[0].orderStatus != null
                        ? <Fragment>{this.getAnsPage(info.biz[0].orderStatus)}</Fragment>
                        : <Loader />
                }
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    addApp: app => dispatch(addApp(app)),
    closeApp: () => dispatch(closeApp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnsOrder);