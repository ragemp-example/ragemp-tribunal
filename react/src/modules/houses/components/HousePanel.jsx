import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Message from './Message';
import MainPanel from './MainPanel';
import Loader from './Loader';
import Menu from './Menu';
import Confirm from './Confirm';

import '../styles/house.css';
import success from '../../../imgs/house/success.svg';
import error from '../../../imgs/house/error.svg';
import street from '../../../imgs/house/street.svg';
import home from '../../../imgs/house/home.svg';
import garage from '../../../imgs/house/garage.svg';
import robbery from '../../../imgs/house/robbery.svg';
import { closeHousePanel, loadHouseInfo, loadingHousePanel, messageHouse, menuHouse, blurHousePanel, answerBuyHouse, loadingEnterHouse, answerEnterHouse, showHousePanel } from '../actions/action.house';

const houseInfo = {
    name: 228,
    area: 'Санта-Моника',
    class: 'Люкс',
    numRooms: 4,
    garage: true,
    carPlaces: 2,
    price: 4508900,
    rent: 350,
    // owner: 'Mike'
};


class HousePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirm: false,
            menuType: 'enter'
        }

        this.closePanel = this.closePanel.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.closeMessage = this.closeMessage.bind(this);
        this.showEnterMenu = this.showEnterMenu.bind(this);
        this.showActionsMenu = this.showActionsMenu.bind(this);
        this.showConfirm = this.showConfirm.bind(this);
        this.getButtonsForEnterMenu = this.getButtonsForEnterMenu.bind(this);
        this.buyHouse = this.buyHouse.bind(this);
        this.lookHouse = this.lookHouse.bind(this);
        this.enterTo = this.enterTo.bind(this);
        this.robberyHouse = this.robberyHouse.bind(this);
    }

    componentDidMount() {
        const { loadInfo, loadingHouse, showHouse } = this.props;

        // showHouse();
        // loadingHouse(true);
        // setTimeout(() => loadInfo(houseInfo), 1000);
    }

    getEnterButtons() {
        return {
            home: { text: "Дом", image: home, action: () => this.enterTo(1) },
            street: { text: "Улица", image: street, action: () =>this.enterTo(0) },
            garage: { text: "Гараж", image: garage, action: () => this.enterTo(2) },
        }
    }

    getButtonsForEnterMenu() {
        const { house } = this.props;
        const enterButtons = this.getEnterButtons();

        if (house.place === 0 || house.place == null) 
            return [
                enterButtons.home,
                enterButtons.garage
            ];
        else if (house.place === 1) 
            return [
                enterButtons.street,
                enterButtons.garage
            ];
        else if (house.place === 2) 
            return [
                enterButtons.home,
                enterButtons.street
            ]
    }

    getButtonsForActionsMenu() {
        return [
            { text: "Ограбить", image: robbery, action: this.robberyHouse }
        ]
    }

    closePanel() {
        const { closeHouse, house } = this.props;

        if (house.loading) return;
        if (house.menu && house.menu.loading) return;

        closeHouse();
        // eslint-disable-next-line no-undef
        mp.trigger('house.menu.close');
    }

    closeMenu() {
        const { menuHouse, house } = this.props;

        if (!house.show) {
            // eslint-disable-next-line no-undef
            mp.trigger('house.menu.enter.close');
        }

        menuHouse(false);
    }

    closeMessage() {
        const { messageHouse } = this.props;

        messageHouse();
    }

    showEnterMenu() {
        const { menuHouse, house } = this.props;

        if (house.loading || house.menu || this.state.confirm || house.message) return;

        this.setState({ menuType: 'enter' });
        menuHouse(true);
    }

    showConfirm(state) {
        const { house } = this.props;

        if ((house.loading || house.menu || this.state.confirm || house.message) && state) return;

        this.setState({ confirm: state });
    }

    lookHouse() {
        const { house } = this.props;

        if (house.loading || house.menu || this.state.confirm || house.message) return;
        // eslint-disable-next-line no-undef
        mp.trigger('house.enter', 1);
    }

    enterTo(place) {
        const { loadingHouse, loadingEnter, answerEnter, house } = this.props;

        house.menu ? loadingEnter(true) : loadingHouse(true);
        // setTimeout(() => {answerEnter(1)}, 1000);
        
        // eslint-disable-next-line no-undef
        mp.trigger('house.enter', place);
    }

    robberyHouse() {
        const { house, closeHouse } = this.props;

        // eslint-disable-next-line no-undef
        mp.trigger('house.action', 'robbery', house.name);
        // eslint-disable-next-line no-undef
        mp.trigger('house.menu.close');

        closeHouse();
    }

    buyHouse() {
        const { answerBuy, loadingHouse } = this.props;

        this.showConfirm(false);
        loadingHouse(true);
        // setTimeout(() => { answerBuy(1, 'Mike') }, 1000);

        // eslint-disable-next-line no-undef
        mp.trigger('house.buy');
    }

    showActionsMenu() {
        const { menuHouse, house } = this.props;

        if (house.loading || house.menu || this.state.confirm || house.message) return;

        this.setState({ menuType: 'actions' });
        menuHouse(true)
    }

    getImageMessage(type) {
        if (type === 'error') return error;
        if (type === 'success') return success;
    }

    render() {
        const { confirm, menuType } = this.state;
        const { house } = this.props;

        return (
            <Fragment>
                <MainPanel 
                    show={house.show}
                    load={house.load} 
                    blur={house.loading || (house.menu && house.menu.show) || confirm || house.message} 
                    info={house} 
                    actions={{
                        showEnter: this.showEnterMenu,
                        enter: () => { this.enterTo(1) },
                        buy: () => { this.showConfirm(true) },
                        look: this.lookHouse,
                        showActions: this.showActionsMenu,
                        close: this.closePanel
                    }}
                />
                <Message 
                    show={house.message} 
                    text={house.message && house.message.text} 
                    type={house.message && this.getImageMessage(house.message.type)}
                    action={this.closeMessage}
                />
                <Menu 
                    show={(house.menu) ? house.menu.show : false}
                    loading={house.menu ? house.menu.loading: false}  
                    buttons={
                        menuType === 'enter' 
                        ? this.getButtonsForEnterMenu() 
                        : this.getButtonsForActionsMenu()
                    }
                    action={this.closeMenu}
                />
                <Confirm 
                    show={confirm && house.show}
                    name={house.name}
                    actions={{
                        yes: this.buyHouse,
                        no: () => { this.showConfirm(false) }
                    }} 
                />
                <Loader show={house.loading && house.show} /> 
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    house: state.house
});

const mapDispatchToProps = dispatch => ({
    showHouse: () => dispatch(showHousePanel()),
    closeHouse: () => dispatch(closeHousePanel()),
    loadInfo: info => dispatch(loadHouseInfo(info)),
    loadingHouse: state => dispatch(loadingHousePanel(state)),
    blurHouse: state => dispatch(blurHousePanel(state)),
    messageHouse: (text, type) => dispatch(messageHouse(text, type)),
    menuHouse: state => dispatch(menuHouse(state)),
    answerBuy: (answer, owner) => dispatch(answerBuyHouse(answer, owner)),
    loadingEnter: state => dispatch(loadingEnterHouse(state)),
    answerEnter: answer => dispatch(answerEnterHouse(answer))
})

export default connect(mapStateToProps, mapDispatchToProps)(HousePanel);