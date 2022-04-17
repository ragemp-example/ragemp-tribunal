import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Message from './Message';
import MainPanel from './MainPanel';
import Loader from './Loader';
import Menu from './Menu';
import Confirm from './Confirm';

// import '../../house/styles/house.css';
// import '../styles/biz.css';
import success from '../../../imgs/house/success.svg';
import error from '../../../imgs/house/error.svg';
import finance from '../../../imgs/biz/finance.svg';
import open from '../../../imgs/biz/open.svg';
import start from '../../../imgs/biz/start.svg';
import robbery from '../../../imgs/house/robbery.svg';
import { closeBizPanel, loadBizInfo, loadingBizPanel, messageBiz, menuBiz, blurBizPanel, answerBuyBiz, showBizPanel } from '../actions/action.biz';

const bizInfo = {
    id: 3,
    name: 'Ponsonbys',
    type: 'Магазин одежды',
    cashBox: 732101,
    area: 'Палето Бэй',
    rent: 60,
    price: 112000,
    actions: ['start', 'finance']
};


class BizPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirm: false,
        }

        this.closePanel = this.closePanel.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.closeMessage = this.closeMessage.bind(this);
        this.showActionsMenu = this.showActionsMenu.bind(this);
        this.showConfirm = this.showConfirm.bind(this);
        this.buyBiz = this.buyBiz.bind(this);
        this.robberyBiz = this.robberyBiz.bind(this);
    }

    componentDidMount() {
        const { loadInfo, loadingBiz, showBiz } = this.props;

        // showBiz();
        // loadingBiz(true);
        // setTimeout(() => loadInfo(bizInfo), 1000);
    }

    getButtonsForActionsMenu(bizActions) {
        if (!bizActions) return [];
        return bizActions.map(action => this.getBizActionInfo(action))
    }

    getBizActionInfo(bizAction) {
        switch (bizAction) {
            case 'open':
                return { text: 'Открыть/закрыть', image: open, action: () => { this.actionBiz(bizAction) }};
            case 'start':
                return { text: 'Запустить/остановить', image: start, action: () => { this.actionBiz(bizAction) }};
            case 'finance':
                return { text: 'Финансы', image: finance, action: () => { this.actionBiz(bizAction) } };
            case 'robbery':
                return { text: 'Ограбить', image: robbery, action: this.robberyBiz };
            default:
                return null;
        }
    }

    closePanel() {
        const { closeBiz, biz } = this.props;

        if (biz.loading) return;
        if (biz.menu && biz.menu.loading) return;

        closeBiz();
        // eslint-disable-next-line no-undef
        mp.trigger('biz.menu.close');
    }

    closeMenu() {
        const { menuBiz } = this.props;

        menuBiz(false);
    }

    closeMessage() {
        const { messageBiz } = this.props;

        messageBiz();
    }

    showConfirm(state) {
        const { biz } = this.props;

        if ((biz.loading || biz.menu || this.state.confirm || biz.message) && state) return;

        this.setState({ confirm: state });
    }

    actionBiz(actionName) {
        // eslint-disable-next-line no-undef
        if (actionName === 'open') mp.trigger(`callRemote`, `clubs.control.open`);

        // eslint-disable-next-line no-undef
        if (actionName === 'start') mp.trigger(`callRemote`, `oilrigs.work.start`);
        // eslint-disable-next-line no-undef
        else mp.trigger('biz.actions', actionName);

        this.closePanel();
    }

    buyBiz() {
        const { answerBuy, loadingBiz } = this.props;

        this.showConfirm(false);
        loadingBiz(true);
        // setTimeout(() => { answerBuy(1, 'Mike') }, 1000);

        // eslint-disable-next-line no-undef
        mp.trigger('biz.buy');
    }

    showActionsMenu() {
        const { menuBiz, messageBiz, biz } = this.props;

        if (biz.loading || biz.menu || this.state.confirm || biz.message) return;
        if (biz.actions.length !== 0) return menuBiz(true);

        messageBiz('Список действий пуст', 'error');
    }

    robberyBiz() {
        const { biz, closeBiz } = this.props;

        // eslint-disable-next-line no-undef
        mp.trigger('biz.action', 'robbery', biz.id);
        // eslint-disable-next-line no-undef
        mp.trigger('biz.menu.close');

        closeBiz();
    }

    getImageMessage(type) {
        if (type === 'error') return error;
        if (type === 'success') return success;
    }

    render() {
        const { confirm } = this.state;
        const { biz } = this.props;

        return (
            <Fragment>
                <MainPanel
                    show={biz.show}
                    load={biz.load}
                    blur={biz.loading || (biz.menu && biz.menu.show) || confirm || biz.message}
                    info={biz}
                    actions={{
                        buy: () => { this.showConfirm(true) },
                        showActions: this.showActionsMenu,
                        close: this.closePanel
                    }}
                />
                <Message
                    show={biz.message}
                    text={biz.message && biz.message.text}
                    type={biz.message && this.getImageMessage(biz.message.type)}
                    action={this.closeMessage}
                />
                <Menu
                    show={(biz.menu) ? biz.menu.show : false}
                    loading={biz.menu ? biz.menu.loading: false}
                    buttons={ this.getButtonsForActionsMenu(biz.actions) }
                    action={this.closeMenu}
                />
                <Confirm
                    show={confirm && biz.show}
                    name={biz.name}
                    actions={{
                        yes: this.buyBiz,
                        no: () => { this.showConfirm(false) }
                    }}
                />
                <Loader show={biz.loading && biz.show} />
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    biz: state.biz
});

const mapDispatchToProps = dispatch => ({
    showBiz: () => dispatch(showBizPanel()),
    closeBiz: () => dispatch(closeBizPanel()),
    loadInfo: info => dispatch(loadBizInfo(info)),
    loadingBiz: state => dispatch(loadingBizPanel(state)),
    blurBiz: state => dispatch(blurBizPanel(state)),
    messageBiz: (text, type) => dispatch(messageBiz(text, type)),
    menuBiz: state => dispatch(menuBiz(state)),
    answerBuy: (answer, owner) => dispatch(answerBuyBiz(answer, owner)),
})

export default connect(mapStateToProps, mapDispatchToProps)(BizPanel);
