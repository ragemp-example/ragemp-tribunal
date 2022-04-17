import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp, disabledHome} from "../../actions/apps.actions";
import {setSellInfoHouse, setSellStatusHouse} from "../../actions/house.actions";
import AnsSell from "./AnsSell";
import Error from "./Error";
import HouseHeader from "./HouseHeader";
import Loader from "../Loader";
import {Button, Container} from "./utils";
import styles from './HouseApp.module.scss';
import {agreement, cancel} from "./icons";

class ConfirmSell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isConfirm: false
        };

        this.cancel = this.cancel.bind(this);
        this.confirmSell = this.confirmSell.bind(this);
    }

    cancel() {
        const { closeApp, disableHome, setSellInfo } = this.props;

        // eslint-disable-next-line no-undef
        mp.trigger('house.sell.stop');

        disableHome(false);
        setSellInfo(null);
        closeApp();
    }

    confirmSell() {
        const { setSellStatus, setSell, disableHome } = this.props;

        disableHome(true);
        this.setState({ isConfirm: true });

        // eslint-disable-next-line no-undef
        mp.trigger('house.sell');

        // setTimeout(() => {
        //     setSellStatus(1);
        // }, 1000);

        this.props.addApp(<AnsSell />);
    }

    getAsk(name, sum) {
        return (
            <div>
                <h1>Подтверждение</h1>
                <p style={{ textAlign: 'center', marginTop: '20%' }}>
                    Вы действительно хотите продать дом <b>{ name }</b> за <span style={{ color: '#1BBB5B', fontWeight: 'bold' }}> ${ String(sum).toLocaleString('ru-RU') }</span>?
                </p>
                <div className={styles.buttonsBlock}>
                    <Button primary onClick={this.confirmSell}>Да</Button>
                    <Button onClick={this.cancel}>Нет</Button>
                </div>
            </div>
        )
    }

    getMessage(name, sum) {
        return (
            <div>
                <h1>Продажа на руки</h1>
                <div className={styles.sellInfo}>
                    <img src={agreement} />
                    <p>Предложение отправлено</p>
                    <p>Сумма <span style={{ color: '#1BBB5B' }}>${ String(sum).toLocaleString('ru-RU') }</span></p>
                    <p style={{ color: '#858585' }}>Покупатель: {name}</p>
                </div>
                <div className={styles.buttonsBlock}>
                    <Button onClick={this.cancel}>
                        <span>Отменить</span>
                        <img src={cancel} />
                    </Button>
                </div>
            </div>
        )
    }

    getContent() {
        const { info, addApp, closeApp, setSell } = this.props;
        const {isConfirm} = this.state;

        if (info.houses[0].ansSell.nick != null) {
            return (
                <Fragment>
                    <div className={styles.back}>
                        <HouseHeader/>
                        <Container>
                            {
                                isConfirm
                                    ? this.getMessage(info.houses[0].ansSell.nick, info.houses[0].ansSell.price)
                                    : this.getAsk(info.houses[0].ansSell.nick, info.houses[0].ansSell.price)
                            }
                        </Container>
                    </div>
                </Fragment>
            )
        } else {
            closeApp();
            addApp(<Error status='Покупатель с таким ID не найден'/>)
        }
    }

    render() {
        const { info, house } = this.props;

        return (
            <Fragment>
                {
                    info.houses[0].ansSell && Object.keys(info.houses[0].ansSell).length > 0
                        ? this.getContent()
                        : <Loader />
                }
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    house: state.info.houses[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    addApp: app => dispatch(addApp(app)),
    setSellStatus: status => dispatch(setSellStatusHouse(status)),
    disableHome: state => dispatch(disabledHome(state)),
    setSellInfo: info => dispatch(setSellInfoHouse(info)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmSell);