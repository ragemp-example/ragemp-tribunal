import React from 'react';

const Loader = ({ show }) => {
    return (
        show ?
        <div className='block_loader-house-react'>
            <div className='loader-house'></div>
        </div>
        : null
    );
}

export default Loader;