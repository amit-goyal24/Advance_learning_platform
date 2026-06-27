import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User as UserIcon } from 'lucide-react';
import './StudentCourses.css';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5085/api/courses')
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="student-page container section">
            <div className="page-header">
                <h2>Browse Available Courses</h2>
                <p className="text-muted">Expand your knowledge with our curated selection</p>
            </div>

            {loading ? (
                <div className="text-center mt-4">Loading courses...</div>
            ) : (
                <div className="course-grid mt-4">
                    {courses.length === 0 ? (
                        <p>No courses currently available.</p>
                    ) : (
                        courses.map(course => (
                            <div key={course.id} className="course-card">
                                <div className="course-image-placeholder"></div>
                                <div className="course-content">
                                    <h3 className="course-title">{course.title}</h3>
                                    <p className="course-desc line-clamp-2">{course.description}</p>

                                    <div className="course-meta">
                                        <span className="meta-item"><UserIcon size={14} /> {course.instructorName}</span>
                                        <span className="meta-item"><Clock size={14} /> {course.duration}</span>
                                    </div>

                                    <Link to={`/courses/${course.id}`} className="btn btn-outline w-full mt-3 text-center">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
