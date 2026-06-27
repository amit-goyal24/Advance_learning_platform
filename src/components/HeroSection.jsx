import React from 'react';
import { Link } from 'react-router-dom';
import './LandingSections.css';

const HeroSection = () => {
    return (
        <section className="hero-section section">
            <div className="container hero-container">
                <h1 className="hero-title">
                    Learn Without <br />
                    <span className="text-brand italic">Limits</span>
                </h1>
                <p className="hero-subtitle">
                    Master new skills with expert-crafted courses, interactive quizzes, <br className="hidden-mobile" />
                    and real-time progress tracking — all in one powerful platform.
                </p>
                <div className="hero-actions">
                    <Link to="/register" className="btn btn-primary btn-lg">Start Learning Free</Link>
                    <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
