import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {Header} from "./utils";
import {arrow} from "./icons";
import {closeApp} from '../../actions/apps.actions';

const HouseHeader = ({ info, business, title, mainInfo, closeAppAction }) => {
    return (
        <Header>
            <img src={arrow} onClick={!mainInfo.disabled && closeAppAction} />
            <b>{info ? info.name : business.name}</b>
            <span>{title ? title : business.area}</span>
        </Header>
    );
}

const mapStateToProps = state => ({
    info: state.info.biz[0],
    mainInfo: state.info
});

const mapDispatchToProps = dispatch => ({
    closeAppAction: () => dispatch(closeApp())
});

export default connect(mapStateToProps, mapDispatchToProps)(HouseHeader);