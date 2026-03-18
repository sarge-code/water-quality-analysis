export default function ResultBanner({ results }) {
  const votes     = results.reduce((acc, r) => acc + r.prediction, 0)
  const total     = results.length
  const isSafe    = votes > total / 2
  const avgProb = Math.round(
  results.reduce((a, r) => a + (isNaN(r.probability) ? 0 : r.probability), 0) / total
)
  const confidence = Math.round((Math.max(votes, total - votes) / total) * 100)

  return (
    <div className={`result-banner ${isSafe ? 'safe' : 'unsafe'}`}>

      {/* Icon */}
      <span className="result-icon">{isSafe ? '💧' : '⚠️'}</span>

      {/* Verdict */}
      <div className="result-title" style={{ color: isSafe ? 'var(--accent)' : 'var(--danger)' }}>
        {isSafe ? 'Good Quality' : 'Bad Quality'}
      </div>
      <div className="result-sub">
        {votes} of {total} models predict safe to drink
      </div>

      <hr className="divider" style={{ margin: '16px 0' }} />

      {/* Stats row */}
      <div 
      className="result-stats"
      style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: isSafe ? 'var(--accent)' : 'var(--danger)' }}>
            {avgProb}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text2)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Avg Probability
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)' }}>
            {confidence}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text2)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Model Agreement
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)' }}>
            {votes}/{total}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text2)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Votes Safe
          </div>
        </div>
      </div>

      {/* Model vote breakdown */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {results.map(r => (
          <span
            key={r.name}
            className={`tag ${r.prediction === 1 ? 'safe' : 'unsafe'}`}
            title={`${r.name}: ${r.probability}%`}
          >
            {r.name.split(' ')[0]}
          </span>
        ))}
      </div>
    </div>
  )
}