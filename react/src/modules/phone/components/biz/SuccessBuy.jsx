import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeApp, disabledHome} from "../../actions/apps.actions";
import {buyImprovementBusiness, setBuyStatusBusiness} from "../../actions/biz.actions";
import Header from './Header';
import styles from "./Biz.module.scss";
import {Button, Container} from "./utils";

class SuccessBuy extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.back = this.back.bind(this);
    }

    componentDidMount() {
        const { type, buyImprovement, disableHome } = this.props;

        buyImprovement(type);
        disableHome(false);
    }

    back() {
        const { closeApp } = this.props;

        closeApp();
    }

    render() {

        const { business } = this.props;

        return (
            <div className={styles.back}>
                <Header business={business} />
                <Container>
                    <h1 className={styles.message}>Улучшение куплено</h1>
                    <div className={styles.buttonsBlock}>
                        <Button onClick={this.back}>
                            Назад
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    ...state,
    business: state.info.biz[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: app => dispatch(closeApp(app)),
    disableHome: state => dispatch(disabledHome(state)),
    setBuyStatus: status => dispatch(setBuyStatusBusiness(status)),
    buyImprovement: type => dispatch(buyImprovementBusiness(type)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SuccessBuy);