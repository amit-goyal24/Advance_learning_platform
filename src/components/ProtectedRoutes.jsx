import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const RequireAuth = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export const RequireRole = ({ allowedRole }) => {
    const role = localStorage.getItem('role');

    if (role !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
