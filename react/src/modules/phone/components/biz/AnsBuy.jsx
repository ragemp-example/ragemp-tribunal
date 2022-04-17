import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp} from "../../actions/apps.actions";
import Success from "./SuccessBuy";
import Error from "./Error";
import Header from './Header';
import Loader from "../Loader";
import styles from './Biz.module.scss';

class AnsBuy extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getAnsPage = this.getAnsPage.bind(this);
    }

    getAnsPage(status) {
        const { addApp, closeApp } = this.props;

        if (status == 0) {
            closeApp();
            addApp(<Error status='Ошибка'/>);
        }
        else if (status == 1) {
            closeApp();
            addApp(<Success type={this.props.type}/>);
        }
        else if (status == 2) {
            closeApp();
            addApp(<Error status='У вас недостаточно денег'/>);
        }
    }

    render() {
        const { info, business } = this.props;

        return (
            <Fragment>
                {
                    info.biz[0].buyStatus != null
                        ? <Fragment>{this.getAnsPage(info.biz[0].buyStatus)}</Fragment>
                        :  <Loader/>
                }
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    business: state.info.biz[0]
});

const mapDispatchToProps = dispatch => ({
    addApp: app => dispatch(addApp(app)),
    closeApp: () => dispatch(closeApp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnsBuy);