import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp, disabledHome} from "../../actions/apps.actions";
import {setSellInfoBusiness, setSellStatusBusiness} from "../../actions/biz.actions";
import AnsSell from "./AnsSell";
import Error from "./Error";
import Loader from "../Loader";
import {Button, Container} from "./utils";
import styles from './Biz.module.scss';
import {agreement} from "./icons";
import Header from "./Header";

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
        mp.trigger('biz.sell.stop');

        disableHome(false);
        setSellInfo(null);
        closeApp();
    }

    confirmSell() {
        const { setSellStatus, setSell, disableHome } = this.props;

        disableHome(true);
        this.setState({ isConfirm: true });

        // eslint-disable-next-line no-undef
        mp.trigger('biz.sell');

        // setTimeout(() => {
        //     setSellStatus(1);
        // }, 3000);

        this.props.addApp(<AnsSell />);
    }

    getAsk(name, sum) {
        return (
            <div>
                <h1 className={styles.title}>Подтверждение</h1>
                <p style={{ marginTop: '10%' }}>
                    Вы действительно хотите продать бизнес <b>{ name }</b> за <span style={{ color: '#1BBB5B', fontWeight: 'bold' }}> ${ String(sum).toLocaleString('ru-RU') }</span>?
                </p>
                <div className={styles.buttonsBlock}>
                    <Button onClick={this.confirmSell}>Да</Button>
                    <Button cancel onClick={this.cancel}>Нет</Button>
                </div>
            </div>
        )
    }

    getMessage(name, sum) {
        return (
            <div>
                <h1 className={styles.title}>Продажа на руки</h1>
                <p style={{ color: '#45C34A' }}>Предложение отправлено</p>
                <p>Покупатель: {name}</p>
                <p>Сумма <span style={{ color: '#45C34A' }}>${ String(sum).toLocaleString('ru-RU') }</span></p>
                <div className={styles.sellImage}>
                    <img src={agreement} />
                </div>
                <div className={styles.buttonsBlock}>
                    <Button onClick={this.cancel} cancel>
                        Отменить
                    </Button>
                </div>
            </div>
        )
    }

    getContent() {
        const { info, addApp, closeApp, business } = this.props;
        const {isConfirm} = this.state;

        if (info.biz[0].ansSell.nick != null) {
            return (
                <Fragment>
                    <div className={styles.back}>
                        <Header business={business}/>
                        <Container>
                            {
                                isConfirm
                                    ? this.getMessage(info.biz[0].ansSell.nick, info.biz[0].ansSell.price)
                                    : this.getAsk(info.biz[0].ansSell.nick, info.biz[0].ansSell.price)
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
        const { info, business } = this.props;

        return (
            <Fragment>
                {
                    info.biz[0].ansSell && Object.keys(info.biz[0].ansSell).length > 0
                        ? this.getContent()
                        : <Loader />
                }
            </Fragment>
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
    setSellStatus: status => dispatch(setSellStatusBusiness(status)),
    disableHome: state => dispatch(disabledHome(state)),
    setSellInfo: info => dispatch(setSellInfoBusiness(info)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmSell);