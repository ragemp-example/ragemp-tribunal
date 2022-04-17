import React, {Fragment, useEffect} from 'react';
import styles from './HouseApp.module.scss';
import {Button, Container} from "./utils";
import {house, header, unlocked, locked} from './icons';
import {connect} from "react-redux";
import {addApp, setColor} from '../../actions/apps.actions';
import HouseManagement from "./HouseManagement";

const HouseApp = ({ info, addAppAction, setColorAction }) => {
    useEffect(() => {
        setColorAction('white');

        return () => {
            setColorAction(null);
        }
    }, []);

    return (
        <div className={styles.back}>
            <div className={styles.header}>
                <img src={header} />
                <div className={styles.headerInfo}>
                    <b>Дом {info.name}</b>
                    <p>{ info.area }</p>
                    <div className={info.isOpened ? styles.opened : styles.closed}>
                        {
                            info.isOpened
                            ? <Fragment>
                                    <span>Открыт</span>
                                    <img src={unlocked} />
                                </Fragment>
                            : <Fragment>
                                    <span>Закрыт</span>
                                    <img src={locked} />
                                </Fragment>
                        }
                    </div>
                </div>
            </div>
            <Container>
                <div className={styles.info}>
                    <h1>Информация</h1>
                    <div className={styles.items}>
                        <div className={styles.item}>
                            <span>Класс</span>
                            <p>{info.class}</p>
                        </div>
                        <div className={styles.item}>
                            <span>Количество комнат</span>
                            <p>{info.numRooms}</p>
                        </div>
                        <div className={styles.item}>
                            <span>Гараж</span>
                            <p>{info.garage ? 'Есть' : 'Нет'}</p>
                        </div>
                        <div className={styles.item}>
                            <span>Парковочных мест</span>
                            <p>{info.carPlaces}</p>
                        </div>
                        <div className={styles.item}>
                            <span>Квартплата</span>
                            <p>${info.rent}/сут.</p>
                        </div>
                        <div className={styles.item}>
                            <span>Оплачен</span>
                            <p>{info.days}/30</p>
                        </div>
                    </div>
                </div>
                <div className={styles.buttonsBlock}>
                    <Button
                        primary
                        onClick={() => addAppAction(<HouseManagement/>)}
                    >
                        <span>Управление домом</span>
                        <img src={house} />
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
    setColorAction: color => dispatch(setColor(color))
});

export default connect(mapStateToProps, mapDispatchToProps)(HouseApp);