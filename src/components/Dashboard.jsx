import ModelCard from './ModelCard'
import ResultBanner from './ResultBanner'

export default function Dashboard({ results, inputs, geminiText, geminiLoading, geminiError }) {
  const safePicks   = results.filter(r => r.prediction === 1)
  const unsafePicks = results.filter(r => r.prediction === 0)
  const bestModel   = [...results].sort((a, b) => b.accuracy - a.accuracy)[0]
  const sorted      = [...results].sort((a, b) => b.accuracy - a.accuracy)

  return (
    <div>

      {/* Result Banner */}
      <div style={{ marginBottom: '24px' }}>
        <ResultBanner results={results} />
      </div>

      {/* Summary strip */}
      <div
        className="summary-strip"
        style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}
      >
        <div className="card" style={{ flex: 1, minWidth: '120px', textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--accent)' }}>
            {safePicks.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase' }}>
            Safe Votes
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '120px', textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--danger)' }}>
            {unsafePicks.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase' }}>
            Not Safe Votes
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '120px', textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--blue)' }}>
            {results.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase' }}>
            Total Models
          </div>
        </div>
        <div className="card" style={{ flex: 2, minWidth: '160px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--warning)' }}>
            {bestModel.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase' }}>
            Best Accuracy — {bestModel.accuracy}%
          </div>
        </div>
      </div>

      {/* ── Gemini AI Analysis ── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            background: '#e8f4fd', color: '#1971c2',
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '11px', fontWeight: '700',
          }}>
            ✦ Gemini AI
          </div>
          <h3 style={{ margin: 0 }}>Expert Analysis</h3>
        </div>

        {geminiLoading && (
          <div style={{ color: 'var(--text2)', fontSize: '13px' }}>
            Analyzing water sample...
          </div>
        )}

        {geminiError && (
          <div style={{ color: 'var(--danger)', fontSize: '13px' }}>
            {geminiError}
          </div>
        )}

        {geminiText && (
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text)', margin: 0 }}>
            {geminiText}
          </p>
        )}
      </div>

      {/* ── Accuracy Comparison ── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Model Accuracy Comparison</h3>
        {sorted.map(r => (
          <div key={r.name} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>
                {r.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`tag ${r.prediction === 1 ? 'safe' : 'unsafe'}`}>
                  {r.prediction === 1 ? 'Safe' : 'Not Safe'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '40px', textAlign: 'right' }}>
                  {r.accuracy}%
                </span>
              </div>
            </div>
            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${r.accuracy}%`,
                  background: r.prediction === 1 ? 'var(--accent)' : 'var(--danger)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Confusion Matrices ── */}
      <div style={{ marginBottom: '8px' }}>
        <h3 style={{ marginBottom: '16px' }}>Confusion Matrices</h3>
        <div className="grid-3">
          {results.map(r => (
            <ModelCard key={r.name} model={r} />
          ))}
        </div>
      </div>

    </div>
  )
}