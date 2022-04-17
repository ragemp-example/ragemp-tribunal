import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import Header from "./Header";
import {addApp, closeApp} from "../../actions/apps.actions";
import styles from './Biz.module.scss';
import {info, next} from "./icons";
import {Container, ManageIcon} from "./utils";
import SellState from "./SellState";
import Sell from "./Sell";
import StockManager from "./StockManager";
import Improvements from "./Improvements";

class BusinessManager extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {business, addApp, closeApp} = this.props;

        return (
            <div className={styles.back}>
                <Header title='Управление бизнесом'/>
                <Container>
                    <div className={styles.manageButtons}>
                        <div className={styles.manageButton} onClick={() => addApp(<StockManager/>)}>
                            <ManageIcon color='#FF365A'>S</ManageIcon>
                            <div className={styles.name}>
                                <span>Склад</span>
                                <img src={next}/>
                            </div>
                        </div>
                        <div className={styles.manageButton} onClick={() => addApp(<Improvements/>)}>
                            <ManageIcon color='#5236FF'>UP</ManageIcon>
                            <div className={styles.name}>
                                <span>Улучшить</span>
                                <img src={next}/>
                            </div>
                        </div>
                        <div className={styles.manageButton} onClick={() => addApp(<Sell/>)}>
                            <ManageIcon color='#36FFAB'>$</ManageIcon>
                            <div className={styles.name}>
                                <span>Продать <br/><span>на руки</span></span>
                                <img src={next}/>
                            </div>
                        </div>
                        <div className={styles.manageButton} onClick={() => addApp(<SellState/>)}>
                            <ManageIcon color='#E3FF36'>$</ManageIcon>
                            <div className={styles.name}>
                                <span>Продать <br/><span>государству</span></span>
                                <img src={next}/>
                            </div>
                        </div>
                    </div>
                </Container>
                <div className={styles.menuButtons}>
                    <div onClick={closeApp}>
                        <img src={info}/>
                        <span>Информация</span>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    business: state.info.biz[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    addApp: app => dispatch(addApp(app)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BusinessManager);