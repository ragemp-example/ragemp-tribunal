import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp, disabledHome} from "../../actions/apps.actions";
import AnsSell from "./AnsSell";
import { setSellStatusBusiness } from "../../actions/biz.actions";
import styles from './Biz.module.scss';
import Header from "./Header";
import {Button, Container} from "./utils";
import {government} from "./icons";

class SellState extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.sellBusiness = this.sellBusiness.bind(this);
    }

    componentDidMount() {
        this.props.setSellStatus(null);
    }

    sellBusiness() {
        const { addApp, setSell, setSellStatus, business, disableHome } = this.props;

        // closeApp();
        disableHome(true);
        addApp(<AnsSell />);

        // eslint-disable-next-line no-undef
        mp.trigger('biz.sell.toGov', business.id);

        // setTimeout(() => {
        //     setSellStatus(0);
        // }, 1000);
    }

    render() {

        const { business, info, closeApp } = this.props;

        return (
            <div className={styles.back}>
                <Header title={business.area}/>
                <Container>
                    <p className={styles.title}>Продажа государству</p>
                    <p className={styles.sellInfo}>
                        Будет начислено: <span style={{ color: '#45C34A' }}>${business.price * 0.6}</span><br/>
                        <span>(60% от гос. стоимости)</span>
                    </p>
                    <div className={styles.sellImage}>
                        <img src={government} />
                    </div>

                    <div className={styles.buttonsBlock}>
                        <Button onClick={this.sellBusiness}>
                            Подтвердить
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    business: state.info.biz[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    addApp: app => dispatch(addApp(app)),
    disableHome: state => dispatch(disabledHome(state)),
    setSellStatus: status => dispatch(setSellStatusBusiness(status)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SellState);