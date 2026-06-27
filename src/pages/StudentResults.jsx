import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminCourses.css';

const StudentResults = () => {
    const [results, setResults] = useState([]);
    const [courses, setCourses] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyResults = async () => {
            try {
                // Fetch Courses to map course names
                const coursesRes = await fetch('http://localhost:5085/api/courses');
                let coursesMap = {};
                if (coursesRes.ok) {
                    const coursesData = await coursesRes.json();
                    coursesData.forEach(c => {
                        coursesMap[c.id] = c.title;
                    });
                }
                setCourses(coursesMap);

                const token = localStorage.getItem('token');
                const localResults = JSON.parse(localStorage.getItem('quizResults') || '[]');

                const response = await fetch('http://localhost:5085/api/results/my-results', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const apiResults = await response.json();

                    // Backend is the source of truth for scores
                    // Only add local results that don't already exist in backend
                    let mergedResults = apiResults.map(ar => ({
                        ...ar,
                        // Ensure consistent field names
                        score: ar.score,
                        totalQuestions: ar.totalQuestions,
                        passRate: ar.totalQuestions > 0 ? Math.round((ar.score / ar.totalQuestions) * 100) : 0,
                        date: ar.attemptedDate || ar.date
                    }));

                    // Add any local-only results (ones not yet synced to backend)
                    localResults.forEach(lr => {
                        const existsInBackend = mergedResults.some(ar => ar.quizId === lr.quizId);
                        if (!existsInBackend) {
                            mergedResults.push(lr);
                        }
                    });

                    setResults(mergedResults);

                    // Sync localStorage with backend truth
                    const updatedLocal = mergedResults.map(r => ({
                        courseId: r.courseId,
                        quizId: r.quizId,
                        score: r.score,
                        totalQuestions: r.totalQuestions,
                        passRate: r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0,
                        date: r.attemptedDate || r.date || new Date().toISOString()
                    }));
                    localStorage.setItem('quizResults', JSON.stringify(updatedLocal));
                } else {
                    setResults(localResults); // fallback to local storage
                }
            } catch (err) {
                console.error("Failed to load personal results, using local state", err);
                const localResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
                setResults(localResults);
            } finally {
                setLoading(false);
            }
        };
        fetchMyResults();
    }, []);

    return (
        <div className="student-page container section">
            <div className="page-header" style={{ marginBottom: '30px' }}>
                <h2>My Performance</h2>
                <p className="text-muted">Track your historical quiz assessment scores.</p>
            </div>

            {loading ? (
                <div className="text-center mt-4">Loading your scores...</div>
            ) : (
                <div className="table-responsive mt-4">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Score</th>
                                <th>Total Questions</th>
                                <th>Pass Rate</th>
                                <th>Submission Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.length === 0 ? (
                                <tr><td colSpan="5" className="text-center">No quizzes attempted yet.<br /><Link to="/courses" style={{ color: 'var(--brand-blue)', marginTop: '10px', display: 'inline-block' }}>Browse Courses</Link></td></tr>
                            ) : (
                                results.map((result, index) => {
                                    const courseName = result.course?.title || courses[result.courseId] || `Course ${result.courseId}`;
                                    const passRate = result.totalQuestions > 0 ? Math.round((result.score / result.totalQuestions) * 100) : 0;
                                    const formattedDate = new Date(result.attemptedDate || result.date).toLocaleDateString('en-GB'); // DD/MM/YYYY formatting

                                    return (
                                        <tr key={result.id || index}>
                                            <td><strong>{courseName}</strong></td>
                                            <td>{result.score}/{result.totalQuestions}</td>
                                            <td>{result.totalQuestions}</td>
                                            <td>
                                                <span className={`badge ${passRate >= 50 ? 'badge-success' : 'badge-danger'}`}>
                                                    {passRate}%
                                                </span>
                                            </td>
                                            <td>{formattedDate}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentResults;
