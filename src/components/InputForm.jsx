import weights from '../data/model_weights.json'
import { useState } from 'react'

const FIELDS = [
  { key: 'ph',              label: 'pH',               unit: '0 – 14',  placeholder: '7.0'   },
  { key: 'Hardness',        label: 'Hardness',         unit: 'mg/L',    placeholder: '196.4' },
  { key: 'Solids',          label: 'Solids',           unit: 'ppm',     placeholder: '22014' },
  { key: 'Chloramines',     label: 'Chloramines',      unit: 'ppm',     placeholder: '7.1'   },
  { key: 'Sulfate',         label: 'Sulfate',          unit: 'mg/L',    placeholder: '333.6' },
  { key: 'Conductivity',    label: 'Conductivity',     unit: 'μS/cm',   placeholder: '426.2' },
  { key: 'Organic_carbon',  label: 'Organic Carbon',   unit: 'ppm',     placeholder: '14.3'  },
  { key: 'Trihalomethanes', label: 'Trihalomethanes',  unit: 'μg/L',    placeholder: '66.4'  },
  { key: 'Turbidity',       label: 'Turbidity',        unit: 'NTU',     placeholder: '3.97'  },
]

export default function InputForm({ onPredict, loading }) {
  const [values, setValues] = useState({})

  function handleChange(key, val) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onPredict(values)
  }

  function handleReset() {
    setValues({})
  }

  function fillSample(type) {
  const samples = type === 'safe'
    ? weights.safe_samples
    : weights.unsafe_samples

  const random = samples[Math.floor(Math.random() * samples.length)]
  const filled = {}
  weights.features.forEach((feat, i) => {
    filled[feat] = String(random[i])
  })
  setValues(filled)
}

  return (
    <form onSubmit={handleSubmit}>

      {/* Sample buttons */}
      <div 
      className="sample-buttons"
      style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button type="button" className="btn-safe" onClick={() => fillSample('safe')}>
          ↓ Load Safe Sample
        </button>
        <button type="button" className="btn-unsafe" onClick={() => fillSample('unsafe')}>
          ↓ Load Unsafe Sample
        </button>
      </div>

      {/* Input grid */}
      <div className="grid-3" style={{ marginBottom: '20px' }}>
        {FIELDS.map(({ key, label, unit, placeholder }) => (
          <div className="input-group" key={key}>
            <label>{label}</label>
            <input
              type="number"
              step="any"
              placeholder={placeholder}
              value={values[key] || ''}
              onChange={e => handleChange(key, e.target.value)}
            />
            <span className="hint" style={{ color: 'var(--text2)', fontWeight: '500' }}>
              {unit}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Analyzing...' : '▶ Run All Models'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '11px 20px',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--font)',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: 'var(--radius)',
            whiteSpace: 'nowrap',
          }}
        >
          Reset
        </button>
      </div>
    </form>
  )
}