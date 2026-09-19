import { SevenSegmentGroup } from './SevenSegment'
import './DigitalSpeed.css'

export interface DigitalSpeedProps {
  speedKph: number
  unit?: string
  source?: 'OBD' | 'GPS'
  showSource?: boolean
  heightPx?: number
}

export function DigitalSpeed({ speedKph, unit = 'km/h', source, showSource = false, heightPx = 110 }: DigitalSpeedProps) {
  const rounded = Math.round(speedKph)
  const text = String(Math.min(999, Math.max(0, rounded))).padStart(3, '0')
  return (
    <div className="rd-digitalspeed">
      <SevenSegmentGroup text={text} litColor="var(--cl-primary-bright)" heightPx={heightPx} gapPx={6} />
      <div className="rd-digitalspeed-unit">{unit}</div>
      <div className="rd-digitalspeed-source">{showSource && source ? `SOURCE: ${source}` : ' '}</div>
    </div>
  )
}
