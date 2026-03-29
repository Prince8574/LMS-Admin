import { C, STATUS_MAP } from '../constants';

export function TxDrawer({ tx, onClose, onToast }) {
  if (!tx) return null;
  const sm = STATUS_MAP[tx.status];

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="dh">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t3, letterSpacing: '.1em', marginBottom: 5 }}>{tx.id}</div>
              <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.12rem', fontWeight: 700, marginBottom: 6 }}>Transaction Details</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <div className={'badge ' + sm.cls}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: sm.dot }} />
                  {tx.status.toUpperCase()}
                </div>
                <div style={{ padding: '3px 9px', borderRadius: 7, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t2, textTransform: 'capitalize' }}>{tx.type}</div>
              </div>
            </div>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>
          {/* Amount hero */}
          <div style={{ padding: 16, borderRadius: 14, background: 'linear-gradient(135deg,rgba(245,200,66,.07),rgba(13,217,196,.04))', border: '1px solid rgba(245,200,66,.14)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '2rem', fontWeight: 700, color: C.gd }}>₹{tx.amount.toLocaleString()}</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t2, marginTop: 3 }}>GROSS AMOUNT</div>
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="ds">
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', letterSpacing: '.1em', color: C.t3, textTransform: 'uppercase', marginBottom: 12 }}>Fee Breakdown</div>
          {[
            { l: 'Gross Amount', v: '₹' + tx.amount.toLocaleString(), c: C.gd, bold: false },
            { l: 'Platform Fee (' + Math.round(tx.fee / tx.amount * 100) + '%)', v: '– ₹' + tx.fee.toLocaleString(), c: C.cr, bold: false },
            { l: 'Net to Instructor', v: '₹' + tx.net.toLocaleString(), c: C.tl, bold: true },
          ].map(({ l, v, c, bold }) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div style={{ fontSize: '.84rem', color: bold ? C.text : C.t2, fontWeight: bold ? 700 : 400 }}>{l}</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.84rem', color: c, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="ds">
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', letterSpacing: '.1em', color: C.t3, textTransform: 'uppercase', marginBottom: 12 }}>Details</div>
          {[
            { ico: '👤', l: 'Student', v: tx.student || tx.studentName },
            { ico: '📚', l: 'Course', v: tx.course || tx.courseTitle },
            { ico: '💳', l: 'Payment Method', v: tx.method },
            { ico: '⏱', l: 'Time', v: tx.time || (tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : '—') },
            { ico: '🔑', l: 'Transaction ID', v: tx.id || tx.txId },
          ].map(({ ico, l, v }) => (
            <div key={l} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', display: 'grid', placeItems: 'center', fontSize: '.78rem', flexShrink: 0 }}>{ico}</div>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.58rem', color: C.t3, textTransform: 'uppercase', marginBottom: 1 }}>{l}</div>
                <div style={{ fontSize: '.84rem', fontWeight: 500 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '18px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,.06)', position: 'sticky', bottom: 0, background: 'rgba(4,7,15,.98)', backdropFilter: 'blur(20px)' }}>
          <button className="btn-primary" style={{ fontSize: '.78rem', padding: '8px 16px' }} onClick={() => onToast('Receipt downloaded!')}>📥 Download Receipt</button>
          <button className="btn-sec" style={{ fontSize: '.78rem', padding: '8px 14px' }} onClick={() => onToast('ID copied!')}>📋 Copy ID</button>
          {tx.status === 'success' && <button className="btn-danger" style={{ fontSize: '.78rem', padding: '8px 14px', marginLeft: 'auto' }} onClick={() => { onToast('Refund initiated!'); onClose(); }}>↩ Refund</button>}
          {tx.status === 'failed' && <button className="btn-sec" style={{ fontSize: '.78rem', padding: '8px 14px', marginLeft: 'auto', borderColor: 'rgba(13,217,196,.3)', color: C.tl }} onClick={() => { onToast('Retry successful!'); onClose(); }}>↻ Retry</button>}
        </div>
      </div>
    </>
  );
}
