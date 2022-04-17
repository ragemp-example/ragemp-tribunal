import React, { Fragment } from 'react';

import HouseButton from './HouseButton';

import buy from '../../../imgs/house/buy.svg';
import look from '../../../imgs/house/look.svg';
import actions_image from '../../../imgs/house/actions.svg';
import enter from '../../../imgs/house/enter.svg';

import styles from '../styles/house.module.scss';
import {formatPrice} from "../../bank/components/utils";


const styleBlur = {
  filter: 'blur(3px) brightness(0.3)',
};

const getButtons = (info, actions) => {
    if (info.owner) {
        return (
            <Fragment>    
                <HouseButton image={enter} text="Войти" action={info.garage ? actions.showEnter : actions.enter} />
                <HouseButton image={actions_image} text="Действия" action={actions.showActions} />
            </Fragment>
        )
    } else {
        return (
            <Fragment>    
                <HouseButton image={buy} text="Купить" action={actions.buy} />
                <HouseButton image={look} text="Осмотреть" action={info.garage ? actions.showEnter : actions.look} />
            </Fragment>
        )
    }
}

const MainPanel = ({ show, load, blur, info, actions }) => {
    return (
        show ?
        <div className={styles.back} style={blur && styleBlur}>
            <div className={styles.exit} onClick={actions.close}>ЗАКРЫТЬ <span>X</span></div>

            {
                load &&
                <Fragment>
                    <div className={styles.header}>
                        <b>Дом №{info.name}</b>
                        {!info.owner && <span className={styles.price}>${formatPrice(info.price)}</span>}
                    </div>

                    <div className={styles.info}>
                        <h1>Общая информация</h1>
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label>Район</label>
                                <span>{info.area}</span>
                            </div>
                            <div className={styles.field}>
                                <label>Класс</label>
                                <span>{info.class}</span>
                            </div>
                            <div className={styles.field}>
                                <label>Квартплата</label>
                                <span><span>${formatPrice(info.rent)}</span> в сутки</span>
                            </div>
                            <div className={styles.field}>
                                <label>Количество комнат</label>
                                <span>{info.numRooms}</span>
                            </div>
                            <div className={styles.field}>
                                <label>Гараж</label>
                                <span>{info.garage ? `есть (${info.carPlaces} мест)` : 'нет'}</span>
                            </div>
                            <div className={styles.field}>
                                <label>Владелец</label>
                                <span>{info.owner || '-'}</span>
                            </div>
                        </div>
                        <h1>Взаимодействие</h1>
                        <div className={styles.actions}>
                            { getButtons(info, actions) }
                        </div>
                    </div>
                </Fragment>
            }
        </div>
        : null
    );
};

export default MainPanel;