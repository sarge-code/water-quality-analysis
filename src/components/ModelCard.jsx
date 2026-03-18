export default function ModelCard({ model }) {
  const {
    name, prediction, probability,
    accuracy, precision, recall, f1,
    confusion_matrix: cm,
  } = model

  const isSafe = prediction === 1

  return (
    <div className={`model-card ${isSafe ? 'predicted-safe' : 'predicted-unsafe'}`}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div className="model-name">{name}</div>
        <span className={`tag ${isSafe ? 'safe' : 'unsafe'}`}>
          {isSafe ? '✓ Safe' : '✗ Not Safe'}
        </span>
      </div>

      {/* Probability bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Safe Probability
          </span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: isSafe ? 'var(--accent)' : 'var(--danger)' }}>
            {probability}%
          </span>
        </div>
        <div className="progress">
          <div
            className="progress-fill"
            style={{
              width: `${probability}%`,
              background: isSafe ? 'var(--accent)' : 'var(--danger)',
            }}
          />
        </div>
      </div>

      <hr className="divider" />

      {/* Metrics */}
      <div className="model-metrics">
        <div className="metric">ACC <span>{accuracy}%</span></div>
        <div className="metric">PRE <span>{precision}%</span></div>
        <div className="metric">REC <span>{recall}%</span></div>
        <div className="metric">F1 <span>{f1}%</span></div>
      </div>

      {/* Confusion Matrix */}
      {cm && (
        <>
          <div style={{
            fontSize: '11px',
            color: 'var(--text)',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            Confusion Matrix
          </div>
          <div className="cm-grid">
            <div className="cm-cell tn">
              <span className="cm-value">{cm.tn}</span>
              True Not Safe
            </div>
            <div className="cm-cell fp">
              <span className="cm-value">{cm.fp}</span>
              False Safe
            </div>
            <div className="cm-cell fn">
              <span className="cm-value">{cm.fn}</span>
              False Not Safe
            </div>
            <div className="cm-cell tp">
              <span className="cm-value">{cm.tp}</span>
              True Safe
            </div>
          </div>
        </>
      )}
    </div>
  )
}