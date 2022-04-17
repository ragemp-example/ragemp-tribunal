/* eslint-disable no-undef */
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeApp, addApp, disabledHome, setApp} from "../../actions/apps.actions";
import AnsBuy from "./AnsBuy";
import HouseHeader from "./HouseHeader";
import styles from './HouseApp.module.scss';
import {Button, Container} from "./utils";
import { house as home, cancel, cupboard } from './icons';
import MainDisplay from "../MainDisplay";

class Improvements extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getImprovements = this.getImprovements.bind(this);
        this.buy = this.buy.bind(this);
    }

    buy(improvement) {
        const { disableHome, addApp } = this.props;

        if (improvement.isBuyed) return;

        mp.trigger('house.improvements.buy', improvement.type);
        disableHome(true);
        addApp(<AnsBuy type={improvement.type}/>);
    }

    getImprovements() {
        const { house, addApp, disableHome } = this.props;

        return (
            <div className={styles.improvements}>
                {
                    house.improvements.map((improvement, index) => (
                        <div className={styles.improvement} onClick={() => this.buy(improvement)} key={index}>
                            <img src={cupboard} />
                            <div>
                                <b>{ improvement.name }</b><br/>
                                { improvement.isBuyed
                                    ? <span style={{ color: '#1BBB5B' }}>Улучшение куплено</span>
                                    : <span style={{ color: '#1BBB5B' }}>Купить за ${ improvement.price }</span>
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }

    getContent() {
        const { house, closeApp, setApp } = this.props;

        return (
            <Container>
                <h1>Улучшения дома</h1>

                { house.improvements.length > 0
                    ? this.getImprovements()
                    : <div style={{ textAlign: 'center', marginTop: '20%', fontSize: '140%' }}>Доступных улучшений нет</div>
                }

                <div className={styles.buttonsBlock}>
                    <Button
                        primary
                        onClick={closeApp}
                    >
                       <span>Управление домом</span>
                       <img src={home} />
                    </Button>
                    <Button
                        onClick={() => setApp(<MainDisplay/>)}
                    >
                        <span>Закрыть меню</span>
                        <img src={cancel} />
                    </Button>
                </div>
            </Container>
        )
    }

    render() {

        const { house } = this.props;

        return (
            <Fragment>
                <div className={styles.back}>
                    <HouseHeader/>

                    {
                        this.getContent(house)
                    }
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    house: state.info.houses[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    addApp: app => dispatch(addApp(app)),
    setApp: app => dispatch(setApp(app)),
    disableHome: state => dispatch(disabledHome(state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Improvements);