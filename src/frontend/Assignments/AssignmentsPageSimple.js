import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GradeModal from './components/GradeModal';
import './AssignmentsPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AssignmentsPage = () => {
  const [view, setView] = useState('submissions');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (view === 'submissions') {
      fetchSubmissions();
    }
  }, [view, filter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/assignments/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filter === 'all' ? undefined : filter }
      });
      
      if (response.data.success) {
        setSubmissions(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId, gradeData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_URL}/assignments/${submissionId}/grade`,
        gradeData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('✅ Assignment graded and certificate generated successfully!');
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Error grading:', err);
      throw err;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: { text: 'Pending', color: '#f59e0b', icon: '⏳' },
      graded: { text: 'Graded', color: '#10b981', icon: '✅' }
    };
    const badge = badges[status] || badges.submitted;
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: badge.color }}
      >
        {badge.icon} {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="assignments-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      <div className="page-header">
        <h1>📝 Assignment Management</h1>
        <p>Grade student submissions and generate certificates</p>
      </div>

      <div className="view-tabs">
        <button 
          className={view === 'submissions' ? 'active' : ''}
          onClick={() => setView('submissions')}
        >
          📬 Submissions
        </button>
      </div>

      {view === 'submissions' && (
        <>
          <div className="filter-tabs">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({submissions.length})
            </button>
            <button 
              className={filter === 'submitted' ? 'active' : ''}
              onClick={() => setFilter('submitted')}
            >
              Pending ({submissions.filter(s => s.status === 'submitted').length})
            </button>
            <button 
              className={filter === 'graded' ? 'active' : ''}
              onClick={() => setFilter('graded')}
            >
              Graded ({submissions.filter(s => s.status === 'graded').length})
            </button>
          </div>

          <div className="submissions-list">
            {submissions.length === 0 ? (
              <div className="empty-state">
                <p>No submissions found</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <div key={submission._id} className="submission-card">
                  <div className="submission-header">
                    <div className="submission-info">
                      <h3>{submission.assignmentTitle}</h3>
                      <p className="course-name">{submission.courseName}</p>
                      <p className="student-name">
                        👤 {submission.student?.name || 'Unknown Student'}
                      </p>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>

                  <div className="submission-body">
                    <div className="submission-meta">
                      <span>📅 Submitted: {new Date(submission.submittedAt).toLocaleDateString('en-IN')}</span>
                      {submission.gradedAt && (
                        <span>✅ Graded: {new Date(submission.gradedAt).toLocaleDateString('en-IN')}</span>
                      )}
                    </div>

                    {submission.status === 'graded' && (
                      <div className="grade-display">
                        <span className="score">
                          Score: {submission.score}/{submission.maxScore} 
                          ({((submission.score / submission.maxScore) * 100).toFixed(1)}%)
                        </span>
                        {submission.certificateId && (
                          <span className="certificate-badge">
                            🎓 Certificate Generated
                          </span>
                        )}
                      </div>
                    )}

                    {submission.status === 'submitted' && (
                      <button 
                        className="grade-btn"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        🎓 Grade Assignment
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {selectedSubmission && (
        <GradeModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onGrade={handleGrade}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
