import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Award, Target, BarChart3, RotateCcw } from 'lucide-react';

const StudentQuiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quizDetails, setQuizDetails] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [accessError, setAccessError] = useState('');

    // Result state
    const [showResults, setShowResults] = useState(false);
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const formatQuestions = (qData) => {
            return qData.map(q => ({
                id: q.id,
                question: q.questionText,
                options: ["A", "B", "C", "D"],
                optionTexts: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
            }));
        };

        fetch(`http://localhost:5085/api/quizzes/${quizId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Quiz not found");
                return res.json();
            })
            .then(data => {
                setQuizDetails(data);

                const localEnrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
                if (localEnrolled.includes(data.courseId)) {
                    return fetch(`http://localhost:5085/api/questions/quiz/${quizId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                        .then(res => res.json())
                        .then(qData => setQuestions(formatQuestions(qData)))
                        .catch(err => console.error(err))
                        .finally(() => setLoading(false));
                }

                return fetch('http://localhost:5085/api/enrollments/my-courses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(myCourses => {
                    if (!myCourses.some(c => c.id === data.courseId)) {
                        setAccessError('Please enroll to attempt quiz');
                        setLoading(false);
                    } else {
                        localEnrolled.push(data.courseId);
                        localStorage.setItem('enrolledCourses', JSON.stringify(localEnrolled));

                        fetch(`http://localhost:5085/api/questions/quiz/${quizId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                            .then(res => res.json())
                            .then(qData => setQuestions(formatQuestions(qData)))
                            .catch(err => console.error(err))
                            .finally(() => setLoading(false));
                    }
                });
            })
            .catch(err => {
                toast.error('Failed to load quiz metadata');
                setLoading(false);
            });
    }, [quizId]);

    const handleOptionChange = (questionId, option) => {
        if (showResults) return; // Don't allow changes after submission
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (Object.keys(selectedAnswers).length === 0) {
            return toast.error('Please select at least one answer before submitting');
        }

        setSubmitting(true);

        const courseId = quizDetails ? quizDetails.courseId : 0;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:5085/api/results/submit/${quizId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(selectedAnswers)
            });

            if (response.ok) {
                const data = await response.json();
                setResultData(data);
                setShowResults(true);

                // Store in localStorage
                const result = {
                    courseId,
                    quizId: parseInt(quizId),
                    score: data.score,
                    totalQuestions: data.total,
                    passRate: data.passRate,
                    date: new Date().toISOString()
                };
                const localResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
                const filteredResults = localResults.filter(r => r.quizId !== parseInt(quizId));
                filteredResults.push(result);
                localStorage.setItem('quizResults', JSON.stringify(filteredResults));

                toast.success(`Quiz submitted! You scored ${data.score}/${data.total}`);
            } else {
                const errorData = await response.json().catch(() => null);
                const errorMsg = errorData?.message || 'Failed to submit quiz';
                toast.error(errorMsg);
            }
        } catch (err) {
            console.error('Quiz submission failed', err);
            toast.error('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = () => {
        setShowResults(false);
        setResultData(null);
        setSelectedAnswers({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get option style based on result state
    const getOptionStyle = (questionFeedback, opt, questionId) => {
        if (!showResults || !questionFeedback) {
            // Normal quiz mode
            return {
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px',
                background: selectedAnswers[questionId] === opt ? 'rgba(99, 102, 241, 0.08)' : 'var(--input-bg)',
                borderRadius: '10px', cursor: showResults ? 'default' : 'pointer',
                border: selectedAnswers[questionId] === opt ? '2px solid var(--brand-blue)' : '2px solid transparent',
                transition: 'all 0.2s ease'
            };
        }

        const isCorrectOption = questionFeedback.correctAnswer === opt;
        const isStudentChoice = questionFeedback.studentAnswer === opt;

        if (isCorrectOption) {
            return {
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '10px', cursor: 'default',
                border: '2px solid #22c55e',
                transition: 'all 0.2s ease'
            };
        }

        if (isStudentChoice && !isCorrectOption) {
            return {
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px',
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '10px', cursor: 'default',
                border: '2px solid #ef4444',
                transition: 'all 0.2s ease'
            };
        }

        return {
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 18px',
            background: 'var(--input-bg)',
            borderRadius: '10px', cursor: 'default',
            border: '2px solid transparent',
            opacity: 0.6,
            transition: 'all 0.2s ease'
        };
    };

    if (loading) return <div className="student-page container section text-center" style={{ padding: '80px 20px' }}>Loading Quiz...</div>;
    if (accessError) return (
        <div className="student-page container section text-center" style={{ padding: '80px 20px' }}>
            <p className="text-warning" style={{ fontSize: '1.5rem', color: '#f59e0b', fontWeight: '500', marginBottom: '20px' }}>
                {accessError}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/courses')}>Browse Courses</button>
        </div>
    );
    if (questions.length === 0) return <div className="student-page container section text-center">No questions available for this quiz.</div>;

    return (
        <div className="student-page container section">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <h2>{quizDetails ? quizDetails.title : 'Course Assessment'}</h2>
                <p className="text-muted">{quizDetails ? quizDetails.description : 'Answer all questions below to complete your evaluation.'}</p>
            </div>

            {/* Results Summary Banner */}
            {showResults && resultData && (
                <div style={{
                    maxWidth: '800px', margin: '0 auto 40px',
                    background: resultData.passRate >= 50
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(74, 222, 128, 0.05))'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05))',
                    border: `2px solid ${resultData.passRate >= 50 ? '#22c55e' : '#ef4444'}`,
                    borderRadius: '20px',
                    padding: '32px',
                    animation: 'fadeIn 0.5s ease'
                }}>
                    {/* Pass/Fail Header */}
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: resultData.passRate >= 50 ? '#22c55e' : '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: `0 8px 24px ${resultData.passRate >= 50 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                            {resultData.passRate >= 50
                                ? <Award size={32} color="white" />
                                : <XCircle size={32} color="white" />
                            }
                        </div>
                        <h3 style={{
                            fontSize: '1.6rem', fontWeight: '700',
                            color: resultData.passRate >= 50 ? '#22c55e' : '#ef4444',
                            marginBottom: '4px'
                        }}>
                            {resultData.passRate >= 50 ? '🎉 Congratulations! You Passed!' : '📝 Better Luck Next Time!'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Review your answers below. Correct answers are highlighted in green.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px'
                    }}>
                        <div style={{
                            background: 'var(--surface-color)',
                            borderRadius: '14px', padding: '20px',
                            textAlign: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <Target size={24} style={{ color: '#6366f1', marginBottom: '8px' }} />
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-color)' }}>
                                {resultData.score}/{resultData.total}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Score</div>
                        </div>

                        <div style={{
                            background: 'var(--surface-color)',
                            borderRadius: '14px', padding: '20px',
                            textAlign: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <BarChart3 size={24} style={{ color: resultData.passRate >= 50 ? '#22c55e' : '#ef4444', marginBottom: '8px' }} />
                            <div style={{
                                fontSize: '1.8rem', fontWeight: '800',
                                color: resultData.passRate >= 50 ? '#22c55e' : '#ef4444'
                            }}>
                                {resultData.passRate}%
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Pass Rate</div>
                        </div>

                        <div style={{
                            background: 'var(--surface-color)',
                            borderRadius: '14px', padding: '20px',
                            textAlign: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <CheckCircle size={24} style={{ color: '#22c55e', marginBottom: '8px' }} />
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-color)' }}>
                                {resultData.questions?.filter(q => q.isCorrect).length || 0}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Correct Answers</div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {questions.map((q, index) => {
                    // Find feedback for this question
                    const feedback = showResults && resultData?.questions
                        ? resultData.questions.find(fb => fb.questionId === q.id)
                        : null;

                    return (
                        <div key={q.id} style={{
                            background: 'var(--surface-color)',
                            padding: '30px',
                            borderRadius: '16px',
                            border: feedback
                                ? `2px solid ${feedback.isCorrect ? '#22c55e' : '#ef4444'}`
                                : '1px solid var(--border-color)',
                            marginBottom: '24px',
                            position: 'relative'
                        }}>
                            {/* Result badge on each question */}
                            {feedback && (
                                <div style={{
                                    position: 'absolute', top: '16px', right: '16px',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    background: feedback.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: feedback.isCorrect ? '#22c55e' : '#ef4444',
                                    fontWeight: '600', fontSize: '0.85rem'
                                }}>
                                    {feedback.isCorrect
                                        ? <><CheckCircle size={16} /> Correct</>
                                        : <><XCircle size={16} /> Wrong</>
                                    }
                                </div>
                            )}

                            <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', paddingRight: feedback ? '100px' : '0' }}>
                                {index + 1}. {q.question}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {q.options.map(opt => {
                                    const optionText = q.optionTexts[opt];
                                    const isCorrectOption = feedback && feedback.correctAnswer === opt;
                                    const isStudentWrongChoice = feedback && feedback.studentAnswer === opt && !feedback.isCorrect;

                                    return (
                                        <label key={opt} style={getOptionStyle(feedback, opt, q.id)}>
                                            <input
                                                type="radio"
                                                name={`question-${q.id}`}
                                                value={opt}
                                                checked={selectedAnswers[q.id] === opt}
                                                onChange={() => handleOptionChange(q.id, opt)}
                                                disabled={showResults}
                                                style={{ transform: 'scale(1.2)', accentColor: isCorrectOption ? '#22c55e' : isStudentWrongChoice ? '#ef4444' : undefined }}
                                            />
                                            <span style={{ flex: 1 }}>
                                                <strong>{opt}.</strong> {optionText}
                                            </span>
                                            {isCorrectOption && showResults && (
                                                <span style={{
                                                    fontSize: '0.78rem', fontWeight: '600',
                                                    color: '#22c55e',
                                                    background: 'rgba(34,197,94,0.1)',
                                                    padding: '3px 10px', borderRadius: '12px'
                                                }}>
                                                    ✓ Correct Answer
                                                </span>
                                            )}
                                            {isStudentWrongChoice && (
                                                <span style={{
                                                    fontSize: '0.78rem', fontWeight: '600',
                                                    color: '#ef4444',
                                                    background: 'rgba(239,68,68,0.08)',
                                                    padding: '3px 10px', borderRadius: '12px'
                                                }}>
                                                    ✗ Your Answer
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Bottom Actions */}
                <div style={{ textAlign: 'center', marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {!showResults ? (
                        <button onClick={handleSubmit} className="btn btn-primary btn-lg" disabled={submitting}
                            style={{ padding: '14px 48px', fontSize: '1.05rem', borderRadius: '12px' }}>
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    ) : (
                        <>
                            <button onClick={handleRetry} className="btn btn-primary btn-lg"
                                style={{
                                    padding: '14px 36px', fontSize: '1rem', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                <RotateCcw size={18} /> Retake Quiz
                            </button>
                            <button onClick={() => navigate('/results')} className="btn btn-outline btn-lg"
                                style={{ padding: '14px 36px', fontSize: '1rem', borderRadius: '12px' }}>
                                View All Results
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentQuiz;
