import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import '../styles/players.css';

import PlayerRow from './PlayerRow';

class PlayersList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            type: 'name',
            sortedBy: 'id',
            search: ''
        }

        this.getPlayers = this.getPlayers.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
    }

    getLoader() {
        return (
            <div className='block_loader-house-react'>
                <div className='loader-house'></div>
            </div>
        )
    }

    handleChangeInput(e) {
        this.setState({ search: e.target.value.toString().toLowerCase() });
    }

    handleChangeSelect(e) {
        this.setState({ type: e.target.value });
    }

    getPlayers(players) {
        const { search, type, sortedBy } = this.state;

        return (
            players
                .sort((a, b) => {
                    if (sortedBy == 'id') {
                        return a[sortedBy] - b[sortedBy];
                    } else {
                        if (a[sortedBy].toLowerCase() < b[sortedBy].toLowerCase()) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                })
                .filter(player => player[type]
                    .toString()
                    .toLowerCase()
                    .split(' ')
                    .some(word => word.startsWith(search)))
                    //.startsWith(search.toString().toLowerCase()))
                .map((player, index) => <PlayerRow player={player}/>)
        )
    }

    render() {
        const { players } = this.props;
        const { search, type, sortedBy } = this.state;

        return (
            <Fragment>
                <div id="playersList">
                    <div class="players_list-head">
                        <table rules="all">
                            <colgroup>
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '40%' }} />
                                <col style={{ width: '40%' }} />
                                <col style={{ width: '10%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th onClick={() => { this.setState({ sortedBy: 'id' }) }}>id { sortedBy == 'id' && '▼' }</th>
                                    <th onClick={() => { this.setState({ sortedBy: 'name' }) }}>Имя { sortedBy == 'name' && '▼' }</th>
                                    <th onClick={() => { this.setState({ sortedBy: 'faction' }) }}>Организация { sortedBy == 'faction' && '▼' }</th>
                                    <th>ping</th>
                                </tr>
                            </thead>
                        </table>
                        <div class="players_list-navigate_panel">
                            <span>Поиск:</span>
                            <input onChange={this.handleChangeInput} value={search} maxLength={25}/>
                            <div 
                                onClick={() => this.setState({ type: 'id' })}
                                style={{ 
                                    borderColor: type === 'id' && 'yellow',
                                    background: type === 'id' && 'black'
                                }}
                            >
                                id
                            </div>
                            <div 
                                onClick={() => this.setState({ type: 'name' })}
                                style={{ 
                                    borderColor: type === 'name' && 'yellow',
                                    background: type === 'name' && 'black'
                                }}
                            >
                                Имя
                            </div>
                            <div 
                                onClick={() => this.setState({ type: 'faction' })}
                                style={{ 
                                    borderColor: type === 'faction' && 'yellow',
                                    background: type === 'faction' && 'black'
                                }}
                            >
                                Организация
                            </div>
                        </div>
                    </div>
                    <div class="players_list-body">
                        <table rules="all">
                            <colgroup>
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '40%' }} />
                                <col style={{ width: '40%' }} />
                                <col style={{ width: '10%' }} />
                            </colgroup>
                            <Fragment>
                                { players.length !== 0 ? this.getPlayers(players) : this.getLoader() }
                            </Fragment>
                        </table>
                    </div>
                </div>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    players: state.players
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(PlayersList);