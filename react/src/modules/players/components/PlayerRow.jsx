import React from 'react';

const PlayerRow = ({ player }) => {
    return (
        <tr>
            <th>{ player.id }</th>
            <th>{ player.name }</th>
            <th>{ player.faction ? player.faction : '-' }</th>
            <th>{ player.ping }</th>
        </tr>
    )
}

export default PlayerRow;