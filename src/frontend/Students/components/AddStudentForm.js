import { useState } from 'react';

const C = {
  t2: "#6b5b8e",
};

export function AddStudentForm({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', plan: 'free' });
  const uf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="add-student-form">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>Add New Student</div>
          <div style={{ fontSize: '.76rem', color: C.t2 }}>Manually enroll a student to the platform</div>
        </div>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="field-row">
        <div>
          <label className="field-label">Full Name *</label>
          <input className="field-input" placeholder="Aryan Sharma" value={form.name} onChange={e => uf('name', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Email Address *</label>
          <input className="field-input" type="email" placeholder="aryan@gmail.com" value={form.email} onChange={e => uf('email', e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div>
          <label className="field-label">Phone Number</label>
          <input className="field-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => uf('phone', e.target.value)} />
        </div>
        <div>
          <label className="field-label">City</label>
          <input className="field-input" placeholder="Mumbai" value={form.city} onChange={e => uf('city', e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label className="field-label">Plan</label>
        <select className="field-input field-select" value={form.plan} onChange={e => uf('plan', e.target.value)}>
          <option value="free" style={{ background: '#04090f' }}>Free</option>
          <option value="premium" style={{ background: '#04090f' }}>Premium</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-em" onClick={() => form.name && form.email && onSave(form)} style={{ fontSize: '.82rem' }}>+ Add Student</button>
        <button className="btn-sec" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
