import React, {Fragment} from 'react';

const Loader = ({ color }) => {
    return <div className='loader01' style={{ borderColor: color, borderRightColor: 'transparent' }}/>
};

export default Loader;