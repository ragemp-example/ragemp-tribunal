import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import styles from './BankApp.module.scss';
import Header from "./Header";
import {Container} from "./utils";
import {Biz, House} from "./icons";
import {addApp} from '../../actions/apps.actions';
import Tax from "./Tax";

const Taxes = ({ bankApp, addAppAction }) => {
    return (
        <div className={styles.back}>
            <Header />
            <Container>
                <h1 className={styles.title}>Оплата налогов</h1>
                {
                    (bankApp.houses.length > 0 || bankApp.biz.length > 0)
                    ? <p>Выберите тип налогообложения</p>
                    : <p>У вас нет объектов, подлежащих налогообложению</p>
                }
                <div>
                    {
                        bankApp.houses.length > 0 &&
                        <div className={styles.taxButton} onClick={() => addAppAction(<Tax house={bankApp.houses[0]}/>) }>
                            <House />
                            <span>Налог на дом</span>
                        </div>
                    }
                    {
                        bankApp.biz.length > 0 &&
                        <div className={styles.taxButton} onClick={() => addAppAction(<Tax biz={bankApp.biz[0]}/>) }>
                            <Biz />
                            <span>Налог <br/> на бизнес</span>
                        </div>
                    }
                </div>
            </Container>
        </div>
    );
}

const mapStateToProps = state => ({
    bankApp: state.bankApp
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app))
});

export default connect(mapStateToProps, mapDispatchToProps)(Taxes);