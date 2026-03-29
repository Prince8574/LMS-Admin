import React, { useState } from 'react';
import './GradeModal.css';

const GradeModal = ({ submission, onClose, onGrade }) => {
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState(submission.maxScore || 100);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!score || score < 0 || score > maxScore) {
      alert(`Please enter a valid score between 0 and ${maxScore}`);
      return;
    }

    setLoading(true);
    try {
      await onGrade(submission._id, {
        score: Number(score),
        maxScore: Number(maxScore),
        feedback
      });
      onClose();
    } catch (error) {
      console.error('Error grading:', error);
      alert('Failed to grade assignment');
    } finally {
      setLoading(false);
    }
  };

  const percentage = score && maxScore ? ((score / maxScore) * 100).toFixed(1) : 0;
  
  const getGrade = (pct) => {
    if (pct >= 90) return { letter: 'A+', color: '#10b981' };
    if (pct >= 80) return { letter: 'A', color: '#3b82f6' };
    if (pct >= 70) return { letter: 'B+', color: '#f59e0b' };
    if (pct >= 60) return { letter: 'B', color: '#f97316' };
    if (pct >= 50) return { letter: 'C', color: '#ef4444' };
    return { letter: 'D', color: '#991b1b' };
  };

  const grade = getGrade(percentage);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="grade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎓 Grade Assignment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="submission-info">
          <div className="info-row">
            <span className="label">Student:</span>
            <span className="value">{submission.student?.name || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <span className="label">Assignment:</span>
            <span className="value">{submission.assignmentTitle}</span>
          </div>
          <div className="info-row">
            <span className="label">Course:</span>
            <span className="value">{submission.courseName}</span>
          </div>
          <div className="info-row">
            <span className="label">Submitted:</span>
            <span className="value">
              {new Date(submission.submittedAt).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        {submission.submissionText && (
          <div className="submission-content">
            <h4>📝 Submission:</h4>
            <p>{submission.submissionText}</p>
          </div>
        )}

        {submission.submissionUrl && (
          <div className="submission-url">
            <h4>🔗 Submission URL:</h4>
            <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer">
              {submission.submissionUrl}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grade-form">
          <div className="score-inputs">
            <div className="input-group">
              <label>Score Obtained *</label>
              <input
                type="number"
                min="0"
                max={maxScore}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter score"
                required
              />
            </div>

            <div className="input-group">
              <label>Maximum Score</label>
              <input
                type="number"
                min="1"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>

          {score && (
            <div className="grade-preview">
              <div className="percentage-display">
                <span className="percentage">{percentage}%</span>
                <span 
                  className="grade-letter" 
                  style={{ backgroundColor: grade.color }}
                >
                  {grade.letter}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: grade.color 
                  }}
                ></div>
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
              rows="4"
            />
          </div>

          <div className="certificate-notice">
            <span className="notice-icon">🎓</span>
            <p>A certificate will be automatically generated and sent to the student upon grading.</p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Grading...' : '✅ Grade & Generate Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeModal;
