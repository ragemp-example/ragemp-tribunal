import React, {useEffect} from 'react';
import {closeApp, disabledHome} from '../../actions/apps.actions';
import {connect} from 'react-redux';
import styles from './BankApp.module.scss';
import {BackArrow} from "./icons";


const Header = ({ info, closeAppAction, color, disabled, disabledHome }) => {
    useEffect(() => {
        disabledHome(disabled);
    }, []);

    return (
        <div className={styles.header}>
            {!disabled && <BackArrow color={color || 'black'} onClick={closeAppAction} />}
            <span style={{ color: color || 'black' }}>Мой банк</span>
        </div>
    );
}

const mapStateToProps = state => ({
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    closeAppAction: () => dispatch(closeApp()),
    disabledHome: state => dispatch(disabledHome(state))
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);