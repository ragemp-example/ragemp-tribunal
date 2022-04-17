import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false, info: null
        }
    }

    componentDidCatch(error, info) {
        this.setState({ hasError: true, info: info });
        
        // eslint-disable-next-line no-undef
        mp.trigger('logger.debug', error.message.toString(), 'react');
    }

    render() {
        if (this.state.hasError) {
            return <h1>Error</h1>
        }

        return this.props.children;
    }
} 

export default ErrorBoundary;