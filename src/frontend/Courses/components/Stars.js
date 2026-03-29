import { C } from '../constants';

export function Stars({ n = 5, val = 4.8 }) {
  return (
    <div className="rating-stars">
      {[...Array(n)].map((_, i) => (
        <span
          key={i}
          style={{
            color: i < Math.round(val) ? C.am : '#1e2d40',
            fontSize: '.72rem'
          }}
        >
          ★
        </span>
      ))}
      <span
        style={{
          fontFamily: 'DM Mono,monospace',
          fontSize: '.65rem',
          color: C.t2,
          marginLeft: 4
        }}
      >
        {val || '—'}
      </span>
    </div>
  );
}
