import React from 'react';
import styles from '../styles/house.module.scss';


const Confirm = ({ show, actions, name }) => {
    return (
        show ?
        <div className={styles.message}>
            <p>Вы действительно хотите приобрести дом №{name}?</p>
            <div className={styles.messageButtons}>
                <div onClick={actions.yes}>Да</div>
                <div onClick={actions.no}>Нет</div>
            </div>
        </div>
        : null
    );
}

export default Confirm;