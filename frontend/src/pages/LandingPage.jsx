import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import CtaSection from '../components/CtaSection';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <main>
                <HeroSection />
                <FeaturesSection />
            </main>
            <CtaSection />
        </div>
    );
};

export default LandingPage;
