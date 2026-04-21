import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, BookOpen, Eye, EyeOff } from 'lucide-react';
import toast from '../utils/toastHelper';
import './AuthPages.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'Student'
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const response = await fetch('http://localhost:5085/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Account created successfully 🚀');
                navigate('/login');
            } else {
                setErrorMsg(data.message || 'Registration failed');
                toast.error('Something went wrong. Please try again later.');
            }
        } catch (err) {
            setErrorMsg('Failed to connect to the server.');
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            {/* Left Column (Brand) */}
            <div className="auth-brand-side">
                <div className="auth-brand-content">
                    <Link to="/" className="auth-logo">
                        <div className="logo-icon-container bg-transparent" style={{ border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src="/logo.png" alt="LearnHub Logo" style={{ height: '36px', width: 'auto' }} />
                        </div>
                    </Link>
                    <h1 className="auth-title">Start Learning Today</h1>
                    <p className="auth-subtitle">
                        Join thousands of learners mastering new skills<br />
                        every day on LearnHub.
                    </p>
                </div>
                {/* Decorative Circles */}
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
            </div>

            {/* Right Column (Form) */}
            <div className="auth-form-side">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2 className="auth-heading">Create Account</h2>
                        <p className="auth-switch">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {errorMsg && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-input" placeholder="Your full name" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="you@example.com" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-input" 
                                    placeholder="Min. 6 characters" 
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 0
                                    }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Register As</label>
                            <div className="select-wrapper">
                                <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                                    <option value="Student">Student</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full btn-lg mt-4" disabled={loading}>
                            {loading ? 'Creating...' : <>Create Account <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <Link to="/" className="back-link">
                            <ArrowLeft size={16} /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
