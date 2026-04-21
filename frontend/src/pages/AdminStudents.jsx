import React, { useState, useEffect } from 'react';
import { Search, Users, BookOpen, Award, ChevronDown, ChevronUp, Mail, GraduationCap } from 'lucide-react';
import './AdminCourses.css';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedStudent, setExpandedStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5085/api/students', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setStudents(await response.json());
                }
            } catch (err) {
                console.error("Failed to load students", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStudents = students.length;
    const totalEnrollments = students.reduce((sum, s) => sum + (s.enrolledCourses?.length || 0), 0);
    const totalQuizAttempts = students.reduce((sum, s) => sum + (s.quizAttempts || 0), 0);
    const overallAvg = totalStudents > 0
        ? Math.round(students.reduce((sum, s) => sum + (s.avgScore || 0), 0) / totalStudents)
        : 0;

    const toggleExpand = (id) => {
        setExpandedStudent(expandedStudent === id ? null : id);
    };

    return (
        <div className="admin-page container section">
            <div className="admin-header">
                <h2>Registered Students</h2>
                <p className="text-muted">View all registered students, their enrollments, and performance</p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {[
                    { icon: Users, value: totalStudents, label: 'Total Students', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
                    { icon: BookOpen, value: totalEnrollments, label: 'Total Enrollments', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
                    { icon: GraduationCap, value: totalQuizAttempts, label: 'Quiz Attempts', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
                    { icon: Award, value: `${overallAvg}%`, label: 'Avg Performance', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)' },
                ].map((stat, i) => (
                    <div key={i} style={{
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
                            background: stat.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <stat.icon size={22} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-color)' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
                <Search size={18} style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                }} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '42px', width: '100%' }}
                />
            </div>

            {loading ? (
                <div className="text-center mt-4">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'var(--surface-color)', borderRadius: '16px',
                    border: '1px solid var(--border-color)'
                }}>
                    <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No students found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredStudents.map((student, index) => (
                        <div key={student.id} style={{
                            background: 'var(--surface-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            transition: 'box-shadow 0.2s ease'
                        }}>
                            {/* Student Row */}
                            <div
                                onClick={() => toggleExpand(student.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '20px 24px',
                                    cursor: 'pointer',
                                    gap: '16px',
                                    flexWrap: 'wrap'
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    background: `hsl(${(student.id * 67) % 360}, 60%, 65%)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: '700', fontSize: '1.1rem',
                                    flexShrink: 0
                                }}>
                                    {student.name?.charAt(0).toUpperCase() || '?'}
                                </div>

                                {/* Name & Email */}
                                <div style={{ flex: '1', minWidth: '180px' }}>
                                    <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-color)' }}>
                                        {student.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                        <Mail size={13} /> {student.email}
                                    </div>
                                </div>

                                {/* Quick stats */}
                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-color)' }}>
                                            {student.enrolledCourses?.length || 0}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Courses</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-color)' }}>
                                            {student.quizAttempts || 0}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quizzes</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            fontWeight: '700', fontSize: '1.1rem',
                                            color: (student.avgScore || 0) >= 50 ? '#22c55e' : (student.avgScore || 0) > 0 ? '#ef4444' : 'var(--text-muted)'
                                        }}>
                                            {student.avgScore || 0}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Score</div>
                                    </div>
                                </div>

                                {/* Expand icon */}
                                <div style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                                    {expandedStudent === student.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedStudent === student.id && (
                                <div style={{
                                    borderTop: '1px solid var(--border-color)',
                                    padding: '24px',
                                    background: 'var(--bg-color)',
                                    animation: 'fadeIn 0.2s ease'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                        {/* Enrolled Courses */}
                                        <div>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <BookOpen size={16} /> Enrolled Courses
                                            </h4>
                                            {(!student.enrolledCourses || student.enrolledCourses.length === 0) ? (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No courses enrolled yet.</p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {student.enrolledCourses.map((course, ci) => (
                                                        <div key={ci} style={{
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            padding: '10px 14px', background: 'var(--surface-color)',
                                                            borderRadius: '10px', border: '1px solid var(--border-color)'
                                                        }}>
                                                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{course.courseName}</span>
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                {new Date(course.enrolledDate).toLocaleDateString('en-GB', {
                                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Quiz Results  - show inline if we have them from the list endpoint */}
                                        <div>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Award size={16} /> Performance Summary
                                            </h4>
                                            <div style={{
                                                padding: '16px', background: 'var(--surface-color)',
                                                borderRadius: '10px', border: '1px solid var(--border-color)'
                                            }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Quizzes Taken</div>
                                                        <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{student.quizAttempts || 0}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Average Score</div>
                                                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: (student.avgScore || 0) >= 50 ? '#22c55e' : '#ef4444' }}>
                                                            {student.avgScore || 0}%
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Courses Enrolled</div>
                                                        <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{student.enrolledCourses?.length || 0}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                                                        <span className={`badge ${(student.avgScore || 0) >= 50 ? 'badge-success' : student.quizAttempts > 0 ? 'badge-danger' : 'badge-warning'}`}
                                                            style={{ fontSize: '0.85rem' }}>
                                                            {(student.avgScore || 0) >= 50 ? '✓ Good Standing' : student.quizAttempts > 0 ? '⚠ Needs Improvement' : 'No Attempts'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
