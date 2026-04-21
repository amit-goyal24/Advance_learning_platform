import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, User as UserIcon, BookOpen, ChevronRight } from 'lucide-react';
import './StudentCourses.css';

const StudentCourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch course details
        fetch(`http://localhost:5085/api/courses/${id}`)
            .then(res => res.json())
            .then(data => setCourse(data))
            .catch(err => console.error(err));

        const token = localStorage.getItem('token');

        // Check localStorage first for instant UI response
        const localEnrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (localEnrolled.includes(parseInt(id))) {
            setEnrolled(true);
            fetchQuizzes(token);
            setLoading(false);
            return;
        }

        // Check backend enrollment status
        fetch('http://localhost:5085/api/enrollments/my-courses', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(myCourses => {
                if (Array.isArray(myCourses) && myCourses.some(c => c.id === parseInt(id))) {
                    // Sync backend with local state
                    localEnrolled.push(parseInt(id));
                    localStorage.setItem('enrolledCourses', JSON.stringify(localEnrolled));

                    setEnrolled(true);
                    fetchQuizzes(token);
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    const fetchQuizzes = async (token) => {
        try {
            const response = await fetch(`http://localhost:5085/api/quizzes/course/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setQuizzes(await response.json());
            }
        } catch (err) { console.error(err); }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Immediate UI Update & Local Storage persistence
        const localEnrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (!localEnrolled.includes(parseInt(id))) {
            localEnrolled.push(parseInt(id));
            localStorage.setItem('enrolledCourses', JSON.stringify(localEnrolled));
        }
        setEnrolled(true);
        toast.success('Successfully Enrolled!');
        fetchQuizzes(token);

        // Sync with backend asynchronously
        try {
            await fetch(`http://localhost:5085/api/enrollments/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) // Explicitly send empty body to satisfy strict proxies
            });
        } catch (err) {
            console.error('Backend sync failed, but local state preserved.', err);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`);
    };

    if (loading) return <div className="student-page container section text-center">Loading Course Details...</div>;
    if (!course) return <div className="student-page container section text-center">Course not found.</div>;

    return (
        <div className="student-page container section">
            <div className="course-detail-header" style={{ padding: '40px', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{course.title}</h1>

                <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    <span className="meta-item" style={{ fontSize: '1rem' }}><UserIcon size={18} /> Instructed by <strong>{course.instructorName}</strong></span>
                    <span className="meta-item" style={{ fontSize: '1rem' }}><Clock size={18} /> {course.duration}</span>
                </div>

                <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-primary)', marginBottom: '30px' }}>
                    {course.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!enrolled ? (
                        <>
                            <p className="text-warning" style={{ fontSize: '1rem', color: '#f59e0b', fontWeight: '500' }}>
                                Please enroll to attempt quiz
                            </p>
                            <button className="btn btn-primary btn-lg" onClick={handleEnroll} style={{ alignSelf: 'flex-start' }}>
                                Enroll Now
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <button className="btn btn-secondary btn-lg" disabled style={{ background: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed', border: 'none' }}>
                                Enrolled
                            </button>
                            <span className="text-muted">You can now access the course materials and quizzes below.</span>
                        </div>
                    )}
                </div>
            </div>

            {enrolled && (
                <div className="course-materials" style={{ padding: '40px', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <BookOpen size={24} style={{ color: 'var(--brand-blue)' }} /> Course Quizzes
                    </h2>

                    {quizzes.length === 0 ? (
                        <p className="text-muted text-center py-4">No quizzes available for this course yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {quizzes.map(quiz => (
                                <div key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{quiz.title}</h3>
                                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0' }}>{quiz.description}</p>
                                    </div>
                                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleStartQuiz(quiz.id)}>
                                        Start Quiz <ChevronRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentCourseDetail;
