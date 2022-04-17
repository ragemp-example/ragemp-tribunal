import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp, setApp} from "../../actions/apps.actions";
import Header from "./Header";
import CreateOrder from "./CreateOrder";
import OrderCancel from "./OrderCancel";
import styles from './Biz.module.scss';
import {Container} from "./utils";
import {info, truck} from "./icons";

class StockManager extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { business, closeApp, addApp } = this.props;

        return (
            <div className={styles.back}>
                <Header business={business}/>
                <Container>
                    <h1 className={styles.title}>Управление складом</h1>

                    <div className={styles.stockInfo}>
                        <p>Состояние: <span>{ business.resources }/{ business.resourcesMax }</span></p>
                        <p>Активный заказ:
                            {
                                !business.order
                                    ? <span style={{ color: '#C34545' }}> нет</span>
                                    : <span style={{ color: '#45C34A' }}>{` ${business.order.productsCount} на $${business.order.productsPrice}`}</span>
                            }
                        </p>

                        {
                            !business.order &&
                            <div className={styles.orderButton} onClick={() => addApp(<CreateOrder />)}>
                                <img src={truck} />
                                <span>Сделать заказ</span>
                            </div>
                        }
                        {
                            business.order && !business.order.isTake &&
                            <div
                                className={styles.orderButton}
                                style={{ backgroundColor: '#3F1212' }}
                                onClick={() => addApp(<OrderCancel />)}
                            >
                                <img src={truck} style={{ transform: 'scale(-1, 1)' }} />
                                <span>Отменить заказ</span>
                            </div>
                        }
                    </div>
                </Container>
                <div className={styles.menuButtons}>
                    <div onClick={() => {
                        closeApp();
                        closeApp();
                    }}>
                        <img src={info} />
                        <span>Информация</span>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    business: state.info.biz[0],
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    addApp: app => dispatch(addApp(app)),
    setApp: app => dispatch(setApp(app)),
    closeApp: () => dispatch(closeApp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StockManager);