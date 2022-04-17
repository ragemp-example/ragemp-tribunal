import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeApp, disabledHome} from "../../actions/apps.actions";
import {buyImprovementHouse, setBuyStatusHouse} from "../../actions/house.actions";
import HouseHeader from "./HouseHeader";
import styles from "./HouseApp.module.scss";
import {Button, Container} from "./utils";
import {cancel, success} from "./icons";

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
        return (
            <Fragment>
                <div className={styles.back}>
                    <HouseHeader/>
                    <Container>
                        <div className={styles.answer}>
                            <img src={success} />
                            <h1>Улучшение куплено</h1>
                        </div>
                        <div className={styles.buttonsBlock}>
                            <Button
                                onClick={this.back}
                                style={{ marginTop: '20%' }}
                            >
                                <span>Назад</span>
                                <img src={cancel} />
                            </Button>
                        </div>
                    </Container>
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    ...state,
    house: state.info.houses[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: app => dispatch(closeApp(app)),
    disableHome: state => dispatch(disabledHome(state)),
    setBuyStatus: status => dispatch(setBuyStatusHouse(status)),
    buyImprovement: type => dispatch(buyImprovementHouse(type)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SuccessBuy);