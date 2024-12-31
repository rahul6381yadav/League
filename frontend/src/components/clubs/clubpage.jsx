import React from 'react';
import Events from './Events';

const ClubPage = () => {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-black text-center">Club Management</h1>
            <div className="space-y-6">
                <Events />
            </div>
        </div>
    );
};

export default ClubPage;
