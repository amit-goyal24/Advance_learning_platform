import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, BookOpen } from 'lucide-react';
import toast from '../utils/toastHelper';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        toast.success('Logout successful 👋');
        navigate('/login');
    };

    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [isDark]);

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <div className="logo-icon-container" style={{ padding: '4px', background: 'transparent', border: 'none' }}>
                        <img src="/logo.png" alt="LearnHub Logo" className="logo-image" style={{ height: '36px', width: 'auto' }} />
                    </div>
                    <span className="logo-text sr-only">LearnHub LMS</span>
                </Link>
                <div className="navbar-links">
                    {!token && <Link to="/" className="nav-link">Home</Link>}

                    {token && role === 'Student' && (
                        <>
                            <Link to="/courses" className="nav-link">Courses</Link>
                            <Link to="/results" className="nav-link">My Results</Link>
                        </>
                    )}

                    {token && role === 'Admin' && (
                        <>
                            <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                            <Link to="/admin/courses" className="nav-link">Manage Courses</Link>
                            <Link to="/admin/quizzes" className="nav-link">Manage Quizzes</Link>
                            <Link to="/admin/results" className="nav-link">All Results</Link>
                            <Link to="/admin/students" className="nav-link">Students</Link>
                        </>
                    )}

                    <div className="theme-toggle">
                        {isDark ? <Moon size={16} className="theme-icon moon" /> : <Moon size={16} className="theme-icon moon" />}
                        <button
                            className={`toggle-switch ${isDark ? 'active' : ''}`}
                            onClick={() => setIsDark(!isDark)}
                            aria-label="Toggle Dark Mode"
                        >
                            <div className="toggle-thumb"></div>
                        </button>
                    </div>
                    {!token ? (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </>
                    ) : (
                        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
