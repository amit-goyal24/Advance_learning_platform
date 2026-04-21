import React, { useState, useEffect } from 'react';
import { Search, Users, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import './AdminCourses.css';

const AdminResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5085/api/results/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setResults(await response.json());
                }
            } catch (err) {
                console.error("Failed to load results", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    // Get unique course names for filter
    const courseNames = [...new Set(results.map(r => r.courseName))];

    // Filter results
    const filteredResults = results.filter(r => {
        const matchesSearch = r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = filterCourse === 'all' || r.courseName === filterCourse;
        return matchesSearch && matchesCourse;
    });

    // Stats
    const totalAttempts = filteredResults.length;
    const avgScore = totalAttempts > 0
        ? Math.round(filteredResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalAttempts)
        : 0;
    const passCount = filteredResults.filter(r => (r.percentage || 0) >= 50).length;
    const failCount = totalAttempts - passCount;

    return (
        <div className="admin-page container section">
            <div className="admin-header">
                <h2>Student Results</h2>
                <p className="text-muted">View and track all student quiz performances</p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Users size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-color)' }}>{totalAttempts}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Attempts</div>
                    </div>
                </div>

                <div style={{
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <TrendingUp size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-color)' }}>{avgScore}%</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg Score</div>
                    </div>
                </div>

                <div style={{
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Award size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-color)' }}>{passCount}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Passed</div>
                    </div>
                </div>

                <div style={{
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ef4444, #f87171)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <AlertTriangle size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-color)' }}>{failCount}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Failed</div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div style={{
                display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                    <Search size={18} style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                    }} />
                    <input
                        type="text"
                        placeholder="Search by student name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '42px', width: '100%' }}
                    />
                </div>
                <select
                    className="form-select"
                    value={filterCourse}
                    onChange={e => setFilterCourse(e.target.value)}
                    style={{ minWidth: '200px' }}
                >
                    <option value="all">All Courses</option>
                    {courseNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center mt-4">Loading results...</div>
            ) : (
                <div className="table-responsive mt-4">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Score</th>
                                <th>Percentage</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.length === 0 ? (
                                <tr><td colSpan="7" className="text-center" style={{ padding: '40px' }}>
                                    No student results found.
                                </td></tr>
                            ) : (
                                filteredResults.map((result, index) => {
                                    const pct = result.percentage || (result.totalQuestions > 0 ? Math.round((result.score / result.totalQuestions) * 100) : 0);
                                    const passed = pct >= 50;

                                    return (
                                        <tr key={result.id || index}>
                                            <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{index + 1}</td>
                                            <td>
                                                <div>
                                                    <strong>{result.studentName || result.user?.name || `User ${result.userId}`}</strong>
                                                    {result.studentEmail && (
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {result.studentEmail}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{result.courseName || result.course?.title || `Course ${result.courseId}`}</td>
                                            <td>
                                                <strong>{result.score}</strong>
                                                <span style={{ color: 'var(--text-muted)' }}> / {result.totalQuestions}</span>
                                            </td>
                                            <td>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '60px', height: '6px',
                                                        background: 'var(--border-color)',
                                                        borderRadius: '3px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${pct}%`, height: '100%',
                                                            background: passed
                                                                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                                                                : 'linear-gradient(90deg, #ef4444, #f87171)',
                                                            borderRadius: '3px',
                                                            transition: 'width 0.5s ease'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{pct}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                                                    {passed ? '✓ Passed' : '✗ Failed'}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {new Date(result.attemptedDate).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
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

export default AdminResults;
