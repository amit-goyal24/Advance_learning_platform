import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './LandingSections.css';

const CtaSection = () => {
    return (
        <section className="cta-section section">
            <div className="container">
                <div className="cta-banner">
                    <h2 className="cta-title">Ready to level up?</h2>
                    <Link to="/register" className="btn btn-primary cta-btn btn-lg bg-white text-brand">
                        Create Free Account <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CtaSection;
