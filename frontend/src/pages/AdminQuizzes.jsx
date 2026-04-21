import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, List } from 'lucide-react';
import './AdminCourses.css';
import toast from 'react-hot-toast';

const AdminQuizzes = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    
    // Quiz Form State
    const [showQuizForm, setShowQuizForm] = useState(false);
    const [quizForm, setQuizForm] = useState({ id: 0, title: '', description: '' });

    // Questions State for a selected Quiz
    const [activeQuizId, setActiveQuizId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [questionForm, setQuestionForm] = useState({
        id: 0, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A'
    });


    useEffect(() => {
        fetch('http://localhost:5085/api/courses')
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(err => console.error(err));
    }, []);

    const fetchQuizzes = async (courseId) => {
        if (!courseId) { setQuizzes([]); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5085/api/quizzes/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) setQuizzes(await response.json());
        } catch (err) { console.error(err); }
    };

    const fetchQuestions = async (quizId) => {
        if (!quizId) { setQuestions([]); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5085/api/questions/quiz/${quizId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) setQuestions(await response.json());
        } catch (err) { console.error(err); }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        setActiveQuizId(null);
        fetchQuizzes(courseId);
    };

    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourse) return toast.error('Please select a course first');

        const payload = { ...quizForm, courseId: parseInt(selectedCourse) };
        const token = localStorage.getItem('token');
        const method = payload.id ? 'PUT' : 'POST';
        const url = payload.id ? `http://localhost:5085/api/quizzes/${payload.id}` : 'http://localhost:5085/api/quizzes';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                toast.success(payload.id ? 'Quiz updated' : 'Quiz added');
                setShowQuizForm(false);
                setQuizForm({ id: 0, title: '', description: '' });
                fetchQuizzes(selectedCourse);
            } else {
                toast.error('Failed to save quiz');
            }
        } catch (err) { toast.error('Network error'); }
    };

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5085/api/quizzes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success('Quiz deleted');
                if (activeQuizId === id) setActiveQuizId(null);
                fetchQuizzes(selectedCourse);
            }
        } catch (err) { toast.error('Network error'); }
    };

    const handleManageQuestions = (quizId) => {
        setActiveQuizId(quizId);
        fetchQuestions(quizId);
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...questionForm, quizId: activeQuizId };
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5085/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                toast.success('Question saved successfully');
                setShowQuestionForm(false);
                setQuestionForm({ id: 0, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
                fetchQuestions(activeQuizId);
                fetchQuizzes(selectedCourse); // To update QuestionCount
            } else {
                toast.error('Failed to save question');
            }
        } catch (err) { toast.error('Network error'); }
    };

    return (
        <div className="admin-page container section">
            <div className="admin-header flex-between">
                <h2>Manage Quizzes</h2>
                {selectedCourse && !activeQuizId && (
                    <button className="btn btn-primary" onClick={() => { setQuizForm({ id: 0, title: '', description: '' }); setShowQuizForm(!showQuizForm); }}>
                        <Plus size={16} /> Add Quiz
                    </button>
                )}
                {activeQuizId && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-outline" onClick={() => setActiveQuizId(null)}>Back to Quizzes</button>
                        <button className="btn btn-primary" onClick={() => { setShowQuestionForm(!showQuestionForm); }}>
                            <Plus size={16} /> Add Question
                        </button>
                    </div>
                )}
            </div>

            {!activeQuizId && (
                <div className="form-group" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
                    <label className="form-label">Select Course</label>
                    <div className="select-wrapper">
                        <select className="form-select" value={selectedCourse} onChange={handleCourseChange}>
                            <option value="">-- Choose a Course --</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {showQuizForm && selectedCourse && !activeQuizId && (
                <form className="admin-form slide-down" onSubmit={handleQuizSubmit}>
                    <div className="form-group grid-2">
                        <div>
                            <label className="form-label">Quiz Title</label>
                            <input type="text" className="form-input" value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            <input type="text" className="form-input" value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setShowQuizForm(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{quizForm.id ? 'Update Quiz' : 'Save Quiz'}</button>
                    </div>
                </form>
            )}

            {!activeQuizId && selectedCourse && (
                <div className="table-responsive mt-4">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Quiz Title</th>
                                <th>Description</th>
                                <th>Questions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.length === 0 ? (
                                <tr><td colSpan="4" className="text-center">No quizzes found for this course.</td></tr>
                            ) : (
                                quizzes.map(q => (
                                    <tr key={q.id}>
                                        <td><strong>{q.title}</strong></td>
                                        <td>{q.description}</td>
                                        <td>{q.questionCount} Questions</td>
                                        <td className="action-cells">
                                            <button className="action-icon edit" title="Manage Questions" onClick={() => handleManageQuestions(q.id)}><List size={18} /></button>
                                            <button className="action-icon edit" onClick={() => { setQuizForm(q); setShowQuizForm(true); }}><Edit size={18} /></button>
                                            <button className="action-icon delete" onClick={() => handleDeleteQuiz(q.id)}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeQuizId && showQuestionForm && (
                <form className="admin-form slide-down" onSubmit={handleQuestionSubmit}>
                    <div className="form-group">
                        <label className="form-label">Question Text</label>
                        <input type="text" className="form-input" required value={questionForm.questionText} onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })} />
                    </div>
                    <div className="grid-2">
                        <div className="form-group"><label className="form-label">Option A</label><input type="text" className="form-input" required value={questionForm.optionA} onChange={e => setQuestionForm({ ...questionForm, optionA: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Option B</label><input type="text" className="form-input" required value={questionForm.optionB} onChange={e => setQuestionForm({ ...questionForm, optionB: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Option C</label><input type="text" className="form-input" required value={questionForm.optionC} onChange={e => setQuestionForm({ ...questionForm, optionC: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Option D</label><input type="text" className="form-input" required value={questionForm.optionD} onChange={e => setQuestionForm({ ...questionForm, optionD: e.target.value })} /></div>
                    </div>
                    <div className="form-group mt-2">
                        <label className="form-label">Correct Answer</label>
                        <div className="select-wrapper">
                            <select className="form-select" value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}>
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setShowQuestionForm(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Question</button>
                    </div>
                </form>
            )}

            {activeQuizId && (
                <div className="table-responsive mt-4">
                    <h3 className="mb-3">Questions for this Quiz</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Options</th>
                                <th>Correct</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length === 0 ? (
                                <tr><td colSpan="3" className="text-center">No questions for this quiz.</td></tr>
                            ) : (
                                questions.map(q => (
                                    <tr key={q.id}>
                                        <td><strong>{q.questionText}</strong></td>
                                        <td style={{ fontSize: '0.9rem' }}>
                                            A: {q.optionA}<br />B: {q.optionB}<br />C: {q.optionC}<br />D: {q.optionD}
                                        </td>
                                        <td>
                                            <span className="badge badge-success">Option {q.correctAnswer || 'Hidden'}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminQuizzes;
