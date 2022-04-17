/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import { closeApp, addApp, disabledHome } from "../../actions/apps.actions";
import {setBuyStatusBusiness} from '../../actions/biz.actions';
import AnsBuy from "./AnsBuy";
import Header from './Header';
import styles from './Biz.module.scss';
import {Button, Container} from "./utils";
import {manage, new_stock} from "./icons";

class Improvements extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0,
            startIndex: 0
        };

        this.getImprovements = this.getImprovements.bind(this);
    }

    getImprovements() {
        const { business, addApp, disableHome, setBuyStatus } = this.props;
        const { activeIndex, startIndex } = this.state;

        const improvement = business.improvements[0];

        return (
            <Fragment>
                <div className={styles.improvement}>
                    <img src={new_stock} />
                    <span>{improvement.name}</span>
                </div>
                <Button
                    cancel={improvement.isBuyed}
                    onClick={() => {
                        if (improvement.isBuyed) return;

                        mp.trigger('biz.improvements.buy', improvement.type);
                        disableHome(true);
                        addApp(<AnsBuy type={improvement.type}/>);

                        // setTimeout(() => setBuyStatus(1), 1000)
                    }}
                >
                    { improvement.isBuyed ? 'Улучшение куплено' : <b style={{ color: '#0bc154' }}>${improvement.price}</b> }
                </Button>
            </Fragment>
        )
    }

    getContent() {
        const { business, closeApp, addApp } = this.props;
        const { activeIndex, startIndex } = this.state;

        return (
            <Fragment>
                <Container>
                    { business.improvements.length > 0
                        ? this.getImprovements()
                        : <div style={{ textAlign: 'center', marginTop: '20%', fontSize: '1.5em' }}>Доступных улучшений нет</div>
                    }
                </Container>
                <div className={styles.menuButtons}>
                    <div onClick={closeApp}>
                        <img src={manage}/>
                        <span>Управление</span>
                    </div>
                </div>
            </Fragment>
        )
    }

    render() {

        const { business } = this.props;

        return (
            <div className={styles.back}>
                <Header title='Улучшения бизнеса'/>

                {
                    this.getContent(business)
                }
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
    setBuyStatus: status => dispatch(setBuyStatusBusiness(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(Improvements);