import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp, setApps} from "../../actions/apps.actions";
import Success from "./Success";
import MainDisplay from '../MainDisplay';
import Error from "./Error";

class AnsSell extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getAnsPage = this.getAnsPage.bind(this);
    }

    getAnsPage(status) {
        const { addApp, closeApp, setApps, house } = this.props;

        if (status == 0) {
            closeApp();
            closeApp();
            addApp(<Error status='Ошибка'/>);
        }
        else if (status == 1) {
            let name = house.name;
            let area = house.area;
            setApps([
                <MainDisplay />,
                <Success name={name} area={area} />
            ]);
        }
        else if (status == 2) {
            closeApp();
            closeApp();
            addApp(<Error status='Покупатель не принял условия сделки'/>);
        }

        else if (status == 3) {
            closeApp();
            closeApp();
            addApp(<Error status='Вы находитесь не рядом с домом'/>);
        }

        else if (status == 4) {
            closeApp();
            closeApp();
            addApp(<Error status='Нельзя продать дом дешевле гос. стоимости'/>);
        }

        else if (status == 5) {
            closeApp();
            closeApp();
            addApp(<Error status='Вы не можете продать дом с машинами в гараже'/>);
        }

        else if (status === 6) {
            closeApp();
            closeApp();
            addApp(<Error status='У покупателя недостаточно денег'/>);
        }

        else if (status === 7) {
            closeApp();
            closeApp();
            addApp(<Error status='У покупателя уже есть дом'/>);
        }
    }

    render() {
        const { info, house } = this.props;

        return (
            <Fragment>
                {
                    info.houses[0].sellStatus != null
                    && <Fragment>{this.getAnsPage(info.houses[0].sellStatus)}</Fragment>
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
    addApp: app => dispatch(addApp(app)),
    setApps: apps => dispatch(setApps(apps)),
    closeApp: () => dispatch(closeApp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnsSell);