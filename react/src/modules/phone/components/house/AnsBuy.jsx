import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp} from "../../actions/apps.actions";
import Success from "./SuccessBuy";
import Error from "./Error";
import HouseHeader from "./HouseHeader";

class AnsBuy extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.getAnsPage = this.getAnsPage.bind(this);
    }

    getAnsPage(status) {
        const { addApp, closeApp } = this.props;

        if (status == 0) {
            closeApp();
            addApp(<Error status='Ошибка'/>);
        }
        else if (status == 1) {
            closeApp();
            addApp(<Success type={this.props.type}/>);
        }
        else if (status == 2) {
            closeApp();
            addApp(<Error status='Недостаточно средств'/> );
        }
    }

    render() {
        const { info, house } = this.props;

        return (
            <div className='back_page-phone-react'>
                <HouseHeader />
                {
                    info.houses[0].buyStatus != null
                    ? <Fragment>{this.getAnsPage(house.buyStatus)}</Fragment>
                    :  <div className="loader01" style={{ margin: '10% 5%' }}/>
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    house: state.info.houses[0]
});

const mapDispatchToProps = dispatch => ({
    addApp: app => dispatch(addApp(app)),
    closeApp: () => dispatch(closeApp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnsBuy);