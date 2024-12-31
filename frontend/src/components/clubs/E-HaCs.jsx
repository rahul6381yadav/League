// src/components/ClubPage.js
import React from 'react';
import Events from './Events';

const EHaCs=() => {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-black text-center">E-HaCs</h1>
            <div className="space-y-6">
                <Events />
            </div>
        </div>
    );
};

export default EHaCs;
