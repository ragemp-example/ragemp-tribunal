import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeApp, disabledHome} from "../../actions/apps.actions";
import {setSellInfoHouse, setSellStatusHouse, setBuyStatusHouse} from "../../actions/house.actions";
import HouseHeader from "./HouseHeader";
import styles from "./HouseApp.module.scss";
import {Button, Container} from "./utils";
import {error, cancel} from "./icons";

class Error extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.back = this.back.bind(this);
    }

    back() {
        const { disableHome, setSellInfo, setSellStatus, setBuyStatus, closeApp } = this.props;

        disableHome(false);
        setSellInfo(null);
        setSellStatus(null);
        setBuyStatus(null);
        closeApp();
    }

    render() {
        const { house, status, closeApp } = this.props;

        return (
            <Fragment>
                <div className={styles.back}>
                    <HouseHeader/>
                    <Container>
                        <div className={styles.answer}>
                            <img src={error} />
                            <h1>{ status }</h1>
                        </div>
                        <div className={styles.buttonsBlock}>
                            <Button
                                onClick={this.back}
                                style={{ marginTop: '20%' }}
                            >
                                <span>Закрыть окно</span>
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
    closeApp: () => dispatch(closeApp()),
    disableHome: state => dispatch(disabledHome(state)),
    setSellStatus: status => dispatch(setSellStatusHouse(status)),
    setSellInfo: info => dispatch(setSellInfoHouse(info)),
    setBuyStatus: status => dispatch(setBuyStatusHouse(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(Error);