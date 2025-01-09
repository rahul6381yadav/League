// components/common/Loader.js
import React from 'react';

const Loader = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
        }}>
            <div className='text-black'>Loading...</div>
        </div>
    );
};

export default Loader;
