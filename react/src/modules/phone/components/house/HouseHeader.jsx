import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {Header} from "./utils";

const HouseHeader = ({ info, house }) => {
    return (
        <Header>
            <b>Дом {info ? info.name : house.name}</b>
            <span>{info ? info.area : house.area}</span>
        </Header>
    );
}

const mapStateToProps = state => ({
    info: state.info.houses[0]
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(HouseHeader);