import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {setApp, disabledHome} from "../../actions/apps.actions";
import {sellHouse, setSellInfoHouse, setSellStatusHouse} from "../../actions/house.actions";
import MainDisplay from "../MainDisplay";
import HouseHeader from "./HouseHeader";
import styles from './HouseApp.module.scss';
import {Button, Container} from "./utils";
import {success, house} from './icons';

class Success extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.back = this.back.bind(this);
    }

    componentDidMount() {
        const { house, sellHouse, disableHome } = this.props;

        disableHome(false);
        sellHouse(house.name);
    }

    back() {
        const { house, setApp } = this.props;

        setApp(<MainDisplay />);
    }

    render() {

        const { name, area } = this.props;

        return (
            <Fragment>
                <div className={styles.back}>
                    <HouseHeader house={{ name, area }}/>
                    <Container>
                        <div className={styles.answer}>
                            <img src={success} />
                            <h1>Дом продан</h1>
                        </div>
                        <div className={styles.buttonsBlock}>
                            <Button
                                onClick={this.back}
                                primary
                                style={{ marginTop: '20%' }}
                            >
                                <span>Главное меню</span>
                                <img src={house} />
                            </Button>
                        </div>
                    </Container>
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    ...state,
});

const mapDispatchToProps = dispatch => ({
    setApp: app => dispatch(setApp(app)),
    disableHome: state => dispatch(disabledHome(state)),
    setSellStatus: status => dispatch(setSellStatusHouse(status)),
    setSellInfo: info => dispatch(setSellInfoHouse(info)),
    sellHouse: name => dispatch(sellHouse(name))
});

export default connect(mapStateToProps, mapDispatchToProps)(Success);