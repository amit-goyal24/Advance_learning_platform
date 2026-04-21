import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './AdminCourses.css';
import toast from 'react-hot-toast';

const AdminQuestions = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [questions, setQuestions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        questionText: '',
        optionA: '', optionB: '', optionC: '', optionD: '',
        correctAnswer: 'A'
    });

    useEffect(() => {
        fetch('http://localhost:5085/api/courses')
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(err => console.error(err));
    }, []);

    const fetchQuestions = async (courseId) => {
        if (!courseId) { setQuestions([]); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5085/api/questions/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) setQuestions(await response.json());
        } catch (err) { console.error(err); }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        fetchQuestions(courseId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourse) return toast.error('Please select a course first');

        const payload = { ...formData, courseId: parseInt(selectedCourse) };
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5085/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                toast.success('Question added successfully');
                setShowForm(false);
                setFormData({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
                fetchQuestions(selectedCourse);
            } else {
                toast.error('Failed to add question');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    return (
        <div className="admin-page container section">
            <div className="admin-header flex-between">
                <h2>Manage Quiz Questions</h2>
                {selectedCourse && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <Plus size={16} /> Add Question
                    </button>
                )}
            </div>

            <div className="form-group" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
                <label className="form-label">Select Course to Manage Questions</label>
                <div className="select-wrapper">
                    <select className="form-select" value={selectedCourse} onChange={handleCourseChange}>
                        <option value="">-- Choose a Course --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
            </div>

            {showForm && selectedCourse && (
                <form className="admin-form slide-down" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Question Text</label>
                        <input type="text" className="form-input" required value={formData.questionText} onChange={e => setFormData({ ...formData, questionText: e.target.value })} />
                    </div>
                    <div className="grid-2">
                        <div className="form-group"><label className="form-label">Option A</label><input type="text" className="form-input" required value={formData.optionA} onChange={e => setFormData({ ...formData, optionA: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Option B</label><input type="text" className="form-input" required value={formData.optionB} onChange={e => setFormData({ ...formData, optionB: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Option C</label><input type="text" className="form-input" required value={formData.optionC} onChange={e => setFormData({ ...formData, optionC: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Option D</label><input type="text" className="form-input" required value={formData.optionD} onChange={e => setFormData({ ...formData, optionD: e.target.value })} /></div>
                    </div>
                    <div className="form-group mt-2">
                        <label className="form-label">Correct Answer</label>
                        <div className="select-wrapper">
                            <select className="form-select" value={formData.correctAnswer} onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}>
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Question</button>
                    </div>
                </form>
            )}

            {selectedCourse && (
                <div className="table-responsive mt-4">
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
                                <tr><td colSpan="3" className="text-center">No questions for this course.</td></tr>
                            ) : (
                                questions.map(q => (
                                    <tr key={q.id}>
                                        <td><strong>{q.questionText}</strong></td>
                                        <td style={{ fontSize: '0.9rem' }}>
                                            A: {q.optionA}<br />B: {q.optionB}<br />C: {q.optionC}<br />D: {q.optionD}
                                        </td>
                                        <td>
                                            <span className="badge badge-success">Option {q.correctAnswer}</span>
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

export default AdminQuestions;
