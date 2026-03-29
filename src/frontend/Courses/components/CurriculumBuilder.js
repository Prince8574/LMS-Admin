import { useState } from 'react';
import { C, TYPE_ICONS, TYPE_COLORS } from '../constants';

export function CurriculumBuilder({ sections, setSections }) {
  const [newLessonSec, setNewLessonSec] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newSecTitle, setNewSecTitle] = useState('');

  const toggleSection = (id) =>
    setSections(ss => ss.map(s => s.id === id ? { ...s, open: !s.open } : s));

  const addSection = () => {
    if (!newSecTitle.trim()) return;
    setSections(ss => [...ss, { id: Date.now(), title: newSecTitle, open: true, lessons: [] }]);
    setNewSecTitle('');
  };

  const addLesson = (secId) => {
    if (!newLessonTitle.trim()) return;
    setSections(ss => ss.map(s =>
      s.id === secId
        ? {
          ...s,
          lessons: [...s.lessons, {
            id: Date.now(),
            type: newLessonType,
            title: newLessonTitle,
            dur: '—',
            free: false
          }]
        }
        : s
    ));
    setNewLessonTitle('');
    setNewLessonSec(null);
  };

  const deleteLesson = (secId, lessonId) =>
    setSections(ss => ss.map(s =>
      s.id === secId
        ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
        : s
    ));

  const deleteSection = (id) => setSections(ss => ss.filter(s => s.id !== id));

  const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0);

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Sections', val: sections.length, col: C.v },
          { label: 'Lessons', val: totalLessons, col: C.c },
          { label: 'Est. Duration', val: '~' + (totalLessons * 12) + 'm', col: C.am },
        ].map(({ label, val, col }) => (
          <div
            key={label}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              background: `${col}0e`,
              border: `1px solid ${col}22`,
              fontFamily: 'DM Mono,monospace',
              fontSize: '.7rem'
            }}
          >
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: col,
              fontFamily: 'Clash Display,sans-serif'
            }}>
              {val}
            </div>
            <div style={{ color: C.t2, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Sections */}
      {sections.map((sec, si) => (
        <div
          key={sec.id}
          className="section-block"
          style={{ animationDelay: `${si * .05}s` }}
        >
          <div className="section-header" onClick={() => toggleSection(sec.id)}>
            <div className="drag-handle">⠿</div>
            <span style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '.62rem',
              color: C.v,
              marginRight: 2
            }}>
              S{si + 1}
            </span>
            <div style={{ flex: 1, fontWeight: 600, fontSize: '.88rem' }}>
              {sec.title}
            </div>
            <span style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '.62rem',
              color: C.t2
            }}>
              {sec.lessons.length} lessons
            </span>
            <button
              className="btn-icon"
              style={{ width: 28, height: 28 }}
              onClick={e => {
                e.stopPropagation();
                deleteSection(sec.id);
              }}
            >
              🗑
            </button>
            <span style={{
              color: C.t2,
              fontSize: '.8rem',
              transition: 'transform .22s',
              transform: sec.open ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▾
            </span>
          </div>

          {sec.open && (
            <div>
              {sec.lessons.map((lesson, li) => (
                <div
                  key={lesson.id}
                  className="lesson-item"
                  style={{ animationDelay: `${li * .04}s` }}
                >
                  <div className="drag-handle lesson-drag">⠿</div>
                  <div
                    className="lesson-type-icon"
                    style={{
                      background: `${TYPE_COLORS[lesson.type]}14`,
                      border: `1px solid ${TYPE_COLORS[lesson.type]}22`,
                      color: TYPE_COLORS[lesson.type]
                    }}
                  >
                    {TYPE_ICONS[lesson.type]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.82rem', fontWeight: 500 }}>
                      {lesson.title}
                    </div>
                    <div style={{
                      fontFamily: 'DM Mono,monospace',
                      fontSize: '.6rem',
                      color: C.t2,
                      marginTop: 2
                    }}>
                      {lesson.type.toUpperCase()} · {lesson.dur}
                      {lesson.free && (
                        <span style={{ marginLeft: 8, color: C.g }}>FREE PREVIEW</span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', gap: 6, opacity: 0, transition: 'opacity .2s' }}
                    className="lesson-actions"
                  >
                    <button
                      className="btn-icon"
                      style={{ width: 26, height: 26, fontSize: '.75rem' }}
                    >
                      ✏
                    </button>
                    <button
                      className="btn-icon"
                      style={{ width: 26, height: 26, fontSize: '.75rem' }}
                      onClick={() => deleteLesson(sec.id, lesson.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Add lesson */}
              {newLessonSec === sec.id ? (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(124,58,255,.04)',
                  borderTop: '1px solid rgba(124,58,255,.1)'
                }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    {Object.entries(TYPE_ICONS).map(([type, ico]) => (
                      <button
                        key={type}
                        onClick={() => setNewLessonType(type)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 8,
                          border: '1px solid',
                          fontSize: '.7rem',
                          background: newLessonType === type ? `${TYPE_COLORS[type]}18` : 'transparent',
                          borderColor: newLessonType === type ? TYPE_COLORS[type] : 'rgba(255,255,255,.08)',
                          color: newLessonType === type ? TYPE_COLORS[type] : C.t2
                        }}
                      >
                        {ico} {type}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="form-input"
                      placeholder="Lesson title…"
                      value={newLessonTitle}
                      onChange={e => setNewLessonTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addLesson(sec.id)}
                      style={{ flex: 1, padding: '8px 12px' }}
                      autoFocus
                    />
                    <button
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '.78rem' }}
                      onClick={() => addLesson(sec.id)}
                    >
                      Add
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '8px 14px' }}
                      onClick={() => setNewLessonSec(null)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNewLessonSec(sec.id);
                    setNewLessonTitle('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    color: C.t2,
                    fontSize: '.78rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderTop: '1px solid rgba(255,255,255,.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    transition: 'color .2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.v2}
                  onMouseLeave={e => e.currentTarget.style.color = C.t2}
                >
                  <span style={{ fontSize: '1rem' }}>+</span> Add Lesson
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add section */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          className="form-input"
          placeholder="New section title…"
          value={newSecTitle}
          onChange={e => setNewSecTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSection()}
        />
        <button
          className="btn-primary"
          onClick={addSection}
          style={{ whiteSpace: 'nowrap', padding: '10px 18px', fontSize: '.8rem' }}
        >
          + Section
        </button>
      </div>
    </div>
  );
}
