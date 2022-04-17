import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import styles from './HouseApp.module.scss';
import HouseHeader from "./HouseHeader";
import {Button, Container} from "./utils";
import {ok, cancel, government_sell} from './icons';
import {closeApp, disabledHome, addApp} from "../../actions/apps.actions";
import {setSellStatusHouse} from '../../actions/house.actions';
import AnsSell from "./AnsSell";


const SellGov = ({ closeAppAction, disabledHomeAction, house, info, setSellStatusAction, addAppAction }) => {
    const sell = () => {
        disabledHomeAction(true);
        addAppAction(<AnsSell />);

        // eslint-disable-next-line no-undef
        mp.trigger('house.sell.toGov', house.name);

        // setTimeout(() => {
        //     setSellStatusAction(1);
        // }, 1000);
    };

    return (
        <div className={styles.back}>
            <HouseHeader />

            <Container>
                <h1 style={{ textAlign: 'left' }}>Продажа государству</h1>

                <div className={styles.sellInfo}>
                    <img src={government_sell} />
                    <p>Будет начислено <b>${house.price * 0.6}</b></p>
                    <span>(60% от гос. стоимости)</span>
                </div>

                {
                    !info.disabled &&
                    <div className={styles.buttonsBlock}>
                        <Button
                            primary
                            onClick={sell}
                        >
                            <span>Подтвердить</span>
                            <img src={ok} />
                        </Button>
                        <Button
                            onClick={closeAppAction}
                        >
                            <span>Отменить</span>
                            <img src={cancel} />
                        </Button>
                    </div>
                }
            </Container>
        </div>
    );
};

const mapStateToProps = state => ({
    house: state.info.houses[0],
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    closeAppAction: () => dispatch(closeApp()),
    addAppAction: (app) => dispatch(addApp(app)),
    setSellStatusAction: status => dispatch(setSellStatusHouse(status)),
    disabledHomeAction: state => dispatch(disabledHome(state))
});

export default connect(mapStateToProps, mapDispatchToProps)(SellGov);