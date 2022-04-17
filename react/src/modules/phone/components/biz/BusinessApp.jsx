import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import Header from "./Header";
import styles from './Biz.module.scss';
import {addApp, closeApp, setColor} from "../../actions/apps.actions";
import {type, cashbox, days, stock, rent, stat, manage} from './icons';
import {Container} from "./utils";
import Statistics from "./Statistics";
import BusinessManager from "./BusinessManager";

class BusinessApp extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.props.setColor('white')
    }

    render() {
        const { business, closeApp, addApp } = this.props;

        return (
            <div className={styles.back}>
                <Header title={business.area}/>
                <Container>
                    <div className={styles.listButtons}>
                        <div className={styles.infoButton}>
                            <img src={type} />
                            <div className={styles.info}>
                                <p>Тип</p>
                                <span>{business.type}</span>
                            </div>
                        </div>
                        <div className={styles.infoButton}>
                            <img src={cashbox} />
                            <div className={styles.info}>
                                <p>В кассе</p>
                                <span style={{ color: '#58FF55' }}>${String(business.cashBox).toLocaleString('ru-RU')}</span>
                            </div>
                        </div>
                        <div className={styles.infoButton}>
                            <img src={stock} />
                            <div className={styles.info}>
                                <p>Склад</p>
                                <span>{business.resources}/{business.resourcesMax}</span>
                            </div>
                        </div>
                        <div className={styles.infoButton}>
                            <img src={rent} />
                            <div className={styles.info}>
                                <p>Аренда</p>
                                <span>${business.rent}/в сут.</span>
                            </div>
                        </div>
                        <div className={styles.infoButton}>
                            <img src={days} />
                            <div className={styles.info}>
                                <p>Оплачен</p>
                                <span>{business.days}/30 дней</span>
                            </div>
                        </div>
                    </div>
                </Container>
                <div className={styles.menuButtons}>
                    <div onClick={() => addApp(<Statistics />)}>
                        <img src={stat} />
                        <span>Статистика</span>
                    </div>
                    <div onClick={() => addApp(<BusinessManager />)}>
                        <img src={manage} />
                        <span>Управление</span>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    business: state.info.biz[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    addApp: app => dispatch(addApp(app)),
    setColor: color => dispatch(setColor(color))
});

export default connect(mapStateToProps, mapDispatchToProps)(BusinessApp);