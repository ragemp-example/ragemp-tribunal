import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeApp, disabledHome} from "../../actions/apps.actions";
import { setSellInfoBusiness, setSellStatusBusiness} from "../../actions/biz.actions";
import Header from "./Header";
import styles from "./Biz.module.scss";
import {Button, Container} from "./utils";

class Error extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.back = this.back.bind(this);
    }

    back() {
        const { setSellInfo, setSellStatus, closeApp, disableHome } = this.props;

        disableHome(false);
        setSellInfo(null);
        setSellStatus(null);
        closeApp();
    }

    render() {
        const { business, status, closeApp } = this.props;

        return (
            <div className={styles.back}>
                <Header business={business} />
                <Container>
                    <h1 className={styles.message} style={{ color: '#FF8D8D' }}>{status}</h1>
                    <div className={styles.buttonsBlock}>
                        <Button cancel onClick={this.back}>
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
    closeApp: () => dispatch(closeApp()),
    disableHome: state => dispatch(disabledHome(state)),
    setSellStatus: status => dispatch(setSellStatusBusiness(status)),
    setSellInfo: info => dispatch(setSellInfoBusiness(info)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Error);