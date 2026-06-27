import React, { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalEnrollments: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5085/api/admin/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="admin-loading">Loading Dashboard...</div>;

    return (
        <div className="admin-dashboard container section">
            <div className="admin-header">
                <h2>Admin Overview</h2>
                <p className="text-muted">Monitor learning platform statistics</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue)' }}>
                        <Users size={32} />
                    </div>
                    <div className="stat-details">
                        <h3 className="stat-value">{stats.totalStudents}</h3>
                        <p className="stat-label">Total Students</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                        <BookOpen size={32} />
                    </div>
                    <div className="stat-details">
                        <h3 className="stat-value">{stats.totalCourses}</h3>
                        <p className="stat-label">Active Courses</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <GraduationCap size={32} />
                    </div>
                    <div className="stat-details">
                        <h3 className="stat-value">{stats.totalEnrollments}</h3>
                        <p className="stat-label">Total Enrollments</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
