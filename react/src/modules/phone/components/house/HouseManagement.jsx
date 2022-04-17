import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import styles from './HouseApp.module.scss';
import HouseHeader from "./HouseHeader";
import {Button, Container} from "./utils";
import {
    info as info_icon,
    cancel as cancel_icon,
    key as key_icon,
    improvements as improvements_icon,
    government as government_icon,
    agreement as agreement_icon,
} from './icons';
import {addApp, closeApp, setApp} from "../../actions/apps.actions";
import MainDisplay from "../MainDisplay";
import {changeStateHouse} from "../../actions/house.actions";
import SellGov from "./SellGov";
import Sell from "./Sell";
import Improvements from "./Improvements";

const HouseManagement = ({ info, addAppAction, closeAppAction, setAppAction, changeStateAction }) => {
    return (
        <div className={styles.back}>
            <HouseHeader/>
            <Container>
                <h1>Управление домом</h1>
                <div className={styles.managementButtons}>
                    <div
                        className={styles.managementButton}
                        onClick={() => {
                            // eslint-disable-next-line no-undef
                            mp.trigger('house.lock', info.name, !info.isOpened);

                            changeStateAction();
                        }}
                    >
                        <img src={key_icon} style={{ width: '55%' }} />
                        {
                            info.isOpened
                                ? <span style={{ color: '#E51414' }}><b>Закрыть</b></span>
                                : <span style={{ color: '#1BBB5B' }}><b>Открыть</b></span>
                        }
                    </div>
                    <div
                        className={styles.managementButton}
                        onClick={() => addAppAction(<Improvements/>)}
                    >
                        <img src={improvements_icon} style={{ width: '55%' }} />
                        <span><b>Улучшить</b></span>
                    </div>
                    <div
                        className={styles.managementButton}
                        onClick={() => addAppAction(<Sell/>)}
                    >
                        <img src={agreement_icon} />
                        <span>
                            <b>Продать</b><br/>
                            <span>на руки</span>
                        </span>
                    </div>
                    <div
                        className={styles.managementButton}
                        onClick={() => addAppAction(<SellGov/>)}
                    >
                        <img src={government_icon} />
                        <span>
                            <b>Продать</b><br/>
                            <span>государству</span>
                        </span>
                    </div>
                </div>
                <div className={styles.buttonsBlock}>
                    <Button
                        primary
                        onClick={closeAppAction}
                    >
                        <span>Информация</span>
                        <img src={info_icon} />
                    </Button>
                    <Button
                        onClick={() => setAppAction(<MainDisplay/>)}
                    >
                        <span>Закрыть меню</span>
                        <img src={cancel_icon} />
                    </Button>
                </div>
            </Container>
        </div>
    );
};

const mapStateToProps = state => ({
    info: state.info.houses[0]
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    setAppAction: app => dispatch(setApp(app)),
    closeAppAction: () => dispatch(closeApp()),
    changeStateAction: () => dispatch(changeStateHouse())
});

export default connect(mapStateToProps, mapDispatchToProps)(HouseManagement);