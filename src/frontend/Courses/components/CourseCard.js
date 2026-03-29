import { useState, useEffect, useRef } from 'react';
import { C, STATUS_MAP } from '../constants';
import { Stars } from './Stars';

export function CourseCard({ course, onEdit, onView, delay = 0, idx = 0 }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setVis(true), idx * 55);
        obs.disconnect();
      }
    }, { threshold: 0.07 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [idx]);

  const onMM = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    ref.current.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  };

  const sm = STATUS_MAP[course.status];

  return (
    <div
      ref={ref}
      className="course-card"
      onMouseMove={onMM}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity .55s ${idx * 0.06}s, transform .55s ${idx * 0.06}s cubic-bezier(.4,0,.2,1)`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 155, background: course.bg, position: 'relative', overflow: 'hidden' }}>
        {/* Radial accent glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 65% 80% at 30% 40%, ${course.col}28, transparent)`
        }} />
        {/* Bottom fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,.7))'
        }} />
        {/* Big blurred bg icon */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '3.2rem', opacity: 0.16, filter: 'blur(1px)' }}>{course.emoji}</span>
        </div>
        {/* Centered icon box */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -55%)',
          width: 58, height: 58, borderRadius: 15,
          background: `linear-gradient(135deg, ${course.col}1a, ${course.col}36)`,
          border: `1.5px solid ${course.col}44`,
          display: 'grid', placeItems: 'center',
          backdropFilter: 'blur(8px)', zIndex: 2
        }}>
          <span style={{ fontSize: '1.7rem' }}>{course.emoji}</span>
        </div>
        {/* Status badge top-left */}
        <div style={{ position: 'absolute', top: 11, left: 11, zIndex: 3 }}>
          <div className={`badge ${sm.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: sm.dot }} />
            {sm.label}
          </div>
        </div>
        {/* Price badge top-right */}
        <div style={{
          position: 'absolute', top: 11, right: 11, zIndex: 3,
          padding: '3px 8px', borderRadius: 6,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)',
          fontSize: '.63rem', fontWeight: 700,
          color: course.price === 0 ? C.g : C.text,
          border: '1px solid rgba(255,255,255,.08)'
        }}>
          {course.price === 0 ? 'FREE' : `₹${course.price.toLocaleString()}`}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '15px 16px 17px', display: 'flex', flexDirection: 'column', gap: 9, position: 'relative', zIndex: 2 }}>
        {/* Category + duration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="course-cat" style={{
            background: `${course.col}15`,
            border: `1px solid ${course.col}25`,
            color: course.col, margin: 0
          }}>
            {course.cat}
          </div>
          <span style={{ fontSize: '.68rem', color: C.t2 }}>{course.duration}</span>
        </div>

        {/* Title */}
        <div className="course-title" style={{ margin: 0 }}>{course.title}</div>

        {/* Instructor */}
        <div className="course-instructor" style={{ margin: 0 }}>
          <div style={{
            width: 18, height: 18, borderRadius: 5,
            background: 'linear-gradient(135deg,#7c3aff,#00e5ff)',
            display: 'grid', placeItems: 'center',
            fontSize: '.55rem', color: '#fff', fontWeight: 900, flexShrink: 0
          }}>
            {course.instructor[0]}
          </div>
          {course.instructor}
        </div>

        {/* Meta: lessons, students */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '.72rem', color: C.t2, fontFamily: 'DM Mono,monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📚</span>{course.lessons} lessons
          </span>
          <span style={{ fontSize: '.72rem', color: C.t2, fontFamily: 'DM Mono,monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>👥</span>{course.students.toLocaleString()}
          </span>
        </div>

        {/* Rating */}
        {course.status !== 'draft' && course.rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '.8rem', fontWeight: 800, color: C.am }}>{course.rating}</span>
            <Stars val={course.rating} />
          </div>
        )}

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {course.tags.slice(0, 3).map(t => (
              <span key={t} style={{
                padding: '3px 9px', borderRadius: 6, fontSize: '.68rem', fontWeight: 700,
                background: 'rgba(255,255,255,.05)', color: '#8899b8',
                border: '1px solid rgba(255,255,255,.07)'
              }}>{t}</span>
            ))}
          </div>
        )}

        {/* Draft progress bar */}
        {course.status === 'draft' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t2 }}>
              <span>Completion</span>
              <span style={{ color: course.col }}>{course.progress}%</span>
            </div>
            <div className="course-progress-bar">
              <div className="course-progress-fill" style={{
                '--pw': `${course.progress}%`,
                background: `linear-gradient(90deg, ${course.col}, ${C.c})`,
                width: course.progress + '%'
              }} />
            </div>
          </div>
        )}

        <div style={{ height: 1, background: C.bord, margin: '2px 0' }} />

        {/* Footer: revenue + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.68rem', color: C.t2 }}>
            {course.revenue !== '—' ? (
              <span style={{ color: C.am, fontWeight: 700 }}>{course.revenue}</span>
            ) : (
              <span>No revenue yet</span>
            )}
          </div>
          <div className="course-actions" style={{ display: 'flex', gap: 6, opacity: 1 }}>
            <button
              className="btn-icon"
              style={{ width: 30, height: 30, fontSize: '.8rem' }}
              onClick={(e) => { e.stopPropagation(); onView(course); }}
              title="Preview"
            >👁</button>
            <button
              className="btn-icon"
              style={{ width: 30, height: 30, fontSize: '.8rem' }}
              onClick={(e) => { e.stopPropagation(); onEdit(course); }}
              title="Edit"
            >✏</button>
          </div>
        </div>
      </div>
    </div>
  );
}
