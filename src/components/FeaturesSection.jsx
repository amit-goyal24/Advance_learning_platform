import React from 'react';
import { Target, Zap, BarChart2, Lock, Rocket, Trophy } from 'lucide-react';
import './LandingSections.css';

const featuresData = [
    {
        icon: <Target className="feature-icon text-red" size={20} />,
        title: 'Structured Learning Paths',
        description: 'Follow curated courses designed by expert instructors to master any skill.',
        bgColor: 'bg-red-light'
    },
    {
        icon: <Zap className="feature-icon text-orange" size={20} />,
        title: 'Interactive Quizzes',
        description: 'Test your knowledge with MCQ quizzes and get instant feedback on your progress.',
        bgColor: 'bg-orange-light'
    },
    {
        icon: <BarChart2 className="feature-icon text-blue" size={20} />,
        title: 'Track Your Progress',
        description: "View detailed result history and see how far you've come on your journey.",
        bgColor: 'bg-blue-light'
    },
    {
        icon: <Lock className="feature-icon text-yellow" size={20} />,
        title: 'Role-Based Access',
        description: 'Separate portals for Students and Admins with tailored features for each.',
        bgColor: 'bg-yellow-light'
    },
    {
        icon: <Rocket className="feature-icon text-purple" size={20} />,
        title: 'Instant Enrollment',
        description: 'One-click course enrollment so you can start learning without any friction.',
        bgColor: 'bg-purple-light'
    },
    {
        icon: <Trophy className="feature-icon text-amber" size={20} />,
        title: 'Score Analytics',
        description: "Admins get a bird's-eye view of all student performance across every course.",
        bgColor: 'bg-amber-light'
    }
];

const FeaturesSection = () => {
    return (
        <section className="features-section section">
            <div className="container features-container">
                <div className="features-header">
                    <span className="features-badge">WHY LEARNHUB</span>
                    <h2 className="features-title">
                        Everything you need to <br />
                        <span className="text-brand italic">succeed</span>
                    </h2>
                </div>

                <div className="features-grid">
                    {featuresData.map((feature, index) => (
                        <div className="feature-card" key={index}>
                            <div className={`feature-icon-wrapper ${feature.bgColor}`}>
                                {feature.icon}
                            </div>
                            <h3 className="feature-card-title">{feature.title}</h3>
                            <p className="feature-card-desc">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
