import React, {Fragment} from 'react';
import styles from '../../../phone.module.scss';


const Menu = ({ startCall, startDialog, close }) => {
    return (
        <div className={styles.callStoryMenu}>
            <div onClick={startCall}>Позвонить</div>
            <div onClick={startDialog}>Написать сообщение</div>
            <div style={{ color: '#FF3B30' }} onClick={close}>Закрыть</div>
        </div>
    );
};

export default Menu;