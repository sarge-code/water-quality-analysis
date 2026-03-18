import { useState } from 'react'
import InputForm from './components/InputForm'
import Dashboard from './components/Dashboard'
import { predictAll } from './utils/predict'
import { getGeminiAnalysis } from './utils/gemini'
import weights from './data/model_weights.json'

export default function App() {
  const [results, setResults] = useState(null)
  const [inputs, setInputs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [geminiText, setGeminiText] = useState('')
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [geminiError, setGeminiError] = useState(null)

  function handlePredict(inputValues) {
    setLoading(true)
    setInputs(inputValues)
    setGeminiText('')
    setGeminiError(null)
    setGeminiLoading(true)

    setTimeout(() => {
      const output = predictAll(inputValues, weights)
      setResults(output)
      setLoading(false)

      // Call Gemini after models run
      getGeminiAnalysis(inputValues, output)
        .then(text => {
          setGeminiText(text)
          setGeminiLoading(false)
        })
        .catch(err => {
          console.error('Gemini error:', err)
          setGeminiError('Error: ' + err.message)
          setGeminiLoading(false)
        })

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }, 400)
  }

  function handleReset() {
    setResults(null)
    setInputs(null)
    setGeminiText('')
    setGeminiError(null)
    setGeminiLoading(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="header-dot" />
          <h1 style={{ fontSize: '16px' }}>Water Quality Analysis</h1>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '1px' }}>
          12 MODELS
        </div>
      </div>

      <div className="container">

        {/* Input section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ marginBottom: '4px' }}>Sample Input</h2>
            <p style={{ fontSize: '12px', color: 'var(--text2)' }}>
              Enter water quality parameters — leave blank to use dataset median
            </p>
          </div>
          <div className="card">
            <InputForm onPredict={handlePredict} loading={loading} />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text2)' }}>
            Running models...
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div id="results">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>Results</h2>
              <button
                onClick={handleReset}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font)',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius)',
                }}
              >
                ← New Sample
              </button>
            </div>
            <Dashboard
              results={results}
              inputs={inputs}
              geminiText={geminiText}
              geminiLoading={geminiLoading}
              geminiError={geminiError}
            />
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--border)',
          marginTop: '48px',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>
            Water Quality Analysis — College Project
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>
            Dataset: waterQuality.csv — 3276 samples
          </span>
        </div>

      </div>
    </div>
  )
}