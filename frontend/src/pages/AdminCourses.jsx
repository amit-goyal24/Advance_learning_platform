import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './AdminCourses.css';
import toast from 'react-hot-toast';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ id: 0, title: '', description: '', duration: '', instructorName: '' });

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:5085/api/courses');
            if (response.ok) {
                setCourses(await response.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = formData.id ? 'PUT' : 'POST';
        const url = formData.id ? `http://localhost:5085/api/courses/${formData.id}` : 'http://localhost:5085/api/courses';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                toast.success(formData.id ? 'Course updated successfully' : 'Course created successfully');
                setShowForm(false);
                setFormData({ id: 0, title: '', description: '', duration: '', instructorName: '' });
                fetchCourses();
            } else {
                toast.error('Operation failed');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const handleEdit = (course) => {
        setFormData(course);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5085/api/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success('Course deleted');
                fetchCourses();
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    return (
        <div className="admin-page container section">
            <div className="admin-header flex-between">
                <h2>Manage Courses</h2>
                <button className="btn btn-primary" onClick={() => { setFormData({ id: 0, title: '', description: '', duration: '', instructorName: '' }); setShowForm(!showForm); }}>
                    <Plus size={16} /> Add Course
                </button>
            </div>

            {showForm && (
                <form className="admin-form slide-down" onSubmit={handleSubmit}>
                    <div className="form-group grid-2">
                        <div>
                            <label className="form-label">Course Title</label>
                            <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">Duration (e.g. 10 hours)</label>
                            <input type="text" className="form-input" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group grid-2">
                        <div>
                            <label className="form-label">Instructor Name</label>
                            <input type="text" className="form-input" value={formData.instructorName} onChange={e => setFormData({ ...formData, instructorName: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            <input type="text" className="form-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{formData.id ? 'Update Course' : 'Create Course'}</button>
                    </div>
                </form>
            )}

            <div className="table-responsive mt-4">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Instructor</th>
                            <th>Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length === 0 ? (
                            <tr><td colSpan="5" className="text-center">No courses found.</td></tr>
                        ) : (
                            courses.map(course => (
                                <tr key={course.id}>
                                    <td>#{course.id}</td>
                                    <td><strong>{course.title}</strong></td>
                                    <td>{course.instructorName}</td>
                                    <td>{course.duration}</td>
                                    <td className="action-cells">
                                        <button className="action-icon edit" onClick={() => handleEdit(course)}><Edit size={18} /></button>
                                        <button className="action-icon delete" onClick={() => handleDelete(course.id)}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCourses;
