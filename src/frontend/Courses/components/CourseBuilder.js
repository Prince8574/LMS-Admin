import { useState } from 'react';
import { C, GR, BUILDER_STEPS, defaultSections } from '../constants';
import { CurriculumBuilder } from './CurriculumBuilder';
import { courseService } from '../courseService';

export function CourseBuilder({ onClose, editCourse = null, onSaved }) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState(defaultSections);
  const [skillInput, setSkillInput] = useState('');
  const [pricingModel, setPricingModel] = useState('paid');
  const [mediaType, setMediaType] = useState('video');
  const [thumbnail, setThumbnail] = useState(null);
  const [promoVideo, setPromoVideo] = useState(null);
  const [form, setForm] = useState({
    title: editCourse?.title || '',
    subtitle: '',
    description: '',
    category: editCourse?.cat || 'Development',
    level: 'Beginner',
    language: 'Hindi + English',
    price: editCourse?.price || '',
    skills: [],
    certificate: true,
    lifetime: true,
    downloadable: true,
  });

  const updateForm = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = () => {
    if (!skillInput.trim() || form.skills.includes(skillInput)) return;
    updateForm('skills', [...form.skills, skillInput.trim()]);
    setSkillInput('');
  };

  const removeSkill = (s) => updateForm('skills', form.skills.filter(x => x !== s));

  const handleSave = async (isPublished = true) => {
    if (!form.title || !form.description || !form.category) {
      setError('Title, description aur category required hai.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level.toLowerCase(),
        price: pricingModel === 'free' ? 0 : parseFloat(form.price) || 0,
        duration: form.language,
        thumbnail: thumbnail ? thumbnail.name : '',
        isPublished,
      };
      let result;
      if (editCourse?._id) {
        result = await courseService.update(editCourse._id, payload);
      } else {
        result = await courseService.create(payload);
      }
      if (!result.success) throw new Error(result.message || 'Kuch galat hua');
      setSaved(true);
      onSaved && onSaved(result.data);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    /* Step 0 — Basic Info */
    <div key="basic" style={{ animation: 'builderSlide .35s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="form-group">
          <label className="form-label">Course Title *</label>
          <input
            className="form-input"
            placeholder="e.g. Complete React Developer 2026"
            value={form.title}
            onChange={e => updateForm('title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Subtitle</label>
          <input
            className="form-input"
            placeholder="Short compelling description shown in search results"
            value={form.subtitle}
            onChange={e => updateForm('subtitle', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Describe what students will learn…"
            value={form.description}
            onChange={e => updateForm('description', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-input form-select"
              value={form.category}
              onChange={e => updateForm('category', e.target.value)}
            >
              {['Development', 'Design', 'Data Science', 'Business', 'Cloud & DevOps', 'Marketing'].map(c => (
                <option key={c} style={{ background: '#06090f' }}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Level</label>
            <select
              className="form-input form-select"
              value={form.level}
              onChange={e => updateForm('level', e.target.value)}
            >
              {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(l => (
                <option key={l} style={{ background: '#06090f' }}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="form-group">
        <label className="form-label">What will students learn?</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            className="form-input"
            placeholder="Add a skill or topic…"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            style={{ flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={addSkill}
            style={{ padding: '10px 16px', fontSize: '.8rem' }}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {form.skills.map((s, i) => (
            <div
              key={s}
              className="skill-pill"
              style={{ animationDelay: `${i * .05}s` }}
            >
              {s}
              <button onClick={() => removeSkill(s)}>✕</button>
            </div>
          ))}
          {form.skills.length === 0 && (
            <span style={{
              color: C.t3,
              fontSize: '.78rem',
              fontFamily: 'DM Mono,monospace'
            }}>
              No skills added yet…
            </span>
          )}
        </div>
      </div>

      {/* Language */}
      <div className="form-group">
        <label className="form-label">Language</label>
        <select
          className="form-input form-select"
          value={form.language}
          onChange={e => updateForm('language', e.target.value)}
        >
          {['Hindi + English', 'English', 'Hindi', 'Tamil', 'Telugu', 'Marathi'].map(l => (
            <option key={l} style={{ background: '#06090f' }}>{l}</option>
          ))}
        </select>
      </div>
    </div>,

    /* Step 1 — Curriculum */
    <div key="curriculum" style={{ animation: 'builderSlide .35s ease' }}>
      <CurriculumBuilder sections={sections} setSections={setSections} />
    </div>,

    /* Step 2 — Media */
    <div key="media" style={{ animation: 'builderSlide .35s ease' }}>
      <div className="form-group">
        <label className="form-label">Primary Content Type</label>
        <div className="media-types" style={{ marginBottom: 20 }}>
          {[
            { id: 'video', ico: '🎬', label: 'VIDEO' },
            { id: 'live', ico: '🔴', label: 'LIVE' },
            { id: 'doc', ico: '📄', label: 'DOCUMENT' },
            { id: 'audio', ico: '🎙️', label: 'AUDIO' },
            { id: 'mixed', ico: '⚡', label: 'MIXED' },
          ].map(({ id, ico, label }) => (
            <div
              key={id}
              className={`media-type${mediaType === id ? ' selected' : ''}`}
              onClick={() => setMediaType(id)}
            >
              <div className="media-type-icon">{ico}</div>
              <div className="media-type-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Course Thumbnail</label>
        <label className="upload-zone" style={{ cursor: 'pointer', display: 'block' }}>
          <input
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/gif"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files[0];
              if (file && file.size <= 2 * 1024 * 1024) setThumbnail(file);
              else if (file) alert('Max file size is 2MB');
            }}
          />
          {thumbnail ? (
            <div style={{ textAlign: 'center' }}>
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="thumbnail preview"
                style={{ maxHeight: 140, borderRadius: 10, marginBottom: 8, objectFit: 'cover' }}
              />
              <div style={{ fontSize: '.78rem', color: C.g }}>{thumbnail.name}</div>
              <div style={{ fontSize: '.72rem', color: C.t2, marginTop: 4 }}>Click to change</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🖼️</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Drop image here or click to browse</div>
              <div style={{ color: C.t2, fontSize: '.78rem' }}>PNG, JPG, GIF · Max 2MB · Recommended 1280×720</div>
            </>
          )}
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Promo Video (Optional)</label>
        <label className="upload-zone" style={{ cursor: 'pointer', display: 'block' }}>
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files[0];
              if (file && file.size <= 500 * 1024 * 1024) setPromoVideo(file);
              else if (file) alert('Max file size is 500MB');
            }}
          />
          {promoVideo ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎬</div>
              <div style={{ fontSize: '.78rem', color: C.g }}>{promoVideo.name}</div>
              <div style={{ fontSize: '.72rem', color: C.t2, marginTop: 4 }}>Click to change</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>▶️</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Upload a 2–3 minute promo video</div>
              <div style={{ color: C.t2, fontSize: '.78rem' }}>MP4, MOV · Max 500MB · Min 720p</div>
            </>
          )}
        </label>
      </div>

      {/* Course settings toggles */}
      <div style={{
        background: 'rgba(8,12,22,.98)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,.07)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        {[
          { key: 'certificate', label: 'Completion Certificate', sub: 'Students receive certificate on completion' },
          { key: 'lifetime', label: 'Lifetime Access', sub: 'Students get lifetime access after purchase' },
          { key: 'downloadable', label: 'Downloadable Resources', sub: 'Students can download attached files' },
        ].map(({ key, label, sub }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '.84rem', fontWeight: 600, marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: '.72rem', color: C.t2 }}>{sub}</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={e => updateForm(key, e.target.checked)}
              />
              <div className="toggle-slider" />
            </label>
          </div>
        ))}
      </div>
    </div>,

    /* Step 3 — Pricing */
    <div key="pricing" style={{ animation: 'builderSlide .35s ease' }}>
      <div className="pricing-toggle">
        {[
          { id: 'free', l: 'Free' },
          { id: 'paid', l: 'Paid' },
          { id: 'subscription', l: 'Subscription' }
        ].map(({ id, l }) => (
          <div
            key={id}
            className={`pricing-opt${pricingModel === id ? ' active' : ''}`}
            onClick={() => setPricingModel(id)}
          >
            {l}
          </div>
        ))}
      </div>

      {pricingModel === 'paid' && (
        <div>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Regular Price (₹)</label>
              <div className="input-prefix">
                <span className="input-prefix-symbol">₹</span>
                <input
                  className="form-input"
                  type="number"
                  placeholder="4999"
                  value={form.price}
                  onChange={e => updateForm('price', e.target.value)}
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sale Price (₹) — Optional</label>
              <div className="input-prefix">
                <span className="input-prefix-symbol">₹</span>
                <input
                  className="form-input"
                  type="number"
                  placeholder="2999"
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>
          </div>

          {/* Revenue preview */}
          <div style={{
            padding: 18,
            borderRadius: 14,
            background: 'linear-gradient(135deg,rgba(0,255,136,.05),rgba(124,58,255,.05))',
            border: '1px solid rgba(0,255,136,.12)',
            marginBottom: 20
          }}>
            <div style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '.62rem',
              color: C.t2,
              marginBottom: 10
            }}>
              REVENUE FORECAST (30 days)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12
            }}>
              {[
                { label: '10 students', val: `₹${(form.price * 10 * .8 / 1000).toFixed(1)}K` },
                { label: '50 students', val: `₹${(form.price * 50 * .8 / 1000).toFixed(1)}K` },
                { label: '100 students', val: `₹${(form.price * 100 * .8 / 1000).toFixed(1)}K` },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'Clash Display,sans-serif',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: C.g
                  }}>
                    {val || '—'}
                  </div>
                  <div style={{ fontSize: '.7rem', color: C.t2, marginTop: 2 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 10,
              fontSize: '.72rem',
              color: C.t3,
              fontFamily: 'DM Mono,monospace'
            }}>
              * After 20% platform fee. Actual earnings may vary.
            </div>
          </div>
        </div>
      )}

      {pricingModel === 'free' && (
        <div style={{
          padding: 24,
          borderRadius: 14,
          textAlign: 'center',
          background: 'rgba(0,255,136,.05)',
          border: '1px solid rgba(0,255,136,.15)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎁</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Free Course</div>
          <div style={{ color: C.t2, fontSize: '.84rem' }}>
            This course will be available for free to all learners. Great for building an audience!
          </div>
        </div>
      )}

      {pricingModel === 'subscription' && (
        <div style={{
          padding: 18,
          borderRadius: 14,
          background: 'rgba(124,58,255,.06)',
          border: '1px solid rgba(124,58,255,.18)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Subscription Bundle</div>
          <div style={{ color: C.t2, fontSize: '.84rem', marginBottom: 12 }}>
            This course will be part of the LearnVerse Pro subscription (₹999/mo).
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: C.g,
              animation: 'dotBlink 2s infinite'
            }} />
            <span style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '.68rem',
              color: C.g
            }}>
              3,240 active subscribers will get instant access
            </span>
          </div>
        </div>
      )}
    </div>,

    /* Step 4 — Publish */
    <div key="publish" style={{ animation: 'builderSlide .35s ease', textAlign: 'center', paddingTop: 20 }}>
      {saved ? (
        <div>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(0,255,136,.1)',
            border: '2px solid rgba(0,255,136,.3)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 20px',
            fontSize: '2rem',
            animation: 'pulse 2s infinite'
          }}>
            ✓
          </div>
          <div style={{
            fontFamily: 'Clash Display,sans-serif',
            fontSize: '1.4rem',
            fontWeight: 700,
            marginBottom: 8
          }}>
            Course Saved!
          </div>
          <div style={{ color: C.t2 }}>Redirecting back to courses…</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚀</div>
          <div style={{
            fontFamily: 'Clash Display,sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            marginBottom: 10
          }}>
            Ready to {editCourse ? 'update' : 'launch'} your course?
          </div>
          <div style={{
            color: C.t2,
            fontSize: '.9rem',
            maxWidth: 420,
            margin: '0 auto 28px',
            lineHeight: 1.7
          }}>
            Review your course details before publishing. You can always edit after publishing.
          </div>

          {/* Checklist */}
          <div style={{
            background: 'rgba(8,12,22,.98)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,.07)',
            padding: 20,
            textAlign: 'left',
            marginBottom: 24
          }}>
            {[
              { label: 'Course title & description', ok: !!form.title },
              { label: 'Curriculum sections & lessons', ok: sections.some(s => s.lessons.length > 0) },
              { label: 'Course thumbnail', ok: !!thumbnail },
              { label: 'Pricing set', ok: pricingModel === 'free' || !!form.price },
            ].map(({ label, ok }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,.04)'
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: ok ? 'rgba(0,255,136,.15)' : 'rgba(255,170,0,.1)',
                  border: `1px solid ${ok ? 'rgba(0,255,136,.3)' : 'rgba(255,170,0,.25)'}`,
                  fontSize: '.7rem',
                  color: ok ? C.g : C.am
                }}>
                  {ok ? '✓' : '!'}
                </div>
                <span style={{ fontSize: '.84rem', color: ok ? C.text : C.t2 }}>
                  {label}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'DM Mono,monospace',
                  fontSize: '.65rem',
                  color: ok ? C.g : C.am
                }}>
                  {ok ? 'DONE' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn-secondary" style={{ padding: '11px 24px' }} onClick={() => handleSave(false)} disabled={loading}>
              {loading ? 'Saving…' : 'Save as Draft'}
            </button>
            <button
              className="btn-primary"
              onClick={() => handleSave(true)}
              disabled={loading}
              style={{ padding: '11px 28px', fontSize: '.9rem' }}
            >
              {loading ? '⏳ Publishing…' : '🚀 Publish Course'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 14, color: C.r, fontSize: '.82rem', textAlign: 'center' }}>
              ⚠ {error}
            </div>
          )}
        </div>
      )}
    </div>,
  ];

  return (
    <div className="builder-overlay">
      {/* Builder Sidebar */}
      <div className="builder-sidebar">
        {/* Header */}
        <div style={{
          padding: '18px 16px',
          borderBottom: '1px solid rgba(255,255,255,.07)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: GR.v,
              display: 'grid',
              placeItems: 'center',
              fontSize: '.75rem',
              color: '#fff'
            }}>
              ⬡
            </div>
            <div style={{
              fontFamily: 'Clash Display,sans-serif',
              fontSize: '.9rem',
              fontWeight: 700
            }}>
              Course Builder
            </div>
          </div>
          <div style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: '.6rem',
            color: C.t3,
            letterSpacing: '.1em'
          }}>
            {editCourse ? 'EDITING COURSE' : 'NEW COURSE'}
          </div>
        </div>

        {/* Steps nav */}
        <div style={{ padding: '8px 10px' }}>
          {BUILDER_STEPS.map((s, i) => (
            <div
              key={s}
              onClick={() => setStep(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 11,
                cursor: 'pointer',
                background: step === i ? 'rgba(124,58,255,.12)' : 'transparent',
                border: step === i ? '1px solid rgba(124,58,255,.22)' : '1px solid transparent',
                marginBottom: 2,
                transition: 'all .2s'
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'DM Mono,monospace',
                fontSize: '.65rem',
                fontWeight: 700,
                background: i < step ? 'rgba(0,255,136,.15)' : step === i ? '#7c3aff' : 'rgba(255,255,255,.06)',
                border: `1.5px solid ${i < step ? 'rgba(0,255,136,.4)' : step === i ? '#7c3aff' : 'rgba(255,255,255,.1)'}`,
                color: i < step ? C.g : step === i ? '#fff' : C.t3,
                boxShadow: step === i ? '0 0 12px rgba(124,58,255,.6)' : 'none',
              }}>
                {i < step ? '✓' : (i + 1)}
              </div>
              <div>
                <div style={{
                  fontSize: '.8rem',
                  fontWeight: 600,
                  color: step === i ? C.text : i < step ? C.t2 : C.t3
                }}>
                  {s}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course summary */}
        {form.title && (
          <div style={{
            margin: 'auto 10px 10px',
            padding: 14,
            borderRadius: 14,
            background: 'rgba(124,58,255,.07)',
            border: '1px solid rgba(124,58,255,.15)'
          }}>
            <div style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '.58rem',
              color: C.t3,
              marginBottom: 6,
              letterSpacing: '.1em'
            }}>
              COURSE PREVIEW
            </div>
            <div style={{
              fontWeight: 600,
              fontSize: '.82rem',
              marginBottom: 4,
              lineHeight: 1.3
            }}>
              {form.title || 'Untitled Course'}
            </div>
            <div style={{ fontSize: '.72rem', color: C.t2 }}>
              {form.category} · {form.level}
            </div>
          </div>
        )}
      </div>

      {/* Builder Main */}
      <div className="builder-main">
        {/* Top bar */}
        <div className="builder-topbar">
          <button className="btn-icon" onClick={onClose} title="Close">
            ✕
          </button>
          <div style={{
            fontFamily: 'Clash Display,sans-serif',
            fontWeight: 700,
            fontSize: '1rem'
          }}>
            {editCourse ? `Editing: ${editCourse.title}` : 'New Course'}
          </div>
          <div style={{ flex: 1 }} />

          {/* Step progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {BUILDER_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 24 : 8,
                  height: 4,
                  borderRadius: 99,
                  transition: 'all .3s',
                  background: i < step ? C.g : i === step ? C.v : 'rgba(255,255,255,.1)'
                }}
              />
            ))}
          </div>

          <div style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: '.65rem',
            color: C.t2
          }}>
            {step + 1} / {BUILDER_STEPS.length}
          </div>

          <button
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '.78rem' }}
            onClick={() => { }}
          >
            Save Draft
          </button>
        </div>

        {/* Content */}
        <div className="builder-canvas">
          {/* Step label */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: C.v,
                animation: 'dotBlink 2s infinite'
              }} />
              <div style={{
                fontFamily: 'DM Mono,monospace',
                fontSize: '.62rem',
                color: C.v,
                letterSpacing: '.1em'
              }}>
                STEP {step + 1} OF {BUILDER_STEPS.length}
              </div>
            </div>
            <div style={{
              fontFamily: 'Clash Display,sans-serif',
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '-.03em'
            }}>
              {BUILDER_STEPS[step]}
            </div>
          </div>

          {stepContent[step]}

          {/* Navigation */}
          {!saved && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,.06)'
            }}>
              <button
                className="btn-secondary"
                onClick={() => setStep(s => Math.max(0, s - 1))}
                style={{
                  visibility: step > 0 ? 'visible' : 'hidden',
                  padding: '10px 20px'
                }}
              >
                ← Back
              </button>

              {step < BUILDER_STEPS.length - 1 ? (
                <button
                  className="btn-primary"
                  onClick={() => setStep(s => Math.min(BUILDER_STEPS.length - 1, s + 1))}
                  style={{ padding: '10px 24px', fontSize: '.88rem' }}
                >
                  Continue →
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
