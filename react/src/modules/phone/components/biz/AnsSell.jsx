import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp, setApps} from "../../actions/apps.actions";
import Success from "./Success";
import MainDisplay from '../MainDisplay';
import Error from "./Error";
import styles from './Biz.module.scss';
import Loader from "../Loader";

class AnsSell extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getAnsPage = this.getAnsPage.bind(this);
    }

    getAnsPage(status) {
        const { addApp, closeApp, setApps, business } = this.props;

        if (status === 0) {
            closeApp();
            closeApp();
            addApp(<Error status='Ошибка'/>);
        }
        else if (status === 1) {
            let name = business.name;
            let area = business.area;
            setApps([
                <MainDisplay />,
                <Success name={name} area={area}  status='Бизнес продан'/>
            ]);
        }
        else if (status === 2) {
            closeApp();
            closeApp();
            addApp(<Error status='Покупатель не принял условия сделки'/>);
        }

        else if (status === 3) {
            closeApp();
            closeApp();
            addApp(<Error status='Вы находитесь не рядом с бизнесом'/>);
        }

        else if (status === 4) {
            closeApp();
            closeApp();
            addApp(<Error status='Нельзя продать бизнес дешевле гос.стоимости'/>);
        }

        else if (status === 5) {
            closeApp();
            closeApp();
            addApp(<Error status='У покупателя недостаточно денег'/>);
        }

        else if (status === 6) {
            closeApp();
            closeApp();
            addApp(<Error status='У покупателя уже есть бизнес'/>);
        }
    }

    render() {
        const { info } = this.props;

        return (
            <Fragment>
                {
                    info.biz[0].sellStatus != null
                        ? <Fragment>{this.getAnsPage(info.biz[0].sellStatus)}</Fragment>
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
    addApp: app => dispatch(addApp(app)),
    setApps: apps => dispatch(setApps(apps)),
    closeApp: () => dispatch(closeApp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnsSell);