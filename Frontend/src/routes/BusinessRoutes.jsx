import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Business/Dashboard';
import Onboarding from '@/pages/Business/Onboarding';
import StoreProfile from '@/pages/Business/StoreProfile';

import ListingList from '@/pages/Business/Listings/ListingList';
import CreateListing from '@/pages/Business/Listings/CreateListing';

const BusinessRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="profile" element={<StoreProfile />} />
            <Route path="listings" element={<ListingList />} />
            <Route path="listings/create" element={<CreateListing />} />
        </Routes>
    );
};

export default BusinessRoutes;
