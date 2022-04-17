/* eslint-disable no-undef */
/* eslint-disable default-case */
import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';

import Chat from './modules/chat';
import Phone from "./modules/phone";
import House from './modules/houses';
import Biz from './modules/biz';
import Bank from './modules/bank';
import Players from './modules/players';
import ErrorBoundary from './Error';

class MainContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { forms, info } = this.props;

        return (
            <Fragment>
                <ErrorBoundary><Chat /></ErrorBoundary>
                { info.isLoad && <ErrorBoundary><div><Phone /></div></ErrorBoundary> }
                { forms.house && <ErrorBoundary><House /></ErrorBoundary> }
                { forms.business && <ErrorBoundary><Biz /> </ErrorBoundary>}
                { forms.bank && <ErrorBoundary><Bank /></ErrorBoundary> }
                { forms.players && <ErrorBoundary><Players /> </ErrorBoundary>}
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    forms: state.forms,
    info: state.info
});

export default connect(mapStateToProps, null)(MainContainer);