import './SevenSegment.css'

type SegKey = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

const DIGIT_SEGMENTS: Record<string, SegKey[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  '-': ['g'],
  ' ': [],
}

const W = 44
const H = 76
const S = 9
const PAD = S / 2 + 3

function hSeg(x0: number, x1: number, y: number, s: number) {
  const half = s / 2
  return `${x0},${y} ${x0 + half},${y - half} ${x1 - half},${y - half} ${x1},${y} ${x1 - half},${y + half} ${x0 + half},${y + half}`
}
function vSeg(x: number, y0: number, y1: number, s: number) {
  const half = s / 2
  return `${x},${y0} ${x + half},${y0 + half} ${x + half},${y1 - half} ${x},${y1} ${x - half},${y1 - half} ${x - half},${y0 + half}`
}

const midY = H / 2
const SEGMENT_POINTS: Record<SegKey, string> = {
  a: hSeg(0, W, 0, S),
  g: hSeg(0, W, midY, S),
  d: hSeg(0, W, H, S),
  f: vSeg(0, 0, midY, S),
  b: vSeg(W, 0, midY, S),
  e: vSeg(0, midY, H, S),
  c: vSeg(W, midY, H, S),
}

const ALL_SEGMENTS: SegKey[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

export interface SevenSegmentDigitProps {
  value: string
  litColor: string
  dimColor?: string
  heightPx?: number
  glow?: boolean
}

export function SevenSegmentDigit({
  value,
  litColor,
  dimColor = 'rgba(255,255,255,0.05)',
  heightPx = 64,
  glow = true,
}: SevenSegmentDigitProps) {
  const lit = new Set(DIGIT_SEGMENTS[value] ?? [])
  const widthPx = (heightPx * (W + PAD * 2)) / (H + PAD * 2)
  return (
    <svg
      className="rd-sevenseg-digit"
      viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}`}
      width={widthPx}
      height={heightPx}
      style={{ overflow: 'visible' }}
    >
      {ALL_SEGMENTS.map((seg) => (
        <polygon
          key={seg}
          points={SEGMENT_POINTS[seg]}
          fill={lit.has(seg) ? litColor : dimColor}
          className={lit.has(seg) && glow ? 'rd-sevenseg-lit' : undefined}
          style={lit.has(seg) && glow ? { filter: `drop-shadow(0 0 4px ${litColor})` } : undefined}
        />
      ))}
    </svg>
  )
}

export interface SevenSegmentGroupProps {
  text: string
  litColor: string
  dimColor?: string
  heightPx?: number
  glow?: boolean
  gapPx?: number
}

export function SevenSegmentGroup({ text, litColor, dimColor, heightPx = 64, glow = true, gapPx = 4 }: SevenSegmentGroupProps) {
  return (
    <div className="rd-sevenseg-group" style={{ gap: gapPx }}>
      {text.split('').map((ch, i) => (
        <SevenSegmentDigit
          key={i}
          value={/[0-9\- ]/.test(ch) ? ch : ' '}
          litColor={litColor}
          dimColor={dimColor}
          heightPx={heightPx}
          glow={glow}
        />
      ))}
    </div>
  )
}
