import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useVehicleStore } from '@/state/vehicleStore'
import { diagnosticAssistant } from '@/simulator/diagnosticEngine'
import type { AiAnalysisResult } from '@/types/diagnostics'
import './mobile.css'

export function DiagnosticDetailScreen({ code }: { code: string }) {
  const dtc = useVehicleStore((s) => s.dtcs).find((d) => d.code === code)
  const [checked, setChecked] = useState<boolean[]>([])
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const checklist = useMemo(() => dtc?.recommendedChecks ?? [], [dtc])

  if (!dtc) return <div className="rd-m-empty">CODE NOT FOUND</div>

  const isChecked = (i: number) => checked[i] ?? false
  const toggle = (i: number) => {
    const next = [...checked]
    next[i] = !next[i]
    setChecked(next)
  }

  const runAnalysis = () => {
    setAnalyzing(true)
    window.setTimeout(() => {
      setAnalysis(diagnosticAssistant.analyze(dtc))
      setAnalyzing(false)
    }, 550)
  }

  return (
    <div>
      <div className="rd-m-card">
        <div style={{ fontSize: 24, fontWeight: 700 }}>{dtc.code}</div>
        <div style={{ fontSize: 14, color: '#cfd8d2', marginTop: 4 }}>{dtc.description}</div>
        <div style={{ fontSize: 11, color: '#6c786f', marginTop: 10 }}>
          First observed: {new Date(dtc.timestamp).toLocaleString()}
          <br />
          Last observed: {new Date(dtc.lastObserved).toLocaleString()}
        </div>
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">EVIDENCE</div>
        {dtc.evidence.map((e) => (
          <div className="rd-m-row" key={e.label}>
            <span className="rd-m-row-label">{e.label}</span>
            <span className="rd-m-row-value">{e.value}</span>
          </div>
        ))}
      </div>

      {dtc.freezeFrame && (
        <div className="rd-m-card">
          <div className="rd-m-card-title">FREEZE FRAME</div>
          <div className="rd-m-row"><span className="rd-m-row-label">RPM</span><span className="rd-m-row-value">{dtc.freezeFrame.rpm}</span></div>
          <div className="rd-m-row"><span className="rd-m-row-label">Speed</span><span className="rd-m-row-value">{dtc.freezeFrame.speedKph.toFixed(0)} km/h</span></div>
          <div className="rd-m-row"><span className="rd-m-row-label">Coolant</span><span className="rd-m-row-value">{dtc.freezeFrame.coolantTempC.toFixed(0)}&deg;C</span></div>
          <div className="rd-m-row"><span className="rd-m-row-label">Load</span><span className="rd-m-row-value">{dtc.freezeFrame.engineLoadPercent.toFixed(0)}%</span></div>
        </div>
      )}

      <div className="rd-m-card">
        <div className="rd-m-card-title">INSPECTION CHECKLIST</div>
        {checklist.map((c, i) => (
          <div className="rd-m-checklist-item" key={c} onClick={() => toggle(i)}>
            <div className={`rd-m-checkbox${isChecked(i) ? ' checked' : ''}`}>{isChecked(i) ? '✓' : ''}</div>
            <span style={{ textDecoration: isChecked(i) ? 'line-through' : 'none', color: isChecked(i) ? '#6c786f' : '#cfd8d2' }}>{c}</span>
          </div>
        ))}
      </div>

      <div className="rd-m-card">
        <div className="rd-m-card-title">AI-ASSISTED GUIDANCE</div>
        {!analysis && (
          <button className="rd-m-btn primary" onClick={runAnalysis} disabled={analyzing} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={14} /> {analyzing ? 'ANALYZING...' : 'RUN AI ANALYSIS'}
          </button>
        )}
        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#cfd8d2' }}>
            <div>{analysis.summary}</div>
            <div>
              <div style={{ fontSize: 11, color: '#6c786f', marginBottom: 4 }}>POSSIBLE CAUSES</div>
              {analysis.possibleCauses.map((c) => (
                <div key={c}>&bull; {c}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6c786f', marginBottom: 4 }}>RECOMMENDED INSPECTION ORDER</div>
              {analysis.recommendedOrder.map((c, i) => (
                <div key={c}>{i + 1}. {c}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6c786f', marginBottom: 4 }}>WHAT NOT TO DO</div>
              {analysis.whatNotToDo.map((c) => (
                <div key={c} style={{ color: '#e0a33a' }}>&bull; {c}</div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#5f6b64', fontStyle: 'italic', marginTop: 4 }}>{analysis.disclaimer}</div>
          </div>
        )}
      </div>
    </div>
  )
}
