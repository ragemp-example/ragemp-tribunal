import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import styles from './BankApp.module.scss';
import Header from "./Header";
import {Container} from "./utils";
import {closeApp, disabledHome, setColor} from "../../actions/apps.actions";
import {setAnswerBankApp, setAskAnswerBank} from "../../actions/bankApp.actions";


const Error = ({ setColorAction, setAskAnswerAction, setAnswerAction, text, closeAppAction, disabledHome }) => {
    useEffect(() => {
        setColorAction('white');

        return () => {
            setColorAction('black');
            setAskAnswerAction(null, true);
            setAnswerAction(null);
            disabledHome(false);
            closeAppAction();
        }
    }, []);

    return (
        <div className={styles.back} style={{ background: 'linear-gradient(90deg, #AB2F2F 0%, #E07263 100%)' }}>
            <Header color='white'/>
            <Container>
                <h1 className={styles.title} style={{ color: 'white' }}>Ошибка!</h1>
                <p style={{ color: 'white' }}>
                    { text }
                </p>
            </Container>
        </div>
    );
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
    setColorAction: color => dispatch(setColor(color)),
    setAskAnswerAction: (answer, clear) => dispatch(setAskAnswerBank(answer, clear)),
    setAnswerAction: answer => dispatch(setAnswerBankApp(answer)),
    closeAppAction: () => dispatch(closeApp()),
    disabledHome: state => dispatch(disabledHome(state))
});

export default connect(mapStateToProps, mapDispatchToProps)(Error);